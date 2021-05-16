"""
Gene view
"""
from views.variant import _get_variants
from psycopg2 import sql
from db.helpers import query_user_config, cursor2dict
from sqlalchemy.orm import Session
from sqlalchemy import text
from flask import jsonify
from views import HG_ASSEMBLY, application
from views.auth import requires_auth, is_demo_user
from views.postgres import get_db, session_scope
from views.general import process_for_display, cache_on_browser
from db.model import Gene


@application.route("/<language>/gene/<gene_id>")
@application.route("/<language>/gene/<gene_id>/<subset>")
@application.route("/gene/<gene_id>")
@application.route("/gene/<gene_id>/<subset>")
@requires_auth
@cache_on_browser()
def gene(gene_id, subset="all", language="en"):
    with session_scope() as db_session:
        config = query_user_config(db_session=db_session, language=language, entity="gene")
        data = query_gene(db_session, gene_id)
        if not data:
            response = jsonify(message="Gene not found")
            response.status_code = 404
            return response
        config[0]["metadata"]["data"] = data
        chrom = config[0]["metadata"]["data"][0]["chrom"]
        start = config[0]["metadata"]["data"][0]["start"]
        stop = config[0]["metadata"]["data"][0]["stop"]
        gene_id = config[0]["metadata"]["data"][0]["gene_id"]
        gene_name = config[0]["metadata"]["data"][0]["gene_name"]
        for d in config[0]["metadata"]["data"]:
            # d['pLI']=1
            d["external_services"] = [
                {"display": "GnomAD Browser", "href": f"http://gnomad.broadinstitute.org/gene/{gene_id}"},
                {"display": "GeneCards", "href": f"http://www.genecards.org/cgi-bin/carddisp.pl?gene={gene_name}"},
            ]
            d["genome_browser"] = [
                {
                    "display": "Ensembl Browser",
                    "href": f"http://{HG_ASSEMBLY.lower()}.ensembl.org/Homo_sapiens/Gene/Summary?g={gene_id}",
                },
                {
                    "display": "UCSC Browser",
                    "href": f"http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg19&position=chr{chrom}:{start}-{stop}",
                },
            ]
            d["other"] = [
                {"display": "Wikipedia", "href": f"http://en.wikipedia.org/{gene_name}"},
                {"display": "Pubmed Search", "href": f"http://www.ncbi.nlm.nih.gov/pubmed?term={gene_name}"},
                {"display": "Wikigenes", "href": f"http://www.wikigenes.org/?search={gene_name}"},
                {"display": "GTEx (expression)", "href": f"http://www.gtexportal.org/home/gene/{gene_name}"},
            ]
            #         d["related_hpo"] = [
            #             {
            #                 "display": c.execute(
            #                     "select hpo_name from hpo where hpo_id='%s' limit 1" % hpo_id
            #                 ).fetchone()[0],
            #                 "end_href": hpo_id,
            #             }
            #             for hpo_id, in c.execute(
            #                 "select hpo_id from gene_hpo where gene_symbol='%s'" % gene_name
            #             ).fetchall()
            #         ]
            d["related_hpo"] = []
        # c.execute("select * from variants where gene_symbol='%s'"%(x[0]['metadata']['data'][0]['gene_name'],))
        # gene_id = config[0]["metadata"]["data"][0]["gene_id"]
        # data = db_session.query(Gene).filter(Gene.gene_id == gene_id).first().variants
        # config[0]["variants"]["data"] = [p.as_dict() for p in data]
        config[0]["variants"]["data"] = _get_variants(gene_id)
        # config[0]["variants"]["data"] = _get_variants_by_gene(gene_id)
        config[0]["metadata"]["data"][0]["number_of_variants"] = len(config[0]["variants"]["data"])
        cadd_gt_20 = 0
        for v in config[0]["variants"]["data"]:
            if v["cadd_phred"] and v["cadd_phred"] != "NA" and float(v["cadd_phred"]) >= 20:
                cadd_gt_20 += 1
        config[0]["preview"] = [
            ["pLI", config[0]["metadata"]["data"][0].get("pLI", "")],
            ["Number of variants", config[0]["metadata"]["data"][0]["number_of_variants"]],
            ["CADD > 20", cadd_gt_20],
        ]
        if subset == "preview":
            return jsonify([{subset: y["preview"]} for y in config])
        process_for_display(db_session, config[0]["variants"]["data"])
        # print x[0]['preview']
        # print x[0]['variants']['data'][0]
        if is_demo_user() and gene_name not in ["TTLL5", "DRAM2"]:
            config[0]["variants"]["data"] = []
    if subset == "all":
        return jsonify(config)
    return jsonify([{subset: y[subset]} for y in config])


def query_gene(db_session: Session, gene_id):
    gene_id = gene_id.upper()
    if gene_id.startswith("ENSG"):
        # queries first by gene id if it looks like a gene id
        data = db_session.query(Gene).filter(Gene.gene_id == gene_id).filter(text("chrom ~ '^X|^Y|^[0-9]{1,2}'")).all()
    else:
        # queries then by gene name on the field that stores gene names in upper case
        data = (
            db_session.query(Gene)
            .filter(Gene.gene_name_upper == gene_id)
            .filter(text("chrom ~ '^X|^Y|^[0-9]{1,2}'"))
            .all()
        )
        if not data:
            # otherwise looks for synonyms ensuring complete match by appending quotes
            data = (
                db_session.query(Gene)
                .filter(Gene.other_names.like(f"%{gene_id}%"))
                .filter(text("chrom ~ '^X|^Y|^[0-9]{1,2}'"))
                .all()
            )
    return [p.as_dict() for p in data]


def _get_variants_by_gene(gene_id):
    sqlq = sql.SQL(
        """
        select distinct v.chrom as "CHROM", v.pos as "POS", v."ref" as "REF", v.alt as "ALT", v.cadd_phred, v.dann,
        v.fathmm_score, v.revel, -- new added
        -- removed: v.id
        vg.most_severe_consequence, vg.hgvs_c as hgvsc, vg.hgvs_p as hgvsp, -- via variant_gene
        iv.dp as "DP", iv."fs" as "FS", iv.mq as "MQ", iv."filter" as "FILTER", -- via individual_variant
        (
            select array_agg(i.phenopolis_id)
            from phenopolis.individual i
            join phenopolis.individual_variant iv2 on iv2.individual_id = i.id and iv2.zygosity = 'HOM'
            where vg.variant_id = iv2.variant_id
        ) as "HOM",
        (
            select array_agg(i.phenopolis_id)
            from phenopolis.individual i
            join phenopolis.individual_variant iv2 on iv2.individual_id = i.id and iv2.zygosity = 'HET'
            where vg.variant_id = iv2.variant_id
        ) as "HET",
        (
            select distinct on (ah.chrom,ah.pos,ah."ref",ah.alt) ah.af from kaviar.annotation_hg19 ah
            where ah.chrom = v.chrom and ah.pos = v.pos and ah."ref" = v."ref" and ah.alt = v.alt
            order by ah.chrom,ah.pos,ah."ref",ah.alt,ah.ac desc
        ) as af_kaviar,
        av.af as af_gnomad_genomes -- gnomad
        -- deprecated: MLEAF, MLEAC
        -- not used: gene_symbol, gene_id
        -- need to be added (by Daniele): af_converge, af_hgvd, af_jirdc, af_krgdb, af_tommo,
        from phenopolis.variant v
        join phenopolis.variant_gene vg on vg.variant_id = v.id
        join phenopolis.individual_variant iv on iv.variant_id = vg.variant_id
        left outer join gnomad.annotation_v3 av
            on av.chrom = v.chrom and av.pos = v.pos and av."ref" = v."ref" and av.alt = v.alt
        where vg.gene_id = %s
        order by v.chrom, v.pos, v."ref", v.alt
    """
    )
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(sqlq, [gene_id])
            variants = cursor2dict(cur)
    for v in variants:
        v["variant_id"] = [{"display": f'{v["CHROM"]}-{v["POS"]}-{v["REF"]}-{v["ALT"]}'}]
        if not v["HET"]:
            v["HET"] = []
        if not v["HOM"]:
            v["HOM"] = []
        v["HET_COUNT"] = len(v["HET"])
        v["HOM_COUNT"] = len(v["HOM"])
        v["AC"] = v["HET_COUNT"] + 2 * v["HOM_COUNT"]
        v["AN"] = (v["HET_COUNT"] + v["HOM_COUNT"]) * 2
        v["AF"] = v["AC"] / v["AN"]
        v["af_hgvd"] = ""  # to be added
        v["af_converge"] = ""  # to be added
        v["af_jirdc"] = ""  # to be added
        v["af_krgdb"] = ""  # to be added
        v["af_tommo"] = ""  # to be added
        # -------
        v["ID"] = ""  # to be removed
        v["MLEAC"] = ""  # to be removed
        v["MLEAF"] = ""  # to be removed
        v["gene_symbol"] = ""  # to be removed
        v["gene_id"] = ""  # to be removed

    return variants
