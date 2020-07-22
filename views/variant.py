"""
variant view
"""
import os
import boto3
import requests
import pysam
from views import application, json, session, cursor2dict
from views.auth import requires_auth
from views.postgres import postgres_cursor, get_db_session
from views.general import process_for_display
from db import and_, Variant


@application.route("/<language>/variant/<variant_id>")
@application.route("/<language>/variant/<variant_id>/<subset>")
@application.route("/variant/<variant_id>")
@application.route("/variant/<variant_id>/<subset>")
@requires_auth
def variant(variant_id, subset="all", language="en"):
    c = postgres_cursor()
    c.execute("select external_id, internal_id from individuals")
    pheno_ids = cursor2dict(c)
    phenoid_mapping = {ind["external_id"]: ind["internal_id"] for ind in pheno_ids}
    # print(phenoid_mapping)
    chrom, pos, ref, alt, = variant_id.split("-")
    url = "https://myvariant.info/v1/variant/chr%s:g.%s%s>%s?fields=clinvar.rcv.clinical_significance&dotfield=true" % (
        chrom,
        pos,
        ref,
        alt,
    )
    x = requests.get(url).json()
    if x:
        clinical_significance = str(x.get("clinvar.rcv.clinical_significance", ""))
    pos = int(pos)
    s3 = boto3.client(
        "s3",
        aws_secret_access_key=os.environ["VCF_S3_SECRET"],
        aws_access_key_id=os.environ["VCF_S3_KEY"],
        region_name="eu-west-2",
        config=boto3.session.Config(signature_version="s3v4"),
    )
    vcf_index = s3.generate_presigned_url(
        "get_object", Params={"Bucket": "phenopolis-vcf", "Key": "August2019/merged2.vcf.gz.tbi"}, ExpiresIn=5000,
    )
    vcf_file = s3.generate_presigned_url(
        "get_object", Params={"Bucket": "phenopolis-vcf", "Key": "August2019/merged2.vcf.gz"}, ExpiresIn=5000,
    )
    variant_file = pysam.VariantFile(vcf_file, index_filename=vcf_index)
    # samples = variant_file.header.samples
    variant_dict = dict()
    v = next(variant_file.fetch(chrom, pos - 1, pos))
    # for v in variant_file.fetch(chrom, pos - 1, pos):
    #         variant_dict['pos'] = v.pos
    #         variant_dict['start'] = v.start
    #         variant_dict['stop'] = v.stop
    #         variant_dict['ref'] = v.ref
    #         variant_dict['alt'] = alt
    #         variant_dict['alleles'] = v.alleles
    #         variant_dict['alts'] = v.alts
    #         variant_dict['rlen'] = v.rlen
    #         variant_dict['chrom'] = v.chrom
    #         variant_dict['id'] = v.id
    #         variant_dict['rid'] = v.rid
    #         variant_dict['qual'] = v.qual
    #         variant_dict['filter'] = list(v.filter.keys())
    #         variant_dict['format'] = {(v.format[k].name, v.format[k].id,) for k in v.format.keys()}
    #         variant_dict['info'] = dict(v.info)
    variant_dict["genotypes"] = [
        {
            "sample": [{"display": phenoid_mapping.get(s)}],
            "GT": v.samples[s].get("GT", ""),
            "AD": v.samples[s].get("AD", ""),
            "DP": v.samples[s].get("DP", ""),
        }
        for s in v.samples
    ]
    c.execute(
        "select config from user_config u where u.user_name='%s' and u.language='%s' and u.page='%s' limit 1"
        % (session["user"], language, "variant")
    )
    x = c.fetchone()[0]
    # CHROM, POS, REF, ALT, = variant_id.split('-')
    data = (
        get_db_session()
        .query(Variant)
        .filter(and_(Variant.CHROM == chrom, Variant.POS == pos, Variant.REF == ref, Variant.ALT == alt,))
    )
    var = [p.as_dict() for p in data]
    process_for_display(var)
    if len(var) == 0:
        var = {}
    else:
        var = var[0]
    x[0]["metadata"]["data"] = [var]
    x[0]["individuals"]["data"] = [var]
    x[0]["frequency"]["data"] = [var]
    x[0]["consequence"]["data"] = [var]
    x[0]["genotypes"]["data"] = variant_dict["genotypes"]
    x[0]["preview"] = [["Clinvar", clinical_significance]]
    if subset == "all":
        return json.dumps(x)
    return json.dumps([{subset: y[subset]} for y in x])
