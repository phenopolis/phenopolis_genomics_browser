"""
Autocomplete view
"""
import re
import ujson as json
from flask import jsonify, session, Response, request
from logzero import logger
from db.helpers import cursor2dict
from views import application
from views.exceptions import PhenopolisException
from views.auth import requires_auth
from views.postgres import postgres_cursor

CHROMOSOME_POS_REGEX = re.compile(r"^(\w+)[-:](\d+)$")
CHROMOSOME_POS_REF_REGEX = re.compile(r"^(\w+)[-:](\d+)[-:]([ACGT\*]+)$", re.IGNORECASE)
CHROMOSOME_POS_REF_ALT_REGEX = re.compile(r"^(\w+)[-:](\d+)[-:]([ACGT\*]+)[-:>]([ACGT\*]+)$", re.IGNORECASE)
ENSEMBL_TRANSCRIPT_REGEX = re.compile("^ENST(\d{0,10})", re.IGNORECASE)
ENSEMBL_PROTEIN_REGEX = re.compile("^ENSP(\d{0,10})", re.IGNORECASE)
ENSEMBL_GENE_REGEX = re.compile("^ENSG(\d{0,10})", re.IGNORECASE)
HPO_REGEX = re.compile("^HP:(\d{0,7})", re.IGNORECASE)
PATIENT_REGEX = re.compile("^PH(\d{0,8})", re.IGNORECASE)
HGVSP = "hgvsp"
HGVSC = "hgvsc"

DEFAULT_SEARCH_RESULTS_LIMIT = 20
MAXIMUM_SEARCH_RESULTS_LIMIT = 1000


@application.route("/<language>/autocomplete/<query>")
@application.route("/autocomplete/<query>")
@requires_auth
def autocomplete(query):
    arguments = request.args.to_dict()
    query_type = arguments.get("query_type")
    try:
        limit = int(arguments.get("limit", DEFAULT_SEARCH_RESULTS_LIMIT))
    except ValueError:
        return (
            jsonify(success=False, message="Please, specify a numeric limit value, {}".format(arguments.get("limit"))),
            400,
        )

    if limit > MAXIMUM_SEARCH_RESULTS_LIMIT:
        return (
            jsonify(
                success=False, message="Please, specify a limit lower than {}".format(MAXIMUM_SEARCH_RESULTS_LIMIT)
            ),
            400,
        )
    logger.debug("Autocomplete query '%s' and query type '%s'", query, query_type)

    cursor = postgres_cursor()
    if query_type == "gene":
        results = _search_genes(cursor, query, limit)
    elif query_type == "phenotype":
        results = _search_phenotypes(cursor, query, limit)
    elif query_type == "patient":
        results = _search_patients(cursor, query, limit)
    elif query_type == "variant":
        results_by_coordinates = _search_variants_by_coordinates(cursor, query, limit)
        results_by_hgvs = _search_variants_by_hgvs(cursor, query, limit)
        results = results_by_coordinates + results_by_hgvs
    elif query_type is None or query_type == "":
        results = (
            ["gene:" + x for x in _search_genes(cursor, query, limit)]
            + ["phenotype:" + x for x in _search_phenotypes(cursor, query, limit)]
            + ["patient:" + x for x in _search_patients(cursor, query, limit)]
            + [
                "variant:" + x
                for x in _search_variants_by_coordinates(cursor, query, limit)
                + _search_variants_by_hgvs(cursor, query, limit)
            ]
        )
    else:
        message = "Autocomplete request with unsupported query type '{}'".format(query_type)
        logger.error(message)
        raise PhenopolisException(message)
    cursor.close()

    # removes possible duplicates and chooses 20 suggestions
    return Response(json.dumps(list(set(results))), mimetype="application/json")


def _search_patients(cursor, query, limit):
    r"""'
    Patient (internal_id) format: PH (PH\d{8}) e.g. 'PH00005862' and are restricted to a particular user
    'demo', for example, can only access ['PH00008256', 'PH00008258', 'PH00008267', 'PH00008268']
    so, a search for 'PH000082', for user 'demo', should return only the 4 cases above
    """
    if PATIENT_REGEX.match(query):
        cursor.execute(
            r""" select i.external_id, i.internal_id from individuals i, users_individuals ui where
            ui.internal_id=i.internal_id and ui.user=%(user)s and i.internal_id ILIKE %(query)s limit %(limit)s""",
            {"user": session["user"], "query": "{}%".format(query), "limit": limit},
        )
        patient_hits = cursor2dict(cursor)
    else:
        patient_hits = []
    return [x["internal_id"] for x in patient_hits]


def _search_phenotypes(cursor, query, limit):
    """
    A user may search for things like 'Abnormality of body height' or for an HPO id as HP:1234567 (ie: HP:\d{7})
    """
    if HPO_REGEX.match(query):
        cursor.execute(
            r"""
                       select * from hpo where hpo_id ilike %(query)s limit %(limit)s""",
            {"query": "{}%".format(query), "limit": limit},
        )
    else:
        cursor.execute(
            r"""
                       select * from hpo where hpo_name ilike %(query)s limit %(limit)s""",
            {"query": "%{}%".format(query), "limit": DEFAULT_SEARCH_RESULTS_LIMIT},
        )
    hpo_hits = cursor2dict(cursor)
    return [x["hpo_name"] for x in hpo_hits]


def _search_genes(cursor, query, limit):
    """
    Either search for a gene_id like 'ensg000...', or by gene name like 'ttll...', or by gene synonym like 'asd...'
    """
    if ENSEMBL_GENE_REGEX.match(query):
        cursor.execute(
            r"""select * from genes where "gene_id"::text ilike %(query)s limit %(limit)s""",
            {"query": "{}%".format(query), "limit": limit},
        )
    elif ENSEMBL_TRANSCRIPT_REGEX.match(query):
        # TODO: add search by all Ensembl transcipts (ie: not only canonical) if we add those to the genes table
        cursor.execute(
            r"""select * from genes where "canonical_transcript"::text ilike %(query)s limit %(limit)s""",
            {"query": "{}%".format(query), "limit": limit},
        )
    # TODO: add search by Ensembl protein if we add a column to the genes table
    else:
        cursor.execute(
            r"""select * from genes where gene_name_upper ilike %(suffix_query)s or other_names ilike %(query)s
            limit %(limit)s""",
            {"suffix_query": "%{}%".format(query), "query": "%{}%".format(query), "limit": limit},
        )
    gene_hits = cursor2dict(cursor)
    # while the search is performed on the upper cased gene name, it returns the original gene name
    return [x["gene_name"] for x in gene_hits]


def _search_variants_by_coordinates(cursor, query, limit):
    """
    Assuming a user is searching for 22-38212762-A-G or 22-16269829-T-*
    22-382
    22-382-A
    22-16269-T-*
    22:162
    22-38212:a>g
    """
    chrom, pos, ref, alt = _parse_variant_from_query(query.upper())
    if chrom is not None and ref is not None and alt is not None:
        cursor.execute(
            r"""select "CHROM", "POS", "REF", "ALT" from variants where
            "CHROM"=%(chrom)s and "POS"::text like %(pos)s and "REF"=%(ref)s and "ALT"=%(alt)s limit %(limit)s""",
            {"limit": limit, "chrom": chrom, "pos": pos + "%", "ref": ref, "alt": alt},
        )
    elif chrom is not None and ref is not None and alt is None:
        cursor.execute(
            r"""select "CHROM", "POS", "REF", "ALT" from variants where
                       "CHROM"=%(chrom)s and "POS"::text like %(pos)s and "REF"=%(ref)s limit %(limit)s""",
            {"limit": limit, "chrom": chrom, "pos": pos + "%", "ref": ref},
        )
    elif chrom is not None and ref is None:
        cursor.execute(
            r"""select "CHROM", "POS", "REF", "ALT" from variants where
                       "CHROM"=%(chrom)s and "POS"::text like %(pos)s limit %(limit)s""",
            {"limit": limit, "chrom": chrom, "pos": pos + "%"},
        )
    else:
        # no variant pattern, we perform no search
        return []
    variant_hits = cursor2dict(cursor)
    return ["{CHROM}-{POS}-{REF}-{ALT}".format(**x) for x in variant_hits]


def _search_variants_by_hgvs(cursor, query, limit):
    """
    Assuming a user is searching for ENSP00000451572.1:p.His383Tyr, ENST00000355467.4:c.30C>T or
    ENST00000505973.1:n.97C>T
    The queries need to do something like HGVSC like %query%, because the HGVS codes are a comma separated list in the
    corresponding text column. The query must start with either ENST or ENSP to be performed
    """
    hgvs, hgvs_type = _parse_hgvs_from_query(query)
    if hgvs_type == HGVSC:
        cursor.execute(
            r"""select "CHROM", "POS", "REF", "ALT" from variants where
            "hgvsc"::text ilike %(hgvs)s limit %(limit)s""",
            {"limit": limit, "hgvs": "%" + hgvs + "%"},
        )
    elif hgvs_type == HGVSP:
        cursor.execute(
            r"""select "CHROM", "POS", "REF", "ALT" from variants where
            "hgvsp"::text ilike %(hgvs)s limit %(limit)s""",
            {"limit": limit, "hgvs": "%" + hgvs + "%"},
        )
    else:
        # no variant pattern, we perform no search
        return []
    variant_hits = cursor2dict(cursor)
    return ["{CHROM}-{POS}-{REF}-{ALT}".format(**x) for x in variant_hits]


def _parse_hgvs_from_query(query):
    hgvs_type = None
    hgvs = query
    if ENSEMBL_PROTEIN_REGEX.match(query):
        hgvs_type = HGVSP
    if ENSEMBL_TRANSCRIPT_REGEX.match(query):
        hgvs_type = HGVSC
    return hgvs, hgvs_type


def _parse_variant_from_query(query):
    """
    Extract chromosome, position, reference and alternate from something looking like a variant
    It can extract only chromosome and position, chromosome, position and reference or chromosome, position, reference
    and alternate.
    It expects fields in the variant to be separated by -, : or >. This last one only for separation between reference
    and alternate.
    """
    # TODO: remove the * from the accepted queries if we normalize indels to VCF-like format
    match = CHROMOSOME_POS_REF_ALT_REGEX.match(query)
    if match:
        return match.group(1), match.group(2), match.group(3), match.group(4)
    match = CHROMOSOME_POS_REF_REGEX.match(query)
    if match:
        return match.group(1), match.group(2), match.group(3), None
    match = CHROMOSOME_POS_REGEX.match(query)
    if match:
        return match.group(1), match.group(2), None, None
    return None, None, None, None
