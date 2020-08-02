"""
Individual view
"""
import re
import itertools
import psycopg2
import db.helpers
import ujson as json
from collections import Counter
from flask import session, jsonify, request

from db import Individual, User_Individual
from views import application
from views.auth import requires_auth
from views.exceptions import PhenopolisException
from views.helpers import _get_json_payload, _parse_payload
from views.postgres import postgres_cursor, get_db, get_db_session
from views.general import process_for_display


@application.route("/<language>/individual/<individual_id>")
@application.route("/<language>/individual/<individual_id>/<subset>")
@application.route("/individual/<individual_id>")
@application.route("/individual/<individual_id>/<subset>")
@requires_auth
def individual(individual_id, subset="all", language="en"):
    config = db.helpers.query_user_config(language=language, entity="individual")
    individual = _fetch_authorized_individual(individual_id)
    # unauthorized access to individual
    if not individual:
        config[0]["preview"] = [["Sorry", "You are not permitted to see this patient"]]
        return json.dumps(config)

    application.logger.debug(individual)

    if subset == "preview":
        return _individual_preview(config, individual)
    else:
        return _individual_complete_view(config, individual, subset)


@application.route("/<language>/update_patient_data/<individual_id>", methods=["POST"])
@application.route("/update_patient_data/<individual_id>", methods=["POST"])
@requires_auth
def update_patient_data(individual_id, language="en"):
    if session["user"] == "demo":
        return jsonify(error="Demo user not authorised"), 405
    config = db.helpers.query_user_config(language=language, entity="individual")
    individual = _fetch_authorized_individual(individual_id)
    # unauthorized access to individual
    if not individual:
        config[0]["preview"] = [["Sorry", "You are not permitted to edit this patient"]]
        return json.dumps(config)

    application.logger.debug(request.form)
    consanguinity = request.form.getlist("consanguinity_edit[]")[0]
    gender = request.form.getlist("gender_edit[]")[0]
    genes = request.form.getlist("genes[]")
    features = request.form.getlist("feature[]")
    if not len(features):
        features = ["All"]
    gender = {"male": "M", "female": "F", "unknown": "U"}.get(gender, "unknown")
    hpos = _get_hpos(features)

    _update_individual(consanguinity, gender, genes, hpos, individual)
    # print(c.execute("select * from individuals where external_id=?",(ind['external_id'],)).fetchall())
    return jsonify({"success": True}), 200


@application.route("/individual", methods=["POST"])
@requires_auth
def create_individual():
    if session["user"] == "demo":
        return jsonify(error="Demo user not authorised"), 405

    try:
        payload = _get_json_payload()
    except PhenopolisException as e:
        return jsonify(success=False, error=str(e)), 400

    # parse the JSON data into an individual, non existing fields will trigger a TypeError
    try:
        new_individuals = _parse_payload(payload, Individual)
    except TypeError as e:
        application.logger.error(str(e))
        return jsonify(success=False, error=str(e)), 400

    # checks individuals validity
    try:
        for i in new_individuals:
            _check_individual_valid(i)
    except PhenopolisException as e:
        application.logger.error(str(e))
        return jsonify(success=False, error=str(e)), 400

    sqlalchemy_session = get_db_session()
    request_ok = True
    message = "Individuals were created"
    ids_new_individuals = []
    try:
        # generate a new unique id for the individual
        for i in new_individuals:
            new_internal_id = _get_new_individual_id(sqlalchemy_session)
            i.internal_id = new_internal_id
            ids_new_individuals.append(new_internal_id)
            # insert individual
            sqlalchemy_session.add(i)
            # add entry to user_individual
            # TODO: enable access to more users than the creator
            sqlalchemy_session.add(User_Individual(user=session["user"], internal_id=i.internal_id))
        sqlalchemy_session.commit()
    except Exception as e:
        sqlalchemy_session.rollback()
        application.logger.exception(e)
        request_ok = False
        message = str(e)
    finally:
        sqlalchemy_session.close()

    if not request_ok:
        return jsonify(success=False, message=message), 500
    else:
        return jsonify(success=True, message=message, id=",".join(ids_new_individuals)), 200


def _check_individual_valid(new_individual: Individual):
    if new_individual is None:
        raise PhenopolisException("Null individual")
    # TODO: add more validations here


def _get_new_individual_id(sqlalchemy_session):
    # NOTE: this is not robust if the database contains ids other than PH + 8 digits
    latest_internal_id = (
        sqlalchemy_session.query(Individual.internal_id)
        .filter(Individual.internal_id.like("PH%"))
        .order_by(Individual.internal_id.desc())
        .first()
    )
    matched_id = re.compile("^PH(\d{8})$").match(latest_internal_id[0])
    if matched_id:
        return "PH{}".format(str(int(matched_id.group(1)) + 1).zfill(8))  # pads with 0s
    else:
        raise PhenopolisException("Failed to fetch the latest internal id for an individual")


def _get_hpo_ids_per_gene(variants, ind):
    # TODO: understand what this function is supposed to return because right now it is querying the db but
    # TODO: it does not return anything new
    c = postgres_cursor()
    for y in variants:
        c.execute(""" select * from gene_hpo where gene_symbol=%(gene_symbol)s """, {"gene_symbol": y["gene_symbol"]})
        # gene_hpo_ids = db.helpers.cursor2dict(c)
        # y['hpo_,terms']=[{'display': c.execute("select hpo_name from hpo where hpo_id=? limit 1",(gh['hpo_id'],))
        # .fetchone()[0], 'end_href':gh['hpo_id']} for gh in gene_hpo_ids if gh['hpo_id'] in
        # ind['ancestor_observed_features'].split(';')]
        y["hpo_,terms"] = []
    return variants


def _individual_complete_view(config, individual, subset):
    cursor = postgres_cursor()
    # hom variants
    hom_variants = _get_homozygous_variants(cursor, individual)
    config[0]["rare_homs"]["data"] = hom_variants
    # rare variants
    rare_variants = _get_heterozygous_variants(cursor, individual)
    config[0]["rare_variants"]["data"] = rare_variants
    # rare_comp_hets
    gene_counter = Counter([v["gene_symbol"] for v in config[0]["rare_variants"]["data"]])
    rare_comp_hets_variants = [v for v in config[0]["rare_variants"]["data"] if gene_counter[v["gene_symbol"]] > 1]
    cursor.close()

    # TODO: confirm if this needs to be enabled once the function has been corrected
    # rare_comp_hets_variants = _get_hpo_ids_per_gene(rare_comp_hets_variants, individual)
    config[0]["rare_comp_hets"]["data"] = rare_comp_hets_variants
    if not config[0]["metadata"]["data"]:
        config[0]["metadata"]["data"] = [dict()]
    config = _map_individual2output(config, individual)
    process_for_display(config[0]["rare_homs"]["data"])
    process_for_display(config[0]["rare_variants"]["data"])
    if subset == "all":
        return json.dumps(config)
    else:
        return json.dumps([{subset: y[subset]} for y in config])


def _individual_preview(config, individual):
    cursor = postgres_cursor()
    hom_count = _count_homozygous_variants(cursor, individual)
    het_count = _count_heterozygous_variants(cursor, individual)
    comp_het_count = _count_compound_heterozygous_variants(cursor, individual)
    config[0]["preview"] = [
        ["External_id", individual["external_id"]],
        ["Sex", individual["sex"]],
        ["Genes", [g for g in individual.get("genes", "").split(",")]],
        ["Features", [f for f in individual["simplified_observed_features_names"].split(",")]],
        ["Number of hom variants", hom_count],
        ["Number of compound hets", comp_het_count],
        ["Number of het variants", het_count],
    ]
    cursor.close()
    return json.dumps(config)


def _count_compound_heterozygous_variants(c, individual):
    c.execute(
        """ select count (1) from (select count(1) from het_variants hv, variants v
    where hv."CHROM"=v."CHROM" and hv."POS"=v."POS" and hv."REF"=v."REF" and hv."ALT"=v."ALT" and
    hv.individual=%(external_id)s group by v.gene_symbol having count(v.gene_symbol)>1) as t """,
        {"external_id": individual["external_id"]},
    )
    comp_het_count = c.fetchone()[0]
    return comp_het_count


def _count_heterozygous_variants(c, individual):
    c.execute(
        """ select count(1)
       from het_variants hv, variants v
       where
       hv."CHROM"=v."CHROM"
       and hv."POS"=v."POS"
       and hv."REF"=v."REF"
       and hv."ALT"=v."ALT"
       and hv.individual=%(external_id)s """,
        {"external_id": individual["external_id"]},
    )
    het_count = c.fetchone()[0]
    return het_count


def _count_homozygous_variants(c, individual):
    c.execute(
        """ select count(1)
       from hom_variants hv, variants v
       where hv."CHROM"=v."CHROM"
       and hv."POS"=v."POS"
       and hv."REF"=v."REF"
       and hv."ALT"=v."ALT"
       and hv.individual=%(external_id)s """,
        {"external_id": individual["external_id"]},
    )
    hom_count = c.fetchone()[0]
    return hom_count


def _map_individual2output(config, individual):
    config[0]["metadata"]["data"][0]["sex"] = individual["sex"]
    config[0]["metadata"]["data"][0]["consanguinity"] = individual.get("consanguinity")
    config[0]["metadata"]["data"][0]["ethnicity"] = individual.get("ethnicity")
    config[0]["metadata"]["data"][0]["pi"] = individual.get("pi")
    config[0]["metadata"]["data"][0]["internal_id"] = [{"display": individual["internal_id"]}]
    config[0]["metadata"]["data"][0]["external_id"] = individual["external_id"]
    config[0]["metadata"]["data"][0]["simplified_observed_features"] = [
        {"display": i, "end_href": j}
        for i, j, in zip(
            individual["simplified_observed_features_names"].split(";"),
            individual["simplified_observed_features"].split(","),
        )
    ]
    config[0]["metadata"]["data"][0]["genes"] = [{"display": i} for i in individual.get("genes", "").split(",")]
    return config


def _get_heterozygous_variants(c, individual):
    c.execute(
        """ select v.*
      from het_variants hv, variants v
      where
      hv."CHROM"=v."CHROM"
      and hv."POS"=v."POS"
      and hv."REF"=v."REF"
      and hv."ALT"=v."ALT"
      and hv.individual=%(external_id)s """,
        {"external_id": individual["external_id"]},
    )
    rare_variants = db.helpers.cursor2dict(c)
    # TODO: confirm if this needs to be enabled once the function has been corrected
    # rare_variants = get_hpo_ids_per_gene(rare_variants, individual)
    return rare_variants


def _get_homozygous_variants(c, individual):
    c.execute(
        """ select v.*
       from hom_variants hv, variants v
       where hv."CHROM"=v."CHROM"
       and hv."POS"=v."POS"
       and hv."REF"=v."REF"
       and hv."ALT"=v."ALT"
       and hv.individual=%(external_id)s """,
        {"external_id": individual["external_id"]},
    )
    hom_variants = db.helpers.cursor2dict(c)
    # TODO: confirm if this needs to be enabled once the function has been corrected
    # hom_variants = get_hpo_ids_per_gene(hom_variants, individual)
    return hom_variants


def _fetch_authorized_individual(individual_id):
    c = postgres_cursor()
    c.execute(
        """ select i.*
           from users_individuals as ui, individuals as i
           where
           i.internal_id=ui.internal_id
           and ui.user=%(user)s
           and ui.internal_id=%(individual)s
           """,
        {"user": session["user"], "individual": individual_id},
    )
    individual = db.helpers.cursor2one_dict(c)
    c.close()
    return individual


def _update_individual(consanguinity, gender, genes, hpos, individual):
    # update
    # features to hpo ids
    individual["sex"] = gender
    individual["consanguinity"] = consanguinity
    individual["observed_features"] = ",".join([h["hpo_id"] for h in hpos])
    individual["observed_features_names"] = ";".join([h["hpo_name"] for h in hpos])
    individual["simplified_observed_features"] = individual["observed_features"]
    individual["simplified_observed_features_names"] = individual["observed_features_names"]
    individual["unobserved_features"] = ""
    individual["ancestor_observed_features"] = ";".join(
        sorted(list(set(list(itertools.chain.from_iterable([h["hpo_ancestor_ids"].split(";") for h in hpos])))))
    )
    individual["genes"] = ",".join([x for x in genes])
    application.logger.info("UPDATE: {}".format(individual))
    c = postgres_cursor()
    try:
        c.execute(
            """update individuals set
           sex=%(sex)s,
           consanguinity=%(consanguinity)s,
           observed_features=%(observed_features)s,
           observed_features_names=%(observed_features_names)s,
           simplified_observed_features=%(simplified_observed_features)s,
           simplified_observed_features_names=%(simplified_observed_features_names)s,
           ancestor_observed_features=%(ancestor_observed_features)s,
           unobserved_features=%(unobserved_features)s,
           genes=%(genes)s
           where external_id=%(external_id)s""",
            {
                "sex": individual["sex"],
                "consanguinity": individual["consanguinity"],
                "observed_features": individual["observed_features"],
                "observed_features_names": individual["observed_features_names"],
                "simplified_observed_features": individual["simplified_observed_features"],
                "simplified_observed_features_names": individual["simplified_observed_features_names"],
                "ancestor_observed_features": individual["ancestor_observed_features"],
                "unobserved_features": individual["unobserved_features"],
                "genes": individual["genes"],
                "external_id": individual["external_id"],
            },
        )
        get_db().commit()
        c.close()
    except (Exception, psycopg2.DatabaseError) as error:
        application.logger.exception(error)
        get_db().rollback()
    finally:
        c.close()


def _get_hpos(features):
    c = postgres_cursor()
    hpos = []
    # TODO: this could be improved using a query with "hpo_name IN features"
    for feature in features:
        c.execute("select * from hpo where hpo_name=%(feature)s limit 1", {"feature": feature})
        hpos.append(dict(zip(["hpo_id", "hpo_name", "hpo_ancestor_ids", "hpo_ancestor_names"], c.fetchone())))
    c.close()
    return hpos
