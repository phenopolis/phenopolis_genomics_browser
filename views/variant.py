"""
variant view
"""
import requests
from db.model import Variant
from views import application, variant_file, phenoid_mapping
from views.auth import DEMO_USER, USER, requires_auth
from views.autocomplete import CHROMOSOME_POS_REF_ALT_REGEX
from views.postgres import session_scope
from views.general import cache_on_browser, process_for_display
from sqlalchemy import and_
from flask import jsonify, Response, session
from db.helpers import query_user_config


@application.route("/<language>/variant/<variant_id>")
@application.route("/variant/<variant_id>")
@requires_auth
@cache_on_browser()
def variant(variant_id, language="en") -> Response:

    # parse variant id
    chrom, pos, ref, alt = _parse_variant_id(variant_id)
    if chrom is None:
        response = jsonify(message="Wrong variant id. Format must be CHROM-POS-REF-ALT")
        response.status_code = 400
        return response

    return _get_variant(chrom, pos, ref, alt, language)


@application.route("/variant/preview/<variant_id>")
@requires_auth
@cache_on_browser()
def variant_preview(variant_id) -> Response:

    # parse variant id
    chrom, pos, ref, alt = _parse_variant_id(variant_id)
    if chrom is None:
        response = jsonify(message="Wrong variant id. Format must be CHROM-POS-REF-ALT")
        response.status_code = 400
        return response

    return _get_preview(chrom, pos, ref, alt)


def _get_variant(chrom, pos, ref, alt, language):

    with session_scope() as db_session:

        variant = (
            db_session.query(Variant)
            .filter(and_(Variant.CHROM == chrom, Variant.POS == pos, Variant.REF == ref, Variant.ALT == alt))
            .first()
        )

        if variant is None:
            response = jsonify(message="Variant not found")
            response.status_code = 404
            return response

        # get the genotype information for this variant from the VCF
        if session[USER] == DEMO_USER:
            genotypes = []
        else:
            genotypes = _get_genotypes(chrom, pos)

        variant_dict = variant.as_dict()
        process_for_display(db_session, [variant_dict])
        config = query_user_config(db_session=db_session, language=language, entity="variant")
        config[0]["metadata"]["data"] = [variant_dict]
        config[0]["individuals"]["data"] = [variant_dict]
        config[0]["frequency"]["data"] = [variant_dict]
        config[0]["consequence"]["data"] = [variant_dict]
        config[0]["genotypes"]["data"] = genotypes
        return jsonify(config)


def _get_preview(chrom, pos, ref, alt):
    # queries for Clinvar clinical significance
    clinical_significance = _fetch_clinvar_clinical_significance(chrom, pos, ref, alt)
    preview = {"Clinvar": clinical_significance}
    # TODO: add more things here eg: GnomAD frequency, SO effect
    return jsonify(preview)


def _get_genotypes(chrom, pos):
    genotypes = []
    # reads the variant file from S3
    try:
        v = next(variant_file(f"{chrom}:{pos}-{pos}"))
        lookup = {s: i for i, s in enumerate(variant_file.samples)}
        gts = [tuple([item if item >= 0 else None for item in alist[:2]]) for alist in v.genotypes]
        rds = [x.item() if x >= 0 else None for x in v.gt_ref_depths]
        ads = [x.item() if x >= 0 else None for x in v.gt_alt_depths]
        dps = [x.item() if x >= 0 else None for x in v.gt_depths]
        genotypes = [
            {
                # NOTE: samples didn't use to care about which samples were authorized to view, now variants
                # belonging to non authorized are shown but the sample id is not
                "sample": [{"display": phenoid_mapping.get(s)}],
                "GT": gts[lookup[s]][:2],
                "AD": (rds[lookup[s]], ads[lookup[s]]),
                "DP": dps[lookup[s]],
            }
            for s in variant_file.samples
            if phenoid_mapping.get(s) is not None
        ]
    except Exception as e:
        print(e)
    return genotypes


def _fetch_clinvar_clinical_significance(chrom, pos, ref, alt):
    # TODO: replace this by a query to our database once we have this dataset loaded
    clinical_significance = None
    url = "https://myvariant.info/v1/variant/chr%s:g.%d%s>%s?fields=clinvar.rcv.clinical_significance&dotfield=true" % (
        chrom,
        pos,
        ref,
        alt,
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
