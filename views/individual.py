"""
Individual view
"""
import functools
import operator
from collections import Counter
from typing import Dict, List, Optional, Tuple, Union

from bidict import bidict
from flask import jsonify, request, session
from psycopg2 import sql
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from db.helpers import cursor2dict, query_user_config
from db.model import Individual, Sex, UserIndividual
from views import HG_ASSEMBLY, MAX_PAGE_SIZE, application
from views.auth import ADMIN_USER, DEMO_USER, USER, is_demo_user, requires_auth
from views.exceptions import PhenopolisException
from views.general import _get_pagination_parameters, cache_on_browser, process_for_display
from views.helpers import _get_json_payload
from views.postgres import get_db, session_scope
from views.variant import _get_variants

MAPPING_SEX_REPRESENTATIONS = bidict({"male": Sex.M, "female": Sex.F, "unknown": Sex.U})


@application.route("/individual")
@requires_auth
def get_all_individuals():
    with session_scope() as db_session:
        try:
            limit, offset = _get_pagination_parameters()
            if limit > MAX_PAGE_SIZE:
                return (
                    jsonify(message=f"The maximum page size for individuals is {MAX_PAGE_SIZE}"),
                    400,
                )
            individuals = _fetch_all_individuals(db_session=db_session, offset=offset, limit=limit)
            for ind in individuals:
                a1, a2 = zip(*[x.split("@") for x in sorted(ind["ancestor_observed_features"])])
                o1, o2 = zip(*[x.split("@") for x in sorted(ind["observed_features"])])
                # NOTE: casting list in strings just for frontend, but list is better, I guess (Alan)
                ind["ancestor_observed_features"] = ",".join(a1)
                ind["ancestor_observed_features_names"] = ",".join(a2)
                ind["observed_features"] = ",".join(o1)
                ind["observed_features_names"] = ",".join(o2)
                ind["simplified_observed_features"] = ""
                ind["simplified_observed_features_names"] = ""
                ind["phenopolis_id"] = ind["internal_id"]
                if ind["unobserved_features"]:
                    ind["unobserved_features"] = ",".join(ind["unobserved_features"])
                else:
                    ind["unobserved_features"] = ""
                if ind["genes"]:
                    ind["genes"] = ",".join(ind["genes"])
                else:
                    ind["genes"] = ""

        except PhenopolisException as e:
            return jsonify(success=False, message=str(e)), e.http_status
    return jsonify(individuals), 200


@application.route("/<language>/individual/<phenopolis_id>")
@application.route("/<language>/individual/<phenopolis_id>/<subset>")
@application.route("/individual/<phenopolis_id>")
@application.route("/individual/<phenopolis_id>/<subset>")
@requires_auth
@cache_on_browser()
def get_individual_by_id(phenopolis_id, subset="all", language="en"):
    with session_scope() as db_session:
        config = query_user_config(db_session=db_session, language=language, entity="individual")
        individual = _fetch_authorized_individual(db_session, phenopolis_id)
        # unauthorized access to individual
        if not individual:
            response = jsonify(message="Patient not found")
            response.status_code = 404
            return response

        if subset == "preview":
            individual_view = _individual_preview(config, individual)
        else:
            individual_view = _individual_complete_view(db_session, config, individual, subset)
    return jsonify(individual_view)


@application.route("/<language>/update_patient_data/<phenopolis_id>", methods=["POST"])
@application.route("/update_patient_data/<phenopolis_id>", methods=["POST"])
@requires_auth
def update_patient_data(phenopolis_id):
    if is_demo_user():
        return jsonify(error="Demo user not authorised"), 405

    with session_scope() as db_session:
        individual = _fetch_authorized_individual(db_session, phenopolis_id)
        # unauthorized access to individual
        if not individual:
            response = jsonify(
                message="Sorry, either the patient does not exist or you are not permitted to see this patient"
            )
            response.status_code = 404
            return response
        application.logger.debug(request.form)
        consanguinity = request.form.get("consanguinity_edit[]", "unknown")
        gender = request.form.get("gender_edit[]", "unknown")
        genes = request.form.getlist("genes[]")
        features = request.form.getlist("feature[]")
        if not len(features):
            features = ["All"]

        # TODO: simplify this gender translation
        unk_obj = MAPPING_SEX_REPRESENTATIONS.get("unknown")
        gender = MAPPING_SEX_REPRESENTATIONS.get(gender, unk_obj)
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
                genes = []
                if d.get("observed_features"):
                    feats = d.pop("observed_features").split(",")
                else:
                    feats = []
                if d.get("genes") or d.get("genes") == "":
                    genes = d.pop("genes").split(",")
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
            # generate a new unique ID for the individual
            for trio in new_individuals:
                i, g, f = trio
                # insert individual
                db_session.add(i)
                # to refresh i and with new ID and phenopolis_id, both lines below needed (black magic)
                db_session.query(Individual).count()
                db_session.refresh(i)
                # add entry to user_individual
                # TODO: enable access to more users than the creator
                db_session.add(UserIndividual(user=session[USER], internal_id=i.phenopolis_id))
                if session[USER] != ADMIN_USER:
                    db_session.add(UserIndividual(user=ADMIN_USER, internal_id=i.phenopolis_id))
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
            identifier from ensembl.gene where hgnc_symbol = any(%(genes)s::text[]) and assembly = %(hga)s;
            """,
                {"id": individual.id, "genes": genes, "hga": HG_ASSEMBLY},
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
@requires_auth
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


def _check_individual_valid(db_session: Session, new_individual: Individual):
    if not new_individual.as_dict() or not new_individual.sex:
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
    variants = _get_variants(individual.phenopolis_id)
    hom_vars = [x for x in variants if "HOM" in x["zigosity"]]
    het_vars = [x for x in variants if "HET" in x["zigosity"]]
    # HOM variants
    config[0]["rare_homs"]["data"] = hom_vars
    # rare variants
    config[0]["rare_variants"]["data"] = het_vars
    # rare_comp_hets
    genes: List[str] = functools.reduce(operator.iconcat, [v["gene_symbol"].split(",") for v in het_vars], [])
    gene_counter = Counter(genes)
    genes = [x for x, y in gene_counter.items() if y > 1 and x]
    rare_comp_hets_variants = []
    for v in het_vars:
        if v["gene_symbol"]:
            for g in v["gene_symbol"].split(","):
                if g in genes:
                    rare_comp_hets_variants.append(v)
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


def _individual_preview(config, individual: Individual):
    sql_zig = """select iv.zygosity,count(*) from phenopolis.variant v
        join phenopolis.individual_variant iv on iv.variant_id = v.id
        where iv.individual_id = %s
        group by iv.zygosity"""
    sql_comp = """select sum(c)::int as total from(
        select count(v.*) as c
        from phenopolis.variant_gene vg
        join phenopolis.individual_variant iv on iv.variant_id = vg.variant_id
        join phenopolis.variant v on v.id = iv.variant_id
        where iv.individual_id = %s and iv.zygosity = 'HET'
        group by vg.gene_id having count(v.*) > 1
        ) as com"""
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(sql_zig, [individual.id])
            hh = dict(cur.fetchall())
            cur.execute(sql_comp, [individual.id])
            hc = cur.fetchone()[0] or 0

    hom_count = hh.get("HOM", 0)
    het_count = hh.get("HET", 0)
    comp_het_count = hc
    external_id = individual.external_id
    if session[USER] == DEMO_USER:
        external_id = "_demo_"
    # TODO: make a dict of this and not a list of lists
    config[0]["preview"] = [
        ["External_id", external_id],
        ["Sex", individual.sex.name],
        ["Genes", [g[0] for g in _get_genes_for_individual(individual)]],
        ["Features", [f[1] for f in _get_feature_for_individual(individual)]],
        ["Number of hom variants", hom_count],
        ["Number of compound hets", comp_het_count],
        ["Number of het variants", het_count],
    ]
    return config


def _map_individual2output(config, individual: Individual):
    config[0]["metadata"]["data"][0].update(individual.as_dict())
    if session[USER] == DEMO_USER:
        config[0]["metadata"]["data"][0]["external_id"] = "_demo_"
    config[0]["metadata"]["data"][0]["internal_id"] = [{"display": individual.phenopolis_id}]
    config[0]["metadata"]["data"][0]["simplified_observed_features"] = [
        {"display": x[1], "end_href": x[0]} for x in _get_feature_for_individual(individual)
    ]
    genes = _get_genes_for_individual(individual)
    config[0]["metadata"]["data"][0]["genes"] = [{"display": i[0]} for i in genes]
    return config


def _get_feature_for_individual(
    individual: Union[Individual, dict], atype: str = "simplified"
) -> List[Tuple[str, str]]:
    """
    returns observed_features for a given individual
    options are: simplified (default), observed, unobserved
    e.g. [('HP:0000007', 'Autosomal recessive inheritance'), ('HP:0000505', 'Visual impairment')]
    """
    if isinstance(individual, Individual):
        ind_id = individual.id
    elif isinstance(individual, dict):
        ind_id = individual.get("id")
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                select distinct t.hpo_id, t."name" from phenopolis.individual i
                join phenopolis.individual_feature if2 on (i.id = if2.individual_id)
                join hpo.term t on (t.id = if2.feature_id) and if2."type" = %s
                and i.id = %s""",
                (atype, ind_id),
            )
            res = cur.fetchall()
    return res


def _get_genes_for_individual(individual: Union[Individual, dict]) -> List[Tuple[str]]:
    """returns e.g. [('TTLL5',)]"""
    if isinstance(individual, Individual):
        ind_id = individual.id
    elif isinstance(individual, dict):
        ind_id = individual.get("id")
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
            select distinct g.hgnc_symbol from phenopolis.individual i
            join phenopolis.individual_gene ig on i.id = ig.individual_id
            join ensembl.gene g on g.identifier = ig.gene_id
            and i.id = %s""",
                [ind_id],
            )
            genes = cur.fetchall()
    return genes


def _fetch_all_individuals(db_session: Session, offset, limit) -> List[Dict]:
    """
    For admin user it returns all individuals and all users having access to them.
    But for others than admin it returns only individuals which this user has access,
    other users having access are not returned
    """
    query = _query_all_individuals() + sql.SQL(f"limit {limit} offset {offset}")
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(query, [session[USER]])
            individuals = sorted(cursor2dict(cur), key=lambda i: i["id"])
    if session[USER] != ADMIN_USER:
        for dd in individuals:
            dd["users"] = [session[USER]]
    return individuals


def _count_all_individuals() -> int:
    """
    For admin users it counts all individuals and all users having access to them.
    But for other than admin it counts only individuals which this user has access, other users having access are
    not counted
    """
    query = _query_all_individuals()
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(query, [session[USER]])
    return cur.rowcount


def _count_all_individuals_by_sex(sex: Sex) -> int:
    """
    For admin users it counts all individuals and all users having access to them.
    But for other than admin it counts only individuals which this user has access, other users having access are
    not counted
    """
    query = _query_all_individuals(sex)
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (session[USER], sex.name))
    return cur.rowcount


def _query_all_individuals(additional_filter: Optional[Sex] = None) -> sql.SQL:

    # e.g. additional_filter = 'Sex'
    q1 = sql.SQL(
        """where exists (
            select 1 from public.users_individuals ui
            where ui.internal_id = i.phenopolis_id
            and ui."user" = %s)"""
    )

    conds = [q1]
    if additional_filter is not None:
        conds.append(sql.SQL("i.sex = %s"))
    query = sql.SQL(
        r"""
        select i.id, i.external_id, i.phenopolis_id as internal_id, i.sex, i.consanguinity,
        (
            select array_agg(ui."user")
            from public.users_individuals ui
            where ui.internal_id = i.phenopolis_id
        ) AS users,
        (
            select array_agg(g.hgnc_symbol)
            from phenopolis.individual_gene ig
            join ensembl.gene g on g.identifier = ig.gene_id
            where ig.individual_id = i.id
        ) AS genes,
        (
            select array_agg(concat(t.hpo_id,'@', t."name"))
            from hpo.term t
            join phenopolis.individual_feature if2 on t.id = if2.feature_id
            where i.id = if2.individual_id
            and if2."type" = 'observed'
        ) as observed_features,
        (
            select array_agg(t.hpo_id)
            from hpo.term t
            join phenopolis.individual_feature if2 on t.id = if2.feature_id
            where i.id = if2.individual_id
            and if2."type" = 'unobserved'
        ) as unobserved_features,
        (
            select array_agg(concat(t.hpo_id,'@', t."name"))
            from hpo.term t where t.id in (
                select (regexp_split_to_table(p."path"::text, '\.'))::int as ancestor
                from phenopolis.individual_feature if2
                join hpo.is_a_path p on if2.feature_id = p.term_id
                where i.id = if2.individual_id
                and if2."type" = 'observed'
            )
        ) as ancestor_observed_features
        from phenopolis.individual i
        {filter}
        """
    ).format(filter=sql.SQL(" and ").join(conds))

    return query


def _fetch_authorized_individual(db_session: Session, phenopolis_id) -> Individual:
    return (
        db_session.query(Individual)
        .join(UserIndividual, UserIndividual.internal_id == Individual.phenopolis_id)
        .filter(UserIndividual.user == session[USER])
        .filter(Individual.phenopolis_id == phenopolis_id)
        .first()
    )


def _update_individual(consanguinity, gender: Sex, genes, hpos: List[tuple], individual: Individual):
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
            delete from phenopolis.individual_feature where individual_id = %(id)s
            and "type" = any('{observed,simplified}');
            insert into phenopolis.individual_feature (individual_id, feature_id, type) select %(id)s as individual_id,
            unnest(%(hpo_ids)s::int[]) as feature_id, 'observed' as type;
            insert into phenopolis.individual_feature (individual_id, feature_id, type) select %(id)s as individual_id,
            unnest(%(hpo_ids)s::int[]) as feature_id, 'simplified' as type;
            delete from phenopolis.individual_gene where individual_id = %(id)s;
            insert into phenopolis.individual_gene (individual_id, gene_id) select %(id)s as individual_id,
            identifier from ensembl.gene where hgnc_symbol = any(%(genes)s::text[]) and assembly = %(hga)s;
            """,
                {"id": individual.id, "hpo_ids": hpo_ids, "genes": genes, "hga": HG_ASSEMBLY},
            )


def _get_hpos(features: List[str]):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("select * from hpo.term t where t.name = any(%s);", [features])
            res = cur.fetchall()
    return res


def _get_authorized_individuals(db_session: Session) -> List[Individual]:
    user_id = session[USER]
    query = db_session.query(Individual, UserIndividual)
    if user_id != ADMIN_USER:
        query = query.filter(
            and_(Individual.phenopolis_id == UserIndividual.internal_id, UserIndividual.user == user_id)
        )
    return query.with_entities(Individual).all()
