"""
HPO view - Human Phenotype Ontology
"""
from db.helpers import cursor2dict, query_user_config
from flask import jsonify, session
from psycopg2 import sql

from views import MAX_PAGE_SIZE, application
from views.auth import USER, requires_auth
from views.exceptions import PhenopolisException
from views.general import _get_pagination_parameters, cache_on_browser, process_for_display
from views.individual import _get_authorized_individuals
from views.postgres import get_db, session_scope


@application.route("/<language>/hpo/<hpo_id>")
@application.route("/<language>/hpo/<hpo_id>/<subset>")
@application.route("/hpo/<hpo_id>")
@application.route("/hpo/<hpo_id>/<subset>")
@requires_auth
@cache_on_browser()
def hpo(hpo_id="HP:0000001", subset="all", language="en"):

    with session_scope() as db_session:
        config = query_user_config(db_session=db_session, language=language, entity="hpo")
        field = "hpo_id"
        if not hpo_id.startswith("HP:"):
            field = "name"
        sql_query = sql.SQL(
            rf"""
            select
                t.id, t.hpo_id, t.name
            from
                hpo.term t
            where
                t.id in (
                select
                    regexp_split_to_table(path::text, '\.')::int as ancestor
                from
                    hpo.is_a_path tpath
                join hpo.term ht on
                    tpath.term_id = ht.id
                where
                    ht.{field} = %s )
            order by
                t.id"""
        )
        sqlq = sql_query
        with get_db() as conn:
            with conn.cursor() as cur:
                if subset == "preview":
                    ni = _preview(cur, session[USER], hpo_id)
                    config[0]["preview"] = [["Number of Individuals", ni]]
                    return jsonify([{subset: y["preview"]} for y in config])

                cur.execute(sqlq, [hpo_id])
                res = cursor2dict(cur)
        application.logger.debug(res)
        data = [x for x in res if x[field] == hpo_id]
        if not data:
            response = jsonify(message="HPO not found")
            response.status_code = 404
            return response
        d_hpo = data[0]
        h_id = d_hpo["id"]
        hpo_id = d_hpo["hpo_id"]
        hpo_name = d_hpo["name"]
        parent_phenotypes = [
            {"display": i, "end_href": j} for j, i in [(h, n) for _i, h, n in [ii.values() for ii in res]]
        ]
        # query to give the ancestors for a given hpo for a given user for all patients this user has access
        sqlq = sql.SQL(
            """
            select distinct i.id, i.external_id, i.phenopolis_id, i.sex, i.consanguinity,
            (select array_agg(distinct g.hgnc_symbol order by g.hgnc_symbol)
                    from phenopolis.individual_gene ig
                    join ensembl.gene g on g.identifier = ig.gene_id
                    where ig.individual_id = i.id
            ) AS genes,
            (
                    select array_agg(distinct concat(t.hpo_id,'@', t."name"))
                    from hpo.term t
                    join phenopolis.individual_feature if2 on t.id = if2.feature_id
                    where i.id = if2.individual_id
                    and if2."type" ='observed'
            ) AS simplified_observed_features_names
            from phenopolis.individual i
            join public.users_individuals ui on ui.internal_id = i.phenopolis_id
            join phenopolis.individual_feature if3 on i.id = if3.individual_id and if3."type" = 'observed'
            join hpo.term t2 on t2.id = if3.feature_id
            join hpo.is_a_path p on p.term_id = t2.id
            where ui."user" = %s
            and p.path ~ %s
            order by i.id
            """
        )
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(sqlq, (session[USER], f"*.{h_id}.*"))

                individuals = cursor2dict(cur)

                if hpo_id != "HP:0000001":
                    cur.execute("select * from phenogenon where hpo_id=%s", [hpo_id])
                    config[0]["phenogenon_recessive"]["data"] = [
                        {
                            "gene_id": [{"display": gene_id, "end_href": gene_id}],
                            "hpo_id": hpo_id,
                            "hgf_score": hgf,
                            "moi_score": moi_score,
                        }
                        for gene_id, hpo_id, hgf, moi_score, in cur.fetchall()
                    ]
                    # NOTE: redundant line below commented
                    # cur.execute("select * from phenogenon where hpo_id=%s", [hpo_id])
                    config[0]["phenogenon_dominant"]["data"] = config[0]["phenogenon_recessive"]["data"]
                    # Chr,Start,End,HPO,Symbol,ENSEMBL,FisherPvalue,SKATO,variants,CompoundHetPvalue,HWEp,min_depth,nb_alleles_cases,case_maf,nb_ctrl_homs,nb_case_homs,MaxMissRate,nb_alleles_ctrls,nb_snps,nb_cases,minCadd,MeanCallRateCtrls,MeanCallRateCases,OddsRatio,MinSNPs,nb_ctrl_hets,total_maf,MaxCtrlMAF,ctrl_maf,nb_ctrls,nb_case_hets,maxExac
                    cur.execute("select Symbol,FisherPvalue,SKATO,OddsRatio,variants from skat where HPO= %s", [hpo_id])
                    config[0]["skat"]["data"] = [
                        {
                            "gene_id": [{"display": gene_id, "end_href": gene_id}],
                            "fisher_p_value": fisher_p_value,
                            "skato": skato,
                            "odds_ratio": odds_ratio,
                            "variants": [],
                        }
                        for gene_id, fisher_p_value, skato, odds_ratio, _variants in cur.fetchall()[:100]
                    ]
        application.logger.debug(len(individuals))
        config[0]["preview"] = [["Number of Individuals", len(individuals)]]
        for ind in individuals[:]:
            ind["internal_id"] = [{"display": ind["phenopolis_id"]}]
            if ind["genes"]:
                ind["genes"] = [{"display": i} for i in ind["genes"]]
            else:
                ind["genes"] = []
            ind["simplified_observed_features_names"] = [
                {"display": j, "end_href": i}
                for i, j, in [
                    x.split("@")
                    for x in sorted(ind["simplified_observed_features_names"], key=lambda x: x.split("@")[1])
                ]
            ]
        config[0]["individuals"]["data"] = individuals
        config[0]["metadata"]["data"] = [
            {"name": hpo_name, "id": hpo_id, "count": len(individuals), "parent_phenotypes": parent_phenotypes}
        ]
        process_for_display(db_session, config[0]["metadata"]["data"])
    if subset == "all":
        return jsonify(config)
    else:
        return jsonify([{subset: y[subset]} for y in config])


def _preview(cur, user, hpo_id):
    q1 = sql.SQL(
        """select * from phenopolis.individual i
        join public.users_individuals ui on ui.internal_id = i.phenopolis_id
        and ui."user" = %s
        """
    )
    q2 = sql.SQL(
        f"""where exists (
            select 1 from hpo.is_a_path p, hpo.term t, phenopolis.individual_feature if2
            where p.term_id = t.id
            and if2.feature_id = t.id and i.id = if2.individual_id and if2."type" = 'observed'
            and p.path ~ (
                select ('*.' || id || '.*')::lquery
                from hpo.term t2
                where t2.hpo_id = '{hpo_id}'
            )
        )
    """
    )
    q = q1
    if hpo_id != "HP:0000001":
        q = q1 + q2
    cur.execute(q, [user])
    return cur.rowcount


@application.route("/my_hpos")
@requires_auth
def get_all_hpos():
    with session_scope() as db_session:
        individuals = _get_authorized_individuals(db_session)
        sqlq_all_hpos = sql.SQL(
            """
            select distinct t.hpo_id, t."name" from phenopolis.individual_feature ife
            join hpo.term t on t.id = ife.feature_id
            where ife.individual_id = any(%s) and ife.type in ('observed')
        """
        )
        try:
            limit, offset = _get_pagination_parameters()
            if limit > MAX_PAGE_SIZE:
                return (
                    jsonify(message="The maximum page size for variants is {}".format(MAX_PAGE_SIZE)),
                    400,
                )
            sqlq = sqlq_all_hpos + sql.SQL("limit {} offset {}".format(limit, offset))
            with get_db() as conn:
                with conn.cursor() as cur:
                    cur.execute(sqlq, [[x.id for x in individuals]])
                    hpos = cursor2dict(cur)
            process_for_display(db_session, hpos)
        except PhenopolisException as e:
            return jsonify(success=False, message=str(e)), e.http_status
    return jsonify(hpos), 200
