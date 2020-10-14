"""
HPO view - Human Phenotype Ontology
"""
import ujson as json
import db.helpers
from flask import session
from db.helpers import cursor2dict
from views import application
from views.auth import requires_auth, USER
from views.postgres import get_db_session, postgres_cursor
from views.general import process_for_display
from db.model import HPO


@application.route("/<language>/hpo/<hpo_id>")
@application.route("/<language>/hpo/<hpo_id>/<subset>")
@application.route("/hpo/<hpo_id>")
@application.route("/hpo/<hpo_id>/<subset>")
@requires_auth
def hpo(hpo_id="HP:0000001", subset="all", language="en"):
    config = db.helpers.query_user_config(language=language, entity="hpo")
    # print(s)
    # x=json.loads(s)
    if not hpo_id.startswith("HP:"):
        # c.execute("select * from hpo where hpo_name='%s' limit 1"%hpo_id)
        data = get_db_session().query(HPO).filter(HPO.hpo_name == hpo_id)
    else:
        # c.execute("select * from hpo where hpo_id='%s' limit 1"%hpo_id)
        data = get_db_session().query(HPO).filter(HPO.hpo_id == hpo_id)
    res = [p.as_dict() for p in data][0]
    application.logger.debug(res)
    hpo_id = res["hpo_id"]
    hpo_name = res["hpo_name"]
    parent_phenotypes = [
        {"display": i, "end_href": j}
        for i, j, in zip(res["hpo_ancestor_names"].split(";"), res["hpo_ancestor_ids"].split(";"))
    ]
    c = postgres_cursor()
    c.execute(
        """select *
        from individuals as i,
        users_individuals as ui
        where
        i.internal_id=ui.internal_id
        and ui.user='%s'
        and i.ancestor_observed_features like '%s'"""
        % (session[USER], "%" + hpo_id + "%",)
    )
    individuals = cursor2dict(c)
    if hpo_id != "HP:0000001":
        c.execute("select * from phenogenon where hpo_id='%s'" % hpo_id)
        config[0]["phenogenon_recessive"]["data"] = [
            {
                "gene_id": [{"display": gene_id, "end_href": gene_id}],
                "hpo_id": hpo_id,
                "hgf_score": hgf,
                "moi_score": moi_score,
            }
            for gene_id, hpo_id, hgf, moi_score, in c.fetchall()
        ]
        c.execute("select * from phenogenon where hpo_id='%s'" % hpo_id)
        config[0]["phenogenon_dominant"]["data"] = [
            {
                "gene_id": [{"display": gene_id, "end_href": gene_id}],
                "hpo_id": hpo_id,
                "hgf_score": hgf,
                "moi_score": moi_score,
            }
            for gene_id, hpo_id, hgf, moi_score, in c.fetchall()
        ]
        # Chr,Start,End,HPO,Symbol,ENSEMBL,FisherPvalue,SKATO,variants,CompoundHetPvalue,HWEp,min_depth,nb_alleles_cases,case_maf,nb_ctrl_homs,nb_case_homs,MaxMissRate,nb_alleles_ctrls,nb_snps,nb_cases,minCadd,MeanCallRateCtrls,MeanCallRateCases,OddsRatio,MinSNPs,nb_ctrl_hets,total_maf,MaxCtrlMAF,ctrl_maf,nb_ctrls,nb_case_hets,maxExac
        c.execute("select Symbol,FisherPvalue,SKATO,OddsRatio,variants from skat where HPO='%s'" % hpo_id)
        config[0]["skat"]["data"] = [
            {
                "gene_id": [{"display": gene_id, "end_href": gene_id}],
                "fisher_p_value": fisher_p_value,
                "skato": skato,
                "odds_ratio": odds_ratio,
                "variants": [],
            }
            for gene_id, fisher_p_value, skato, odds_ratio, _variants in c.fetchall()[:100]
        ]
    application.logger.debug(len(individuals))
    config[0]["preview"] = [["Number of Individuals", len(individuals)]]
    if subset == "preview":
        return json.dumps([{subset: y["preview"]} for y in config])
    for ind in individuals:
        ind["internal_id"] = [{"display": ind["internal_id"]}]
        ind["simplified_observed_features_names"] = [
            {"display": i, "end_href": j}
            for i, j, in zip(
                ind["simplified_observed_features_names"].split(";"), ind["simplified_observed_features"].split(","),
            )
        ]
        if ind["genes"]:
            ind["genes"] = [{"display": i} for i in ind.get("genes", "").split(",")]
    config[0]["individuals"]["data"] = individuals
    config[0]["metadata"]["data"] = [
        {"name": hpo_name, "id": hpo_id, "count": len(individuals), "parent_phenotypes": parent_phenotypes}
    ]
    process_for_display(config[0]["metadata"]["data"])
    if subset == "all":
        return json.dumps(config)
    else:
        return json.dumps([{subset: y[subset]} for y in config])
