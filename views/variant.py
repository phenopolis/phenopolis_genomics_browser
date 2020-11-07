"""
variant view
"""
import os
import boto3
import pysam
import requests
import db.helpers
from db.model import Variant
from views import application
from views.auth import requires_auth
from views.autocomplete import CHROMOSOME_POS_REF_ALT_REGEX
from views.individual import get_authorized_individuals
from views.postgres import session_scope
from views.general import process_for_display, cache_on_browser
from sqlalchemy import and_
from flask import jsonify


@application.route("/<language>/variant/<variant_id>")
@application.route("/<language>/variant/<variant_id>/<subset>")
@application.route("/variant/<variant_id>")
@application.route("/variant/<variant_id>/<subset>")
@requires_auth
@cache_on_browser()
def variant(variant_id, subset="all", language="en"):
    with session_scope() as db_session:

        # get all individuals mapping
        # TODO: avoid fetching all individuals from DB in every query
        individuals = get_authorized_individuals(db_session)
        individual_ids_mapping = {i.external_id: i.internal_id for i in individuals}

        # parse variant id
        chrom, pos, ref, alt = _parse_variant_id(variant_id)
        if chrom is None:
            response = jsonify(message="Wrong variant search, the variant id must follow the format "
                                       "chromosome-position-reference-alternate")
            response.status_code = 400
            return response

        # queries for Clinvar clinical significance
        clinical_significance = _fetch_clinvar_clinical_significance(alt, chrom, pos, ref)

        # reads the variant file from S3
        variant_file = _get_variant_file()

        # get the genotype information for this variant from the VCF
        genotypes = _get_genotypes(chrom, individual_ids_mapping, pos, variant_file)

        config = db.helpers.query_user_config(db_session=db_session, language=language, entity="variant")
        variants = db_session.query(Variant).filter(
            and_(Variant.CHROM == chrom, Variant.POS == pos, Variant.REF == ref, Variant.ALT == alt)
        ).all()
        variants_dict = [v.as_dict() for v in variants]
        process_for_display(db_session, variants_dict)
        if len(variants_dict) == 0:
            variants_dict = {}
        else:
            variants_dict = variants_dict[0]
        config[0]["metadata"]["data"] = [variants_dict]
        config[0]["individuals"]["data"] = [variants_dict]
        config[0]["frequency"]["data"] = [variants_dict]
        config[0]["consequence"]["data"] = [variants_dict]
        config[0]["genotypes"]["data"] = genotypes
        config[0]["preview"] = [["Clinvar", clinical_significance]]
        if subset == "all":
            return jsonify(config)
        return jsonify([{subset: y[subset]} for y in config])


def _get_genotypes(chrom, phenoid_mapping, pos, variant_file):
    genotypes = []
    try:
        v = next(variant_file.fetch(chrom, pos - 1, pos))
        genotypes = [
            {
                # NOTE: samples didn't use to care about which samples were authorized to view, now variants
                # belonging to non authorized are shown but the sample id is not
                "sample": [{"display": phenoid_mapping.get(s)}],
                "GT": v.samples[s].get("GT", ""),
                "AD": v.samples[s].get("AD", ""),
                "DP": v.samples[s].get("DP", ""),
            }
            for s in v.samples
        ]
    except Exception as e:
        print(e)
    return genotypes


def _get_variant_file():
    # TODO: initialise the client only once, or at least have a pool of them to reuse
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
    return variant_file


def _fetch_clinvar_clinical_significance(alt, chrom, pos, ref):
    # TODO: replace this by a query to our database once we have this dataset loaded
    clinical_significance = None
    url = "https://myvariant.info/v1/variant/chr%s:g.%d%s>%s?fields=clinvar.rcv.clinical_significance&dotfield=true" % (
        chrom, pos, ref, alt,
    )
    x = requests.get(url).json()
    if x:
        clinical_significance = str(x.get("clinvar.rcv.clinical_significance", ""))
    return clinical_significance


def _parse_variant_id(variant_id):
    chrom, pos, ref, alt = None, None, None, None
    match = CHROMOSOME_POS_REF_ALT_REGEX.match(variant_id)
    if match:
        chrom = match.group(1)
        pos = int(match.group(2))
        ref = match.group(3)
        alt = match.group(4)
    return chrom, pos, ref, alt
