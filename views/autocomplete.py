import itertools

from flask import jsonify, session, Response
from logzero import logger
import ujson as json
from db.helpers import cursor2dict
from views import *
from views.exceptions import PhenopolisException
from views.auth import requires_auth
from views.postgres import postgres_cursor
import re

SEARCH_RESULTS_LIMIT = 20


@application.route('/<language>/autocomplete/<query_type>/<query>')
@application.route('/<language>/autocomplete/<query>')
@application.route('/autocomplete/<query_type>/<query>')
@application.route('/autocomplete/<query>')
@requires_auth
def autocomplete(query, query_type=''):
    logger.debug("Autocomplete query '{}' and query type '{}'".format(query, query_type))

    cursor = postgres_cursor()
    if query_type == 'gene':
        results = _search_genes(cursor, query)
    elif query_type == 'phenotype':
        results = _search_phenotypes(cursor, query)
    elif query_type == 'patient':
        results = _search_patients(cursor, query)
    elif query_type == 'variant':
        results = _search_variants(cursor, query)
    elif query_type == '':
        results = ["gene:" + x for x in _search_genes(cursor, query)] + \
                  ["phenotype:" + x for x in _search_phenotypes(cursor, query)] + \
                  ["patient:" + x for x in _search_patients(cursor, query)] + \
                  ["variant:" + x for x in _search_variants(cursor, query)]
    else:
        message = "Autocomplete request with unsupported query type '{}'".format(query_type)
        logger.error(message)
        raise PhenopolisException(message)
    cursor.close()

    # removes possible duplicates and chooses 20 suggestions
    suggestions = list(itertools.islice(list(set(results)), 0, 20))
    return Response(json.dumps(suggestions), mimetype='application/json')


def _search_patients(cursor, query):
    cursor.execute("""
               select
               i.external_id, i.internal_id
               from individuals i,
               users_individuals ui
               where
               ui.internal_id=i.internal_id
               and
               ui.user='{user}'
               and
               i.internal_id like '%{query}%' limit {limit}
               """.format(user=session['user'], query=re.escape(query.upper()), limit=SEARCH_RESULTS_LIMIT))
    patient_hits = cursor2dict(cursor)
    return [x['internal_id'] for x in patient_hits]


def _search_phenotypes(cursor, query):
    cursor.execute("select * from hpo where UPPER(hpo_name) like '%{query}%' limit {limit}".format(
        query=re.escape(query.upper()), limit=SEARCH_RESULTS_LIMIT))
    hpo_hits = cursor2dict(cursor)
    return [x['hpo_name'] for x in hpo_hits]


def _search_genes(cursor, query):
    cursor.execute(
        "select * from genes where gene_name_upper like '%{query}%' or other_names like '{query}' limit {limit}".
        format(query=re.escape(query.upper()), limit=SEARCH_RESULTS_LIMIT))
    gene_hits = cursor2dict(cursor)
    # while the search is performed on the upper cased gene name, it returns the original gene name
    return [x['gene_name'] for x in gene_hits]


def _search_variants(cursor, query):
    chrom, pos, ref, alt = _parse_variant_from_query(query)
    if chrom is not None and ref is not None and alt is not None:
        cursor.execute(
            "select \"CHROM\", \"POS\", \"REF\", \"ALT\" from variants where \"CHROM\"='{chrom}' and \"POS\"={pos} and "
            "\"REF\"='{ref}' and \"ALT\"='{alt}' limit {limit}".
                format(limit=SEARCH_RESULTS_LIMIT, chrom=chrom, pos=pos, ref=ref, alt=alt))
    elif chrom is not None and ref is not None and alt is None:
        cursor.execute(
            "select \"CHROM\", \"POS\", \"REF\", \"ALT\" from variants where \"CHROM\"='{chrom}' and \"POS\"={pos} and "
            "\"REF\"='{ref}' limit {limit}".
                format(limit=SEARCH_RESULTS_LIMIT, chrom=chrom, pos=pos, ref=ref))
    elif chrom is not None and ref is None:
        cursor.execute(
            "select \"CHROM\", \"POS\", \"REF\", \"ALT\" from variants where \"CHROM\"='{chrom}' and \"POS\"={pos} "
            "limit {limit}".
                format(limit=SEARCH_RESULTS_LIMIT, chrom=chrom, pos=pos))
    else:
        # no variant pattern, we perform no search
        return []
    variant_hits = cursor2dict(cursor)
    # while the search is performed on the upper cased gene name, it returns the original gene name
    return ["{chrom}-{pos}-{ref}-{alt}".format(chrom=x['CHROM'], pos=x['POS'], ref=x['REF'], alt=x['ALT']) 
            for x in variant_hits]


def _parse_variant_from_query(query):
    """
    Extract chromosome, position, reference and alternate from something looking like a variant
    It can extract only chromosome and position, chromosome, position and reference or chromosome, position, reference
    and alternate.
    It expects fields in the variant to be separated by -, : or >. This last one only for separation between reference
    and alternte.
    """
    match = re.compile('^(\w+)[-:](\d+)[-:]([ACGT]+)[-:>]([ACGT]+)$').match(query)
    if match:
        return match.group(1), match.group(2), match.group(3), match.group(4)
    match = re.compile('^(\w+)[-:](\d+)[-:]([ACGT]+)$').match(query)
    if match:
        return match.group(1), match.group(2), match.group(3), None
    match = re.compile('^(\w+)[-:](\d+)$').match(query)
    if match:
        return match.group(1), match.group(2), None, None
    return None, None, None, None


@application.route('/best_guess/<query>')
@requires_auth
def best_guess(query=''):
    application.logger.debug(query)
    if query.startswith('gene:'):
        return jsonify(redirect='/gene/{}'.format(query.replace('gene:', '')))
    elif query.startswith('patient:') or query.startswith('PH'):
        return jsonify(redirect='/individual/{}'.format(query.replace('patient:', '')))
    elif query.startswith('phenotype:'):
        return jsonify(redirect='/hpo/{}'.format(query.replace('phenotype:', '')))
    elif query.startswith('variant:'):
        return jsonify(redirect='/variant/{}'.format(query.replace('variant:', '')))
    # TODO: do we need this one yet? probably not.
    elif '-' in query and len(query.split('-')) == 4:
        return jsonify(redirect='/variant/{}'.format(query.replace('variant:', '')))
    return jsonify(message='Could not find search query'), 420
