"""
Individual view
"""
from typing import List, Tuple
from sqlalchemy import func, and_, or_
from sqlalchemy.dialects.postgresql import aggregate_order_by
from sqlalchemy.orm import Session

import db.helpers
import ujson as json
from collections import Counter
from flask import session, jsonify, request
from db.model import (
    Individual,
    UserIndividual,
    Variant,
    HomozygousVariant,
    HeterozygousVariant,
    Sex,
    IndividualGene,
    NewGene,
)
from views import application
from views.auth import requires_auth, requires_admin, is_demo_user, USER, ADMIN_USER
from views.exceptions import PhenopolisException
from views.helpers import _get_json_payload
from views.postgres import session_scope, get_db
from bidict import bidict
from views.general import process_for_display, cache_on_browser
from sqlalchemy.sql.elements import literal_column

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
            for i, g, ui in individuals_and_users:
                individual_dict = i.as_dict()
                individual_dict["users"] = ui.split(",")
                individual_dict["genes"] = g
                individual_dict["internal_id"] = individual_dict["phenopolis_id"]
                obf = _get_feature_for_individual(i, "observed")
                sobf = _get_feature_for_individual(i)
                uobf = _get_feature_for_individual(i, "unobserved")
                aobf = _get_ancestors_for_individual(i)
                individual_dict["ancestor_observed_features"] = ",".join([x[0] for x in aobf])
                individual_dict["ancestor_observed_features_names"] = ",".join([x[1] for x in aobf])
                individual_dict["observed_features"] = ",".join([x[0] for x in obf])
                individual_dict["observed_features_names"] = ";".join([x[1] for x in obf])
                individual_dict["simplified_observed_features"] = ",".join([x[0] for x in sobf])
                individual_dict["simplified_observed_features_names"] = ";".join([x[1] for x in sobf])
                individual_dict["unobserved_features"] = ",".join([x[0] for x in uobf])
                results.append(individual_dict)
        except PhenopolisException as e:
            return jsonify(success=False, message=str(e)), e.http_status
    return jsonify(results), 200


@application.route("/<language>/individual/<phenopolis_id>")
@application.route("/<language>/individual/<phenopolis_id>/<subset>")
@application.route("/individual/<phenopolis_id>")
@application.route("/individual/<phenopolis_id>/<subset>")
@requires_auth
@cache_on_browser()
def get_individual_by_id(phenopolis_id, subset="all", language="en"):
    with session_scope() as db_session:
        config = db.helpers.query_user_config(db_session=db_session, language=language, entity="individual")
        individual = _fetch_authorized_individual(db_session, phenopolis_id)
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


@application.route("/<language>/update_patient_data/<phenopolis_id>", methods=["POST"])
@application.route("/update_patient_data/<phenopolis_id>", methods=["POST"])
@requires_auth
def update_patient_data(phenopolis_id, language="en"):
    if is_demo_user():
        return jsonify(error="Demo user not authorised"), 405

    with session_scope() as db_session:
        config = db.helpers.query_user_config(db_session=db_session, language=language, entity="individual")
        individual = _fetch_authorized_individual(db_session, phenopolis_id)
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

        # TODO: simplify this gender translation
        gender = MAPPING_SEX_REPRESENTATIONS.get(gender, "unknown")
        hpos = _get_hpos(features)
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
            dlist = _get_json_payload()
            new_individuals = []
            for d in dlist:
                if d.get("observed_features"):
                    feats = d.pop("observed_features").split(",")
                else:
                    feats = []
                if d.get("genes"):
                    genes = d.pop("genes").split(",")
                else:
                    genes = []
                i = Individual(**d)
                _check_individual_valid(db_session, i)
                new_individuals.append((i, genes, feats))
        except PhenopolisException as e:
            application.logger.error(str(e))
            return jsonify(success=False, error=str(e)), e.http_status

        request_ok = True
        http_status = 200
        message = "Individuals were created"
        ids_new_individuals = []
        try:
            # generate a new unique id for the individual
            for trio in new_individuals:
                i, g, f = trio
                # insert individual
                db_session.add(i)
                # to refresh i and with new id and phenopolis_id, both lines below needed (black magic)
                db_session.query(Individual).count()
                db_session.refresh(i)
                # add entry to user_individual
                # TODO: enable access to more users than the creator
                db_session.add(UserIndividual(user=session[USER], internal_id=i.phenopolis_id))
                db_session.commit()
                _insert_genes(i, g)
                _insert_feats(i, f)
                ids_new_individuals.append(i.phenopolis_id)
        except PhenopolisException as e:
            application.logger.exception(e)
            request_ok = False
            message = str(e)
            http_status = e.http_status
    return jsonify(success=request_ok, message=message, id=",".join(ids_new_individuals)), http_status


def _insert_genes(individual, genes):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
            insert into phenopolis.individual_gene (individual_id, gene_id) select %(id)s as individual_id,
            identifier from ensembl.gene where hgnc_symbol = any(%(genes)s::text[]) and assembly = 'GRCh37';
            """,
                {"id": individual.id, "genes": genes},
            )


def _insert_feats(individual, hpo_ids):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
            insert into phenopolis.individual_feature (individual_id, feature_id, type)
            select %(id)s as individual_id, t.id as feature_id, unnest('{observed,simplified}'::text[]) as type
            from hpo.term t where t.hpo_id = any(%(hpo_ids)s::text[]) order by type, feature_id;
            """,
                {"id": individual.id, "hpo_ids": hpo_ids},
            )


@application.route("/individual/<phenopolis_id>", methods=["DELETE"])
@requires_admin
def delete_individual(phenopolis_id):
    with session_scope() as db_session:
        individual = _fetch_authorized_individual(db_session, phenopolis_id)
        request_ok = True
        http_status = 200
        message = f"Patient {phenopolis_id} has been deleted."
        if individual:
            try:
                user_individuals = (
                    db_session.query(UserIndividual).filter(UserIndividual.internal_id == phenopolis_id).all()
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
            message = f"Patient {phenopolis_id} does not exist."
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
        db_session.query(Individual.phenopolis_id)
        .filter(
            or_(
                Individual.phenopolis_id == new_individual.phenopolis_id,
                Individual.external_id == new_individual.external_id,
            )
        )
        .all()
    )

    if len(exist_internal_id) > 0:
        raise PhenopolisException("Individual already exists.", 400)
    # TODO: add more validations here


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
        ["Genes", [g[0] for g in _get_genes_for_individual(individual)]],
        ["Features", [f[1] for f in _get_feature_for_individual(individual)]],
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
    config[0]["metadata"]["data"][0]["internal_id"] = [{"display": individual.phenopolis_id}]
    config[0]["metadata"]["data"][0]["simplified_observed_features"] = [
        {"display": x[0], "end_href": x[1]} for x in _get_feature_for_individual(individual)
    ]
    genes = _get_genes_for_individual(individual)
    config[0]["metadata"]["data"][0]["genes"] = [{"display": i[0]} for i in genes]
    return config


def _get_feature_for_individual(individual: Individual, atype="simplified"):
    """
    returns observed_features for a given individual
    options are: simplified (default), observed, unobserved
    e.g. [('HP:0000007', 'Autosomal recessive inheritance'), ('HP:0000505', 'Visual impairment')]
    """
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                select t.hpo_id, t."name" from individual i join individual_feature if2 on (i.id = if2.individual_id)
                join hpo.term t on (t.id = if2.feature_id) and if2."type" = %s
                and i.id = %s""",
                (atype, individual.id),
            )
            res = cur.fetchall()
    return res


def _get_ancestors_for_individual(individual: Individual):
    """
    returns tuple (ancestor_observed_features, ancestor_observed_features_name) for a given individual
    e.g. [('HP:0000007', 'Autosomal recessive inheritance'), ('HP:0000505', 'Visual impairment')]
    """
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                r"""
            select t.hpo_id, name from hpo.term t where t.id in (
                select distinct(regexp_split_to_table(path::text, '\.'))::int as ancestor
                from phenopolis.individual_feature if1
                join hpo.is_a_path tpath on if1.feature_id = tpath.term_id and if1.type = 'observed'
                where  if1.individual_id = %s
            )
            order by t.id""",
                [individual.id],
            )
            res = cur.fetchall()
    return res


def _get_genes_for_individual(individual: Individual):
    """returns e.g. [('TTLL5',)]"""
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
            select g.hgnc_symbol from phenopolis.individual i
            join phenopolis.individual_gene ig on i.id = ig.individual_id
            join ensembl.gene g on g.identifier = ig.gene_id
            and i.id = %s""",
                [individual.id],
            )
            genes = cur.fetchall()
    return genes


def _get_heterozygous_variants(db_session: Session, individual: Individual) -> List[Variant]:
    return _query_heterozygous_variants(db_session, individual).all()


def _query_heterozygous_variants(db_session: Session, individual):
    return (
        db_session.query(HeterozygousVariant, Variant)
        .filter(HeterozygousVariant.individual == individual.phenopolis_id)
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
        .filter(HomozygousVariant.individual == individual.phenopolis_id)
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
    return [(i, g, u) for i, g, u in individuals]


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
    query = (
        db_session.query(
            Individual,
            func.string_agg(
                NewGene.hgnc_symbol.distinct(), aggregate_order_by(literal_column("','"), NewGene.hgnc_symbol)
            ),
            func.string_agg(
                UserIndividual.user.distinct(), aggregate_order_by(literal_column("','"), UserIndividual.user)
            ),
        )
        .outerjoin(UserIndividual, Individual.phenopolis_id == UserIndividual.internal_id)
        .outerjoin(IndividualGene, Individual.id == IndividualGene.individual_id)
        .outerjoin(NewGene, IndividualGene.gene_id == NewGene.identifier)
        .group_by(Individual)
        .order_by(Individual.phenopolis_id.desc())
    )
    if additional_filter is not None:
        query = query.filter(additional_filter)
    if user_id != ADMIN_USER:
        query = query.filter(UserIndividual.user == user_id)
    query = query.group_by(Individual).order_by(Individual.phenopolis_id.desc())
    return query


def _fetch_authorized_individual(db_session: Session, phenopolis_id) -> Individual:
    return (
        db_session.query(Individual)
        .join(UserIndividual, UserIndividual.internal_id == Individual.phenopolis_id)
        .filter(UserIndividual.user == session[USER])
        .filter(Individual.phenopolis_id == phenopolis_id)
        .first()
    )


def _update_individual(consanguinity, gender, genes, hpos: List[tuple], individual: Individual):
    """
    Updates tables:
        phenopolis.individual:         col(gender)
        phenopolis.individual_feature: col(feature_id) # hpo_ids
        phenopolis.individual_gene:    col(gene_id) # maps hgnc_symbol -> gene.identifier
            given hgnc_symbol MUST exactly match hgnc_symbols in ensembl.gene table otherwise returns []
    """
    individual.sex = gender
    individual.consanguinity = consanguinity
    hpo_ids = [h[0] for h in hpos]
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
            delete from phenopolis.individual_feature where individual_id = %(id)s and type = 'observed';
            insert into phenopolis.individual_feature (individual_id, feature_id, type) select %(id)s as individual_id,
            unnest(%(hpo_ids)s::int[]) as feature_id, 'observed' as type;
            delete from phenopolis.individual_gene where individual_id = %(id)s;
            insert into phenopolis.individual_gene (individual_id, gene_id) select %(id)s as individual_id,
            identifier from ensembl.gene where hgnc_symbol = any(%(genes)s::text[]) and assembly = 'GRCh37';
            """,
                {"id": individual.id, "hpo_ids": hpo_ids, "genes": genes},
            )


def _get_hpos(features: List[str]):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("select * from hpo.term t where t.name = any(%s);", [features])
            res = cur.fetchall()
    return res


def get_authorized_individuals(db_session: Session) -> List[Individual]:
    user_id = session[USER]
    query = db_session.query(Individual, UserIndividual)
    if user_id != ADMIN_USER:
        query = query.filter(
            and_(Individual.phenopolis_id == UserIndividual.internal_id, UserIndividual.user == user_id)
        )
    return query.with_entities(Individual).all()
