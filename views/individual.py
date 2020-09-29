"""
Individual view
"""
import re
import itertools
from typing import List, Tuple
import psycopg2
from sqlalchemy import func, literal_column
from sqlalchemy.dialects.postgresql import aggregate_order_by
import db.helpers
import ujson as json
from collections import Counter
from flask import session, jsonify, request
from db.model import Individual, UserIndividual
from views import application
from views.auth import requires_auth, requires_admin, is_demo_user, USER, ADMIN_USER
from views.exceptions import PhenopolisException
from views.helpers import _get_json_payload
from views.postgres import postgres_cursor, get_db, get_db_session
from views.general import process_for_display

MAX_PAGE_SIZE = 100


@application.route("/individual")
@requires_auth
def get_all_individuals():
    try:
        limit, offset = _get_pagination_parameters()
        if limit > MAX_PAGE_SIZE:
            return (
                jsonify(message="The maximum page size for individuals is {}".format(MAX_PAGE_SIZE)),
                400,
            )
        individuals_and_users = _fetch_all_individuals(offset=offset, limit=limit)
        results = []
        for i, ui in individuals_and_users:
            individual_dict = i.as_dict()
            individual_dict["users"] = ui
            results.append(individual_dict)
    except PhenopolisException as e:
        return jsonify(success=False, message=str(e)), e.http_status
    return jsonify(results), 200


def _get_pagination_parameters():
    try:
        offset = int(request.args.get("offset", 0))
        limit = int(request.args.get("limit", 10))
    except ValueError as e:
        raise PhenopolisException(str(e), 500)
    return limit, offset


@application.route("/<language>/individual/<individual_id>")
@application.route("/<language>/individual/<individual_id>/<subset>")
@application.route("/individual/<individual_id>")
@application.route("/individual/<individual_id>/<subset>")
@requires_auth
def get_individual_by_id(individual_id, subset="all", language="en"):
    config = db.helpers.query_user_config(language=language, entity="individual")
    individual = _fetch_authorized_individual(individual_id)
    # unauthorized access to individual
    if not individual:
        return (
            jsonify(message="Sorry, either the patient does not exist or you are not permitted to see this patient"),
            404,
        )

    if subset == "preview":
        return jsonify(_individual_preview(config, individual)), 200
    else:
        return jsonify(_individual_complete_view(config, individual, subset)), 200


@application.route("/<language>/update_patient_data/<individual_id>", methods=["POST"])
@application.route("/update_patient_data/<individual_id>", methods=["POST"])
@requires_auth
def update_patient_data(individual_id, language="en"):
    if is_demo_user():
        return jsonify(error="Demo user not authorised"), 405
    config = db.helpers.query_user_config(language=language, entity="individual")
    individual = _fetch_authorized_individual(individual_id)
    # unauthorized access to individual
    if not individual:
        config[0]["preview"] = [["Sorry", "You are not permitted to edit this patient"]]
        return json.dumps(config)

    application.logger.debug(request.form)
    consanguinity = request.form.get("consanguinity_edit[]")
    gender = request.form.get("gender_edit[]")
    genes = request.form.getlist("genes[]")
    features = request.form.getlist("feature[]")
    if not len(features):
        features = ["All"]

    # TODO: simplfy this gender translation
    gender = {"male": "M", "female": "F", "unknown": "U"}.get(gender, "unknown")
    hpos = _get_hpos(features)

    _update_individual(consanguinity, gender, genes, hpos, individual)
    return jsonify({"success": True}), 200


@application.route("/individual", methods=["POST"])
@requires_auth
def create_individual():
    if is_demo_user():
        return jsonify(error="Demo user not authorised"), 405

    # checks individuals validity
    db_session = get_db_session()

    try:
        new_individuals = _get_json_payload(Individual)
        for i in new_individuals:
            _check_individual_valid(i, db_session)
    except PhenopolisException as e:
        application.logger.error(str(e))
        return jsonify(success=False, error=str(e)), e.http_status

    request_ok = True
    message = "Individuals were created"
    ids_new_individuals = []
    try:
        # generate a new unique id for the individual
        for i in new_individuals:
            new_internal_id = _get_new_individual_id(db_session)
            i.internal_id = new_internal_id
            ids_new_individuals.append(new_internal_id)
            # insert individual
            db_session.add(i)
            # add entry to user_individual
            # TODO: enable access to more users than the creator
            db_session.add(UserIndividual(user=session[USER], internal_id=i.internal_id))
        db_session.commit()
    except PhenopolisException as e:
        db_session.rollback()
        application.logger.exception(e)
        request_ok = False
        message = str(e)
        http_status = e.http_status
    finally:
        db_session.close()

    if not request_ok:
        return jsonify(success=False, message=message), http_status
    else:
        return jsonify(success=True, message=message, id=",".join(ids_new_individuals)), 200


def _check_individual_valid(new_individual: Individual, sqlalchemy_session):
    if new_individual is None:
        raise PhenopolisException("Null individual", 400)

    exist_internal_id = (
        sqlalchemy_session.query(Individual.external_id)
        .filter(Individual.external_id == new_individual.external_id)
        .all()
    )

    if len(exist_internal_id) > 0:
        raise PhenopolisException("Individual is already exist.", 400)
    # TODOe: add more validations here


def _get_new_individual_id(sqlalchemy_session):
    # NOTE: this is not robust if the database contains ids other than PH + 8 digits
    latest_internal_id = (
        sqlalchemy_session.query(Individual.internal_id)
        .filter(Individual.internal_id.like("PH%"))
        .order_by(Individual.internal_id.desc())
        .first()
    )
    matched_id = re.compile(r"^PH(\d{8})$").match(latest_internal_id[0])
    if matched_id:
        return "PH{}".format(str(int(matched_id.group(1)) + 1).zfill(8))  # pads with 0s
    else:
        raise PhenopolisException("Failed to fetch the latest internal id for an individual", 500)


# def _get_hpo_ids_per_gene(variants, _ind):
#     # TODO: understand what this function is supposed to return because right now it is querying the db but
#     # TODO: it does not return anything new
#     # TODO: and why this unused '_ind' arg?
#     c = postgres_cursor()
#     for y in variants:
#         c.execute("""select * from gene_hpo where gene_symbol=%(gene_symbol)s """, {"gene_symbol": y["gene_symbol"]})
#         # gene_hpo_ids = db.helpers.cursor2dict(c)
#         # y['hpo_,terms']=[{'display': c.execute("select hpo_name from hpo where hpo_id=? limit 1",(gh['hpo_id'],))
#         # .fetchone()[0], 'end_href':gh['hpo_id']} for gh in gene_hpo_ids if gh['hpo_id'] in
#         # ind['ancestor_observed_features'].split(';')]
#         y["hpo_,terms"] = []
#     return variants


def _individual_complete_view(config, individual: Individual, subset):
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
        return config
    else:
        return [{subset: y[subset]} for y in config]


def _individual_preview(config, individual: Individual):
    cursor = postgres_cursor()
    hom_count = _count_homozygous_variants(cursor, individual)
    het_count = _count_heterozygous_variants(cursor, individual)
    comp_het_count = _count_compound_heterozygous_variants(cursor, individual)
    config[0]["preview"] = [
        ["External_id", individual.external_id],
        ["Sex", individual.sex],
        ["Genes", [g for g in individual.genes.split(",") if g != ""]],
        ["Features", [f for f in individual.simplified_observed_features_names.split(",") if f != ""]],
        ["Number of hom variants", hom_count],
        ["Number of compound hets", comp_het_count],
        ["Number of het variants", het_count],
    ]
    cursor.close()
    return config


def _count_compound_heterozygous_variants(c, individual: Individual):
    c.execute(
        """select count (1) from (select count(1) from het_variants hv, variants v
    where hv."CHROM"=v."CHROM" and hv."POS"=v."POS" and hv."REF"=v."REF" and hv."ALT"=v."ALT" and
    hv.individual=%(external_id)s group by v.gene_symbol having count(v.gene_symbol)>1) as t """,
        {"external_id": individual.external_id},
    )
    comp_het_count = c.fetchone()[0]
    return comp_het_count


def _count_heterozygous_variants(c, individual: Individual):
    c.execute(
        """select count(1)
       from het_variants hv, variants v
       where
       hv."CHROM"=v."CHROM"
       and hv."POS"=v."POS"
       and hv."REF"=v."REF"
       and hv."ALT"=v."ALT"
       and hv.individual=%(external_id)s """,
        {"external_id": individual.external_id},
    )
    het_count = c.fetchone()[0]
    return het_count


def _count_homozygous_variants(c, individual: Individual):
    c.execute(
        """select count(1)
       from hom_variants hv, variants v
       where hv."CHROM"=v."CHROM"
       and hv."POS"=v."POS"
       and hv."REF"=v."REF"
       and hv."ALT"=v."ALT"
       and hv.individual=%(external_id)s """,
        {"external_id": individual.external_id},
    )
    hom_count = c.fetchone()[0]
    return hom_count


def _map_individual2output(config, individual: Individual):
    config[0]["metadata"]["data"][0]["sex"] = individual.sex
    config[0]["metadata"]["data"][0]["consanguinity"] = individual.consanguinity
    config[0]["metadata"]["data"][0]["ethnicity"] = individual.ethnicity
    config[0]["metadata"]["data"][0]["pi"] = individual.pi
    config[0]["metadata"]["data"][0]["internal_id"] = [{"display": individual.internal_id}]
    config[0]["metadata"]["data"][0]["external_id"] = individual.external_id
    config[0]["metadata"]["data"][0]["simplified_observed_features"] = [
        {"display": i, "end_href": j}
        for i, j, in zip(
            individual.simplified_observed_features_names.split(";") if individual.simplified_observed_features_names else [],
            individual.simplified_observed_features.split(",") if individual.simplified_observed_features else [],
        )
        if i != ""
    ]
    genes = individual.genes.split(",") if individual.genes else []
    config[0]["metadata"]["data"][0]["genes"] = [
        {"display": i} for i in genes if i != ""
    ]
    return config


def _get_heterozygous_variants(c, individual: Individual):
    c.execute(
        """select v.*
      from het_variants hv, variants v
      where
      hv."CHROM"=v."CHROM"
      and hv."POS"=v."POS"
      and hv."REF"=v."REF"
      and hv."ALT"=v."ALT"
      and hv.individual=%(external_id)s """,
        {"external_id": individual.external_id},
    )
    rare_variants = db.helpers.cursor2dict(c)
    # TODO: confirm if this needs to be enabled once the function has been corrected
    # rare_variants = get_hpo_ids_per_gene(rare_variants, individual)
    return rare_variants


def _get_homozygous_variants(c, individual: Individual):
    c.execute(
        """select v.*
       from hom_variants hv, variants v
       where hv."CHROM"=v."CHROM"
       and hv."POS"=v."POS"
       and hv."REF"=v."REF"
       and hv."ALT"=v."ALT"
       and hv.individual=%(external_id)s """,
        {"external_id": individual.external_id},
    )
    hom_variants = db.helpers.cursor2dict(c)
    # TODO: confirm if this needs to be enabled once the function has been corrected
    # hom_variants = get_hpo_ids_per_gene(hom_variants, individual)
    return hom_variants


def _fetch_all_individuals(offset, limit) -> List[Tuple[Individual, List[str]]]:
    """
    For admin users it returns all individuals and all users having access to them.
    But for other than admin it returns only individuals which this user has access, other users having access are
    not returned
    """
    db_session = get_db_session()
    user_id = session[USER]
    query = db_session.query(
        Individual, func.string_agg(UserIndividual.user, aggregate_order_by(literal_column("','"), UserIndividual.user))
    ).filter(Individual.internal_id == UserIndividual.internal_id)
    if user_id != ADMIN_USER:
        query = query.filter(UserIndividual.user == user_id)
    individuals = query.group_by(Individual).order_by(Individual.internal_id.desc()).offset(offset).limit(limit).all()

    return [(i, u.split(",")) for i, u in individuals]


def _fetch_authorized_individual(individual_id) -> Individual:
    db_session = get_db_session()
    return db_session.query(Individual).join(UserIndividual)\
        .filter(UserIndividual.user == session[USER]).filter(Individual.internal_id == individual_id).first()


def _update_individual(consanguinity, gender, genes, hpos, individual: Individual):

    # update
    # features to hpo ids
    individual.sex = gender
    individual.consanguinity = consanguinity
    individual.observed_features = ",".join([h["hpo_id"] for h in hpos])
    individual.observed_features_names = ";".join([h["hpo_name"] for h in hpos])
    individual.ancestor_observed_features = ";".join(
        sorted(list(set(list(itertools.chain.from_iterable([h["hpo_ancestor_ids"].split(";") for h in hpos])))))
    )
    individual.genes = ",".join([x for x in genes])

    db_session = get_db_session()
    try:
        db_session.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        application.logger.exception(error)
        db_session.rollback()


def _get_hpos(features):
    c = postgres_cursor()
    hpos = []
    # TODO: this could be improved using a query with "hpo_name IN features"
    for feature in features:
        c.execute("select * from hpo where hpo_name=%(feature)s limit 1", {"feature": feature})
        hpos.append(dict(zip(["hpo_id", "hpo_name", "hpo_ancestor_ids", "hpo_ancestor_names"], c.fetchone())))
    c.close()
    return hpos


@application.route("/<language>/individual/<individual_id>", methods=["DELETE"])
@application.route("/individual/<individual_id>", methods=["DELETE"])
@requires_admin
def delete_individual(individual_id, language="en"):

    individual = _fetch_authorized_individual(individual_id)

    request_ok = True
    message = "Patient " + individual_id + " has been deleted."

    if individual:
        try:
            db_session = get_db_session()
            db_session.delete(individual)
            db_session.query(UserIndividual.internal_id).filter(UserIndividual.internal_id == individual_id).delete()
            db_session.commit()
        except PhenopolisException as e:
            db_session.rollback()
            application.logger.exception(e)
            request_ok = False
            message = str(e)
            http_status = e.http_status
        finally:
            db_session.close()
    else:
        request_ok = False
        message = "Patient " + individual_id + " does not exist."

    if not request_ok:
        return jsonify(success=False, message=message), http_status
    else:
        return jsonify(success=True, message=message), 200
