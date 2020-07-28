"""
Gene view
"""
import db.helpers
import ujson as json
from flask import jsonify, session
from views import application
from views.auth import requires_auth
from views.postgres import get_db_session
from views.general import process_for_display
from db import Gene


@application.route("/<language>/gene/<gene_id>")
@application.route("/<language>/gene/<gene_id>/<subset>")
@application.route("/gene/<gene_id>")
@application.route("/gene/<gene_id>/<subset>")
@requires_auth
def gene(gene_id, subset="all", language="en"):
    config = db.helpers.query_user_config(language=language, entity='gene')
    data = query_gene(gene_id)
    if not data:
        return jsonify({"Gene not found": False}), 404
    config[0]["metadata"]["data"] = data
    chrom = config[0]["metadata"]["data"][0]["chrom"]
    start = config[0]["metadata"]["data"][0]["start"]
    stop = config[0]["metadata"]["data"][0]["stop"]
    gene_id = config[0]["metadata"]["data"][0]["gene_id"]
    gene_name = config[0]["metadata"]["data"][0]["gene_name"]
    for d in config[0]["metadata"]["data"]:
        # d['pLI']=1
        d["external_services"] = [
            {"display": "GnomAD Browser", "href": "http://gnomad.broadinstitute.org/gene/" + gene_id},
            {"display": "GeneCards", "href": "http://www.genecards.org/cgi-bin/carddisp.pl?gene=" + gene_name},
        ]
        d["genome_browser"] = [
            {"display": "Ensembl Browser", "href": "http://grch37.ensembl.org/Homo_sapiens/Gene/Summary?g=" + gene_id},
            {
                "display": "UCSC Browser",
                "href": "http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg19&position=chr%s:%s-%s" % (chrom, start, stop,),
            },
        ]
        d["other"] = [
            {"display": "Wikipedia", "href": "http://en.wikipedia.org/" + gene_name},
            {"display": "Pubmed Search", "href": "http://www.ncbi.nlm.nih.gov/pubmed?term=" + gene_name},
            {"display": "Wikigenes", "href": "http://www.wikigenes.org/?search=" + gene_name},
            {"display": "GTEx (expression)", "href": "http://www.gtexportal.org/home/gene/" + gene_name},
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
    gene_id = config[0]["metadata"]["data"][0]["gene_id"]
    data = get_db_session().query(Gene).filter(Gene.gene_id == gene_id).first().variants
    config[0]["variants"]["data"] = [p.as_dict() for p in data]
    cadd_gt_20 = 0
    for v in config[0]["variants"]["data"]:
        v["variant_id"] = [{"display": "%s-%s-%s-%s" % (v["CHROM"], v["POS"], v["REF"], v["ALT"],)}]
        if v["cadd_phred"] and v["cadd_phred"] != "NA" and float(v["cadd_phred"]) >= 20:
            cadd_gt_20 += 1
    config[0]["preview"] = [
        ["pLI", config[0]["metadata"]["data"][0].get("pLI", "")],
        ["Number of variants", len(config[0]["variants"]["data"])],
        ["CADD > 20", cadd_gt_20],
    ]
    for d in config[0]["metadata"]["data"]:
        d["number_of_variants"] = len(config[0]["variants"]["data"])
    process_for_display(config[0]["variants"]["data"])
    # print x[0]['preview']
    # print x[0]['variants']['data'][0]
    if session["user"] == "demo" and gene_name not in ["TTLL5", "DRAM2"]:
        config[0]["variants"]["data"] = []
    if subset == "all":
        return json.dumps(config)
    return json.dumps([{subset: y[subset]} for y in config])


def query_gene(gene_id):
    gene_id = gene_id.upper()
    if gene_id.startswith("ENSG"):
        # queries first by gene id if it looks like a gene id
        data = get_db_session().query(Gene).filter(Gene.gene_id == gene_id).all()
    else:
        # queries then by gene name on the field that stores gene names in upper case
        data = get_db_session().query(Gene).filter(Gene.gene_name_upper == gene_id).all()
        if not data:
            # otherwise looks for synonyms ensuring complete match by appending quotes
            data = get_db_session().query(Gene).filter(Gene.other_names.like('%"' + gene_id + '"%')).all()
    return [p.as_dict() for p in data]


def query_user_config(language):
    cursor = postgres_cursor()
    cursor.execute(
        "select config from user_config u where u.user_name='%s' and u.language='%s' and u.page='%s' limit 1"
        % (session["user"], language, "gene")
    )
    config = cursor.fetchone()[0]
    cursor.close()
    return config
