"""
Autocomplete view
"""
import re
import itertools
from logzero import logger
from views import application, Response, session, json, jsonify, cursor2dict
from views.exceptions import PhenopolisException
from views.auth import requires_auth
from views.postgres import postgres_cursor

SEARCH_RESULTS_LIMIT = 20


@application.route("/<language>/autocomplete/<query_type>/<query>")
@application.route("/<language>/autocomplete/<query>")
@application.route("/autocomplete/<query_type>/<query>")
@application.route("/autocomplete/<query>")
@requires_auth
def autocomplete(query, query_type=""):
    logger.debug("Autocomplete query '%s' and query type '%s'", query, query_type)

    cursor = postgres_cursor()
    if query_type == "gene":
        results = _search_genes(cursor, query)
    elif query_type == "phenotype":
        results = _search_phenotypes(cursor, query)
    elif query_type == "patient":
        results = _search_patients(cursor, query)
    elif query_type == "variant":
        results = _search_variants(cursor, query)
    elif query_type == "":
        results = (
            ["gene:" + x for x in _search_genes(cursor, query)]
            + ["phenotype:" + x for x in _search_phenotypes(cursor, query)]
            + ["patient:" + x for x in _search_patients(cursor, query)]
            + ["variant:" + x for x in _search_variants(cursor, query)]
        )
    else:
        message = "Autocomplete request with unsupported query type '{}'".format(
            query_type
        )
        logger.error(message)
        raise PhenopolisException(message)
    cursor.close()

    # removes possible duplicates and chooses 20 suggestions
    suggestions = list(itertools.islice(list(set(results)), 0, 20))
    return Response(json.dumps(suggestions), mimetype="application/json")


def _search_patients(cursor, query):
    r"""'
    Patient (internal_id) format: PH (PH\d{8}) e.g. 'PH00005862' and are restricted to a particular user
    'demo', for example, can only access ['PH00008256', 'PH00008258', 'PH00008267', 'PH00008268']
    so, a search for '82', for user 'demo', should return only the 4 cases above
    """
    cursor.execute(
        r""" select i.external_id, i.internal_id from individuals i, users_individuals ui where
        ui.internal_id=i.internal_id and ui.user=%(user)s and i.internal_id LIKE %(query)s limit %(limit)s""",
        {
            "user": session["user"],
            "query": "%{}%".format(query.upper()),
            "limit": SEARCH_RESULTS_LIMIT,
        },
    )
    patient_hits = cursor2dict(cursor)
    return [x["internal_id"] for x in patient_hits]


def _search_phenotypes(cursor, query):
    """
    A user may search for things like 'Abnormality of body height'
    """
    cursor.execute(
        r"""
                   select * from hpo where UPPER(hpo_name) like %(query)s limit %(limit)s""",
        {"query": "%{}%".format(query.upper()), "limit": SEARCH_RESULTS_LIMIT},
    )
    hpo_hits = cursor2dict(cursor)
    return [x["hpo_name"] for x in hpo_hits]


def _search_genes(cursor, query):
    """
    Either search for a gene_id like 'ensg000...', or by gene name like 'ttll...', or by gene synonym like 'asd...'
    """
    cursor.execute(
        r"""select * from genes where gene_name_upper like %(suffix_query)s or other_names like %(query)s
        or gene_id like %(query)s limit %(limit)s""",
        {
            "suffix_query": "%{}%".format(query.upper()),
            "query": "%{}%".format(query.upper()),
            "limit": SEARCH_RESULTS_LIMIT,
        },
    )
    gene_hits = cursor2dict(cursor)
    # while the search is performed on the upper cased gene name, it returns the original gene name
    return [x["gene_name"] for x in gene_hits]


def _search_variants(cursor, query):
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
            {
                "limit": SEARCH_RESULTS_LIMIT,
                "chrom": chrom,
                "pos": pos + "%",
                "ref": ref,
                "alt": alt,
            },
        )
    elif chrom is not None and ref is not None and alt is None:
        cursor.execute(
            r"""select "CHROM", "POS", "REF", "ALT" from variants where
                       "CHROM"=%(chrom)s and "POS"::text like %(pos)s and "REF"=%(ref)s limit %(limit)s""",
            {
                "limit": SEARCH_RESULTS_LIMIT,
                "chrom": chrom,
                "pos": pos + "%",
                "ref": ref,
            },
        )
    elif chrom is not None and ref is None:
        cursor.execute(
            r"""select "CHROM", "POS", "REF", "ALT" from variants where
                       "CHROM"=%(chrom)s and "POS"::text like %(pos)s limit %(limit)s""",
            {"limit": SEARCH_RESULTS_LIMIT, "chrom": chrom, "pos": pos + "%"},
        )
    else:
        # no variant pattern, we perform no search
        return []
    variant_hits = cursor2dict(cursor)
    # while the search is performed on the upper cased gene name, it returns the original gene name
    #     return [f"{x['CHROM']}-{x['POS']}-{x['REF']}-{x['ALT']}" for x in variant_hits]
    return ["{CHROM}-{POS}-{REF}-{ALT}".format(**x) for x in variant_hits]


def _parse_variant_from_query(query):
    """
    Extract chromosome, position, reference and alternate from something looking like a variant
    It can extract only chromosome and position, chromosome, position and reference or chromosome, position, reference
    and alternate.
    It expects fields in the variant to be separated by -, : or >. This last one only for separation between reference
    and alternate.
    """
    # TODO: remove the * from the accepted queries if we normalize indels to VCF-like format
    match = re.compile(r"^(\w+)[-:](\d+)[-:]([ACGT\*]+)[-:>]([ACGT\*]+)$").match(query)
    if match:
        return match.group(1), match.group(2), match.group(3), match.group(4)
    match = re.compile(r"^(\w+)[-:](\d+)[-:]([ACGT\*]+)$").match(query)
    if match:
        return match.group(1), match.group(2), match.group(3), None
    match = re.compile(r"^(\w+)[-:](\d+)$").match(query)
    if match:
        return match.group(1), match.group(2), None, None
    return None, None, None, None


@application.route("/best_guess/<query>")
@requires_auth
def best_guess(query=""):
    application.logger.debug(query)
    if query.startswith("gene:"):
        return jsonify(redirect="/gene/{}".format(query.replace("gene:", "")))
    if query.startswith("patient:") or query.startswith("PH"):
        return jsonify(redirect="/individual/{}".format(query.replace("patient:", "")))
    if query.startswith("phenotype:"):
        return jsonify(redirect="/hpo/{}".format(query.replace("phenotype:", "")))
    if query.startswith("variant:"):
        return jsonify(redirect="/variant/{}".format(query.replace("variant:", "")))
    # TODO: do we need this one yet? probably not.
    if "-" in query and len(query.split("-")) == 4:
        return jsonify(redirect="/variant/{}".format(query.replace("variant:", "")))
    return jsonify(message="Could not find search query"), 420
