"""
Gene view
"""
from flask import jsonify, session
from psycopg2 import sql
from sqlalchemy.orm import Session

from db.helpers import cursor2dict, query_user_config
from views import HG_ASSEMBLY, MAX_PAGE_SIZE, application
from views.auth import USER, is_demo_user, requires_auth
from views.exceptions import PhenopolisException
from views.general import _get_pagination_parameters, cache_on_browser, process_for_display
from views.postgres import get_db, session_scope
from views.variant import _get_variants

# NOTE: using tables: ensembl.gene, ensembl.gene_synonym, ensembl.transcript, ensembl.transcript_uniprot
sqlq_main = sql.SQL(
    """select distinct
(
    select array_agg(distinct tu.uniprotswissprot order by tu.uniprotswissprot)
    from ensembl.transcript_uniprot tu
    join ensembl.transcript t on tu.transcript = t.identifier
    where t.ensembl_gene_id = g.ensembl_gene_id
) AS uniprot,
(
    select array_agg(distinct concat(t.ensembl_transcript_id,'@',t.ensembl_peptide_id,'@',t.canonical))
    from ensembl.transcript t where t.ensembl_gene_id = g.ensembl_gene_id
    and t.assembly = g.assembly
) AS transcripts,
(
    select array_agg(distinct gs.external_synonym order by gs.external_synonym)
    from ensembl.gene_synonym gs
    where gs.gene = g.identifier
) AS other_names,
g.ensembl_gene_id as gene_id, g."version", g.description as full_gene_name, g.chromosome as chrom, g."start",
g."end" as "stop", g.strand, g.band, g.biotype, g.hgnc_id, g.hgnc_symbol as gene_symbol,
g.percentage_gene_gc_content, g.assembly
from ensembl.gene g
left outer join ensembl.gene_synonym gs on gs.gene = g.identifier
where g.assembly = %(hga)s
and g.chromosome ~ '^X|^Y|^[0-9]{1,2}'
"""
)


@application.route("/<language>/gene/<gene_id>")
@application.route("/<language>/gene/<gene_id>/<subset>")
@application.route("/gene/<gene_id>")
@application.route("/gene/<gene_id>/<subset>")
@requires_auth
@cache_on_browser()
def gene(gene_id, subset="all", language="en"):
    with session_scope() as db_session:
        config = query_user_config(db_session=db_session, language=language, entity="gene")
        gene = _get_gene(db_session, gene_id)
        if not gene:
            response = jsonify(message="Gene not found")
            response.status_code = 404
            return response
        gene[0]["gene_name"] = gene[0]["gene_symbol"]
        config[0]["metadata"]["data"] = gene
        chrom = config[0]["metadata"]["data"][0]["chrom"]
        start = config[0]["metadata"]["data"][0]["start"]
        stop = config[0]["metadata"]["data"][0]["stop"]
        gene_id = config[0]["metadata"]["data"][0]["gene_id"]
        gene_name = config[0]["metadata"]["data"][0]["gene_symbol"]
        for d in config[0]["metadata"]["data"]:
            ets, eps, cf = [], [], []
            if d["transcripts"]:
                ets, eps, cf = zip(*[x.split("@") for x in sorted(d["transcripts"])])
            d["transcript_ids"] = ",".join(ets)
            d["peptide_id"] = ",".join(eps)
            d["canonical_transcript"] = ""
            d["canonical_peptide"] = ""
            if "t" in cf:
                idx = cf.index("t")
                d["canonical_transcript"] = ets[idx]
                d["canonical_peptide"] = eps[idx]
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
        config[0]["variants"]["data"] = _get_variants(gene_id)
        config[0]["metadata"]["data"][0]["number_of_variants"] = len(config[0]["variants"]["data"])
        cadd_gt_20 = 0
        for v in config[0]["variants"]["data"]:
            if v["cadd_phred"] and v["cadd_phred"] != "NA" and float(v["cadd_phred"]) >= 20:
                cadd_gt_20 += 1
        config[0]["preview"] = [
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


def _get_gene(db_session: Session, gene_id):
    g_id = gene_id.upper()
    sqlq_end = sql.SQL("and (g.ensembl_gene_id = %(g_id)s or upper(g.hgnc_symbol) = %(g_id)s)")
    sqlq = sqlq_main + sqlq_end
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(sqlq, {"g_id": g_id, "hga": HG_ASSEMBLY})
            gene = cursor2dict(cur)
            if not gene:
                application.logger.info("Using gene_synonym")
                sqlq_end = sql.SQL("and upper(gs.external_synonym) = %(g_id)s")
                sqlq = sqlq_main + sqlq_end
                cur.execute(sqlq, {"g_id": g_id, "hga": HG_ASSEMBLY})
                gene = cursor2dict(cur)
    return gene


@application.route("/my_genes")
@requires_auth
def get_all_genes():
    with session_scope() as db_session:
        try:
            limit, offset = _get_pagination_parameters()
            if limit > MAX_PAGE_SIZE:
                return (
                    jsonify(message=f"The maximum page size for genes is {MAX_PAGE_SIZE}"),
                    400,
                )
            sqlq_end = sql.SQL(
                """
            and exists (
                select 1 from public.users_individuals ui
                join phenopolis.individual i on i.phenopolis_id = ui.internal_id
                join phenopolis.individual_gene ig on i.id = ig.individual_id and ig.gene_id = g.identifier
                where ui."user" = %(user)s)
            """
            )
            sqlq = sqlq_main + sqlq_end + sql.SQL(f"limit {limit} offset {offset}")
            with get_db() as conn:
                with conn.cursor() as cur:
                    cur.execute(sqlq, {"user": session[USER], "hga": HG_ASSEMBLY})
                    genes = cursor2dict(cur)
            process_for_display(db_session, genes)
        except PhenopolisException as e:
            return jsonify(success=False, message=str(e)), e.http_status
    return jsonify(genes), 200
