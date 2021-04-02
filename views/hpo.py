"""
HPO view - Human Phenotype Ontology
"""
from flask import session, jsonify
from views import application
from views.auth import requires_auth, USER
from views.postgres import get_db, session_scope
from views.general import process_for_display, cache_on_browser
from db.helpers import cursor2dict, query_user_config


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
        sql_query = rf"""
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
        sqlq = sql_query
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(sqlq, [hpo_id])
                res = cursor2dict(cur)
        application.logger.debug(res)
        if not res:
            return jsonify(config)
        h_id = res[-1]["id"]
        hpo_id = res[-1]["hpo_id"]
        hpo_name = res[-1]["name"]
        parent_phenotypes = [
            {"display": i, "end_href": j} for j, i in [(h, n) for i, h, n in [ii.values() for ii in res]]
        ]
        # query to give the ancestors for a given hpo for a given user for all patients this user has access
        sqlq = """
            select distinct i.id, i.external_id, i.phenopolis_id, i.sex, i.consanguinity,
            string_agg(DISTINCT g.hgnc_symbol, ',' ORDER BY g.hgnc_symbol) AS genes,
            string_agg(DISTINCT concat(t.hpo_id,'@', t."name"), ',' ) AS simplified_observed_features_names
            from hpo.term t join phenopolis.individual_feature if2 on t.id = if2.feature_id
            join phenopolis.individual i on i.id = if2.individual_id
            join public.users_individuals ui on ui.internal_id = i.phenopolis_id
            left outer join phenopolis.individual_gene ig on ig.individual_id = i.id
            left outer join ensembl.gene g on g.identifier = ig.gene_id
            where exists (
                select 1 from hpo.is_a_path p
                where p.term_id = t.id
                and p.path ~ %s
            )
            and ui."user" = %s
            group by i.id, i.external_id, i.phenopolis_id, i.sex, i.consanguinity
            """
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(sqlq, (f"*.{h_id}.*", session[USER]))

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
        if subset == "preview":
            return jsonify([{subset: y["preview"]} for y in config])
        for ind in individuals:
            ind["internal_id"] = [{"display": ind["phenopolis_id"]}]
            ind["simplified_observed_features_names"] = [
                {"display": j, "end_href": i}
                for i, j, in [x.split("@") for x in ind["simplified_observed_features_names"].split(",")]
            ]
            # ind["genes"] = [{"display": i[0]} for i in _get_genes_for_individual(ind)]
            if ind["genes"]:
                ind["genes"] = [{"display": i} for i in ind.get("genes", "").split(",")]
        config[0]["individuals"]["data"] = individuals
        config[0]["metadata"]["data"] = [
            {"name": hpo_name, "id": hpo_id, "count": len(individuals), "parent_phenotypes": parent_phenotypes}
        ]
        process_for_display(db_session, config[0]["metadata"]["data"])
    if subset == "all":
        return jsonify(config)
    else:
        return jsonify([{subset: y[subset]} for y in config])
