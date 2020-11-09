"""
Individual view
"""
import re
import itertools
from typing import List, Tuple
from sqlalchemy import func, literal_column, and_
from sqlalchemy.dialects.postgresql import aggregate_order_by
from sqlalchemy.orm import Session

import db.helpers
import ujson as json
from collections import Counter
from flask import session, jsonify, request
from db.model import Individual, UserIndividual, Variant, HomozygousVariant, HeterozygousVariant, HPO, Sex
from views import application
from views.auth import requires_auth, requires_admin, is_demo_user, USER, ADMIN_USER
from views.exceptions import PhenopolisException
from views.helpers import _get_json_payload
from views.postgres import session_scope
from bidict import bidict
from views.general import process_for_display, cache_on_browser

MAPPING_SEX_REPRESENTATIONS = bidict({"male": Sex.M, "female": Sex.F, "unknown": Sex.U})
MAX_PAGE_SIZE = 100000


@application.route("/individual")
@requires_auth
def get_all_individuals():
    with session_scope() as db_session:
        try:
            limit, offset = _get_pagination_parameters()
            if limit > MAX_PAGE_SIZE:
                return (
                    jsonify(message="The maximum page size for individuals is {}".format(MAX_PAGE_SIZE)),
                    400,
                )
            individuals_and_users = _fetch_all_individuals(db_session=db_session, offset=offset, limit=limit)
            results = []
            for i, ui in individuals_and_users:
                individual_dict = i.as_dict()
                individual_dict["users"] = ui
                results.append(individual_dict)
        except PhenopolisException as e:
            return jsonify(success=False, message=str(e)), e.http_status
    return jsonify(results), 200


@application.route("/<language>/individual/<individual_id>")
@application.route("/<language>/individual/<individual_id>/<subset>")
@application.route("/individual/<individual_id>")
@application.route("/individual/<individual_id>/<subset>")
@requires_auth
@cache_on_browser()
def get_individual_by_id(individual_id, subset="all", language="en"):
    with session_scope() as db_session:
        config = db.helpers.query_user_config(db_session=db_session, language=language, entity="individual")
        individual = _fetch_authorized_individual(db_session, individual_id)
        # unauthorized access to individual
        if not individual:
            response = jsonify(
                message="Sorry, either the patient does not exist or you are not permitted to see this patient"
            )
            response.status_code = 404
            return response

        if subset == "preview":
            individual_view = _individual_preview(db_session, config, individual)
        else:
            individual_view = _individual_complete_view(db_session, config, individual, subset)
    return jsonify(individual_view)


@application.route("/<language>/update_patient_data/<individual_id>", methods=["POST"])
@application.route("/update_patient_data/<individual_id>", methods=["POST"])
@requires_auth
def update_patient_data(individual_id, language="en"):
    if is_demo_user():
        return jsonify(error="Demo user not authorised"), 405

    with session_scope() as db_session:
        config = db.helpers.query_user_config(db_session=db_session, language=language, entity="individual")
        individual = _fetch_authorized_individual(db_session, individual_id)
        # unauthorized access to individual
        if not individual:
            config[0]["preview"] = [["Sorry", "You are not permitted to edit this patient"]]
            # TODO: change this output to the same structure as others
            return json.dumps(config)

        application.logger.debug(request.form)
        consanguinity = request.form.get("consanguinity_edit[]")
        gender = request.form.get("gender_edit[]")
        genes = request.form.getlist("genes[]")
        features = request.form.getlist("feature[]")
        if not len(features):
            features = ["All"]

        # TODO: simplfy this gender translation
        gender = MAPPING_SEX_REPRESENTATIONS.get(gender, "unknown")
        hpos = _get_hpos(db_session, features)
        _update_individual(consanguinity, gender, genes, hpos, individual)
    return jsonify({"success": True}), 200


@application.route("/individual", methods=["POST"])
@requires_auth
def create_individual():
    if is_demo_user():
        return jsonify(error="Demo user not authorised"), 405

    # checks individuals validity
    with session_scope() as db_session:
        try:
            new_individuals = _get_json_payload(Individual)
            for i in new_individuals:
                _check_individual_valid(db_session, i)
        except PhenopolisException as e:
            application.logger.error(str(e))
            return jsonify(success=False, error=str(e)), e.http_status

        request_ok = True
        http_status = 200
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
        except PhenopolisException as e:
            application.logger.exception(e)
            request_ok = False
            message = str(e)
            http_status = e.http_status

    return jsonify(success=request_ok, message=message, id=",".join(ids_new_individuals)), http_status


@application.route("/individual/<individual_id>", methods=["DELETE"])
@requires_admin
def delete_individual(individual_id):

    with session_scope() as db_session:
        individual = _fetch_authorized_individual(db_session, individual_id)
        request_ok = True
        http_status = 200
        message = "Patient " + individual_id + " has been deleted."

        if individual:
            try:
                user_individuals = (
                    db_session.query(UserIndividual).filter(UserIndividual.internal_id == individual_id).all()
                )
                for ui in user_individuals:
                    db_session.delete(ui)
                db_session.delete(individual)
            except Exception as e:
                application.logger.exception(e)
                request_ok = False
                message = str(e)
                http_status = e.http_status
        else:
            request_ok = False
            message = "Patient " + individual_id + " does not exist."
            http_status = 404

    return jsonify(success=request_ok, message=message), http_status


def _get_pagination_parameters():
    try:
        offset = int(request.args.get("offset", 0))
        limit = int(request.args.get("limit", 10))
    except ValueError as e:
        raise PhenopolisException(str(e), 500)
    return limit, offset


def _check_individual_valid(db_session: Session, new_individual: Individual):
    if new_individual is None:
        raise PhenopolisException("Null individual", 400)

    exist_internal_id = (
        db_session.query(Individual.external_id).filter(Individual.external_id == new_individual.external_id).all()
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


def _individual_complete_view(db_session: Session, config, individual: Individual, subset):
    # hom variants
    config[0]["rare_homs"]["data"] = list(map(lambda x: x.as_dict(), _get_homozygous_variants(db_session, individual)))
    # rare variants
    config[0]["rare_variants"]["data"] = list(
        map(lambda x: x.as_dict(), _get_heterozygous_variants(db_session, individual))
    )
    # rare_comp_hets
    gene_counter = Counter([v["gene_symbol"] for v in config[0]["rare_variants"]["data"]])
    rare_comp_hets_variants = [v for v in config[0]["rare_variants"]["data"] if gene_counter[v["gene_symbol"]] > 1]
    config[0]["rare_comp_hets"]["data"] = rare_comp_hets_variants

    if not config[0]["metadata"]["data"]:
        config[0]["metadata"]["data"] = [dict()]
    config = _map_individual2output(config, individual)
    process_for_display(db_session, config[0]["rare_homs"]["data"])
    process_for_display(db_session, config[0]["rare_variants"]["data"])
    if subset == "all":
        return config
    else:
        return [{subset: y[subset]} for y in config]


def _individual_preview(db_session: Session, config, individual: Individual):
    hom_count = _count_homozygous_variants(db_session, individual)
    het_count = _count_heterozygous_variants(db_session, individual)
    comp_het_count = _count_compound_heterozygous_variants(db_session, individual)
    # TODO: make a dict of this and not a list of lists
    config[0]["preview"] = [
        ["External_id", individual.external_id],
        ["Sex", individual.sex.name],
        ["Genes", [g for g in individual.genes.split(",") if g != ""]],
        ["Features", [f for f in individual.simplified_observed_features_names.split(",") if f != ""]],
        ["Number of hom variants", hom_count],
        ["Number of compound hets", comp_het_count],
        ["Number of het variants", het_count],
    ]
    return config


def _count_compound_heterozygous_variants(db_session: Session, individual: Individual):
    return (
        _query_heterozygous_variants(db_session, individual)
        .with_entities(Variant.gene_symbol)
        .group_by(Variant.gene_symbol)
        .having(func.count(Variant.gene_symbol) > 1)
        .count()
    )


def _count_heterozygous_variants(db_session: Session, individual: Individual) -> int:
    return _query_heterozygous_variants(db_session, individual).count()


def _count_homozygous_variants(db_session: Session, individual: Individual) -> int:
    return _query_homozygous_variants(db_session, individual).count()


def _map_individual2output(config, individual: Individual):
    config[0]["metadata"]["data"][0].update(individual.as_dict())
    config[0]["metadata"]["data"][0]["internal_id"] = [{"display": individual.internal_id}]
    config[0]["metadata"]["data"][0]["simplified_observed_features"] = [
        {"display": i, "end_href": j}
        for i, j, in zip(
            individual.simplified_observed_features_names.split(";")
            if individual.simplified_observed_features_names
            else [],
            individual.simplified_observed_features.split(",") if individual.simplified_observed_features else [],
        )
        if i != ""
    ]
    genes = individual.genes.split(",") if individual.genes else []
    config[0]["metadata"]["data"][0]["genes"] = [{"display": i} for i in genes if i != ""]
    return config


def _get_heterozygous_variants(db_session: Session, individual: Individual) -> List[Variant]:
    return _query_heterozygous_variants(db_session, individual).all()


def _query_heterozygous_variants(db_session: Session, individual):
    return (
        db_session.query(HeterozygousVariant, Variant)
        .filter(HeterozygousVariant.individual == individual.internal_id)
        .join(
            Variant,
            and_(
                HeterozygousVariant.CHROM == Variant.CHROM,
                HeterozygousVariant.POS == Variant.POS,
                HeterozygousVariant.REF == Variant.REF,
                HeterozygousVariant.ALT == Variant.ALT,
            ),
        )
        .with_entities(Variant)
    )


def _get_homozygous_variants(db_session: Session, individual: Individual) -> List[Variant]:
    return _query_homozygous_variants(db_session, individual).all()


def _query_homozygous_variants(db_session: Session, individual):
    return (
        db_session.query(HomozygousVariant, Variant)
        .filter(HomozygousVariant.individual == individual.internal_id)
        .join(
            Variant,
            and_(
                HomozygousVariant.CHROM == Variant.CHROM,
                HomozygousVariant.POS == Variant.POS,
                HomozygousVariant.REF == Variant.REF,
                HomozygousVariant.ALT == Variant.ALT,
            ),
        )
        .with_entities(Variant)
    )


def _fetch_all_individuals(db_session: Session, offset, limit) -> List[Tuple[Individual, List[str]]]:
    """
    For admin users it returns all individuals and all users having access to them.
    But for other than admin it returns only individuals which this user has access, other users having access are
    not returned
    """
    query = _query_all_individuals(db_session)
    individuals = query.offset(offset).limit(limit).all()
    return [(i, u.split(",")) for i, u in individuals]


def _count_all_individuals(db_session: Session) -> int:
    """
    For admin users it counts all individuals and all users having access to them.
    But for other than admin it counts only individuals which this user has access, other users having access are
    not counted
    """
    return _query_all_individuals(db_session).count()


def _count_all_individuals_by_sex(db_session: Session, sex: Sex) -> int:
    """
    For admin users it counts all individuals and all users having access to them.
    But for other than admin it counts only individuals which this user has access, other users having access are
    not counted
    """
    return _query_all_individuals(db_session, Individual.sex == sex).count()


def _query_all_individuals(db_session, additional_filter=None):
    user_id = session[USER]
    query = db_session.query(
        Individual, func.string_agg(UserIndividual.user, aggregate_order_by(literal_column("','"), UserIndividual.user))
    ).filter(Individual.internal_id == UserIndividual.internal_id)
    if additional_filter is not None:
        query = query.filter(additional_filter)
    if user_id != ADMIN_USER:
        query = query.filter(UserIndividual.user == user_id)
    query = query.group_by(Individual).order_by(Individual.internal_id.desc())
    return query


def _fetch_authorized_individual(db_session: Session, individual_id) -> Individual:
    return (
        db_session.query(Individual)
        .join(UserIndividual)
        .filter(UserIndividual.user == session[USER])
        .filter(Individual.internal_id == individual_id)
        .first()
    )


def _update_individual(consanguinity, gender, genes, hpos: List[HPO], individual: Individual):

    # update
    # features to hpo ids
    individual.sex = gender
    individual.consanguinity = consanguinity
    individual.observed_features = ",".join([h.hpo_id for h in hpos])
    individual.observed_features_names = ";".join([h.hpo_name for h in hpos])
    individual.ancestor_observed_features = ";".join(
        sorted(list(set(list(itertools.chain.from_iterable([h.hpo_ancestor_ids.split(";") for h in hpos])))))
    )
    individual.genes = ",".join([x for x in genes])


def _get_hpos(db_session: Session, features: List[str]) -> List[HPO]:
    return db_session.query(HPO).filter(HPO.hpo_name.in_(features)).all()


def get_authorized_individuals(db_session: Session) -> List[Individual]:
    user_id = session[USER]
    query = db_session.query(Individual, UserIndividual)
    if user_id != ADMIN_USER:
        query = query.filter(and_(Individual.internal_id == UserIndividual.internal_id, UserIndividual.user == user_id))
    return query.with_entities(Individual).all()
