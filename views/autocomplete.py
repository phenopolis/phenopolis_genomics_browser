from logzero import logger

from views import *
from views.exceptions import PhenopolisException


@application.route('/<language>/autocomplete/<query_type>/<query>')
@application.route('/<language>/autocomplete/<query>')
@application.route('/autocomplete/<query_type>/<query>')
@application.route('/autocomplete/<query>')
@requires_auth
def autocomplete(query, query_type=''):

    logger.debug("Autocomplete query '{}' and query type '{}'".format(query, query_type))

    cursor = postgres_cursor()
    regex_query = "%" + re.escape(query.upper()) + "%"
    if query_type == 'gene':
        results = _search_genes(cursor, regex_query)
    elif query_type == 'phenotype':
        results = _search_phenotypes(cursor, regex_query)
    elif query_type == 'patient':
        results = _search_patients(cursor, regex_query)
    elif query_type == '':
        results = ["gene:" + x for x in _search_genes(cursor, regex_query)] + \
                  ["phenotype:" + x for x in _search_phenotypes(cursor, regex_query)] + \
                  ["patient:" + x for x in _search_patients(cursor, regex_query)]
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
               i.internal_id like '{query}' limit 20
               """.format(user=session['user'], query=query))
    patient_hits = [dict(zip([h[0] for h in cursor.description], r)) for r in cursor.fetchall()]
    return [x['internal_id'] for x in patient_hits]


def _search_phenotypes(cursor, query):
    cursor.execute("select * from hpo where UPPER(hpo_name) like '{query}' limit 20".format(query=query))
    headers = [h[0] for h in cursor.description]
    hpo_hits = [dict(zip(headers, r)) for r in cursor.fetchall()]
    return [x['hpo_name'] for x in hpo_hits]


def _search_genes(cursor, query):
    cursor.execute("select * from genes where gene_name_upper like '{query}' limit 20".format(query=query))
    headers = [h[0] for h in cursor.description]
    gene_hits = [dict(zip(headers, r)) for r in cursor.fetchall()]
    # while the search is performed on the upper cased gene name, it returns the original gene name
    return [x['gene_name'] for x in gene_hits]


@application.route('/best_guess/<query>')
@requires_auth
def best_guess(query=''):
    print(query)
    if query.startswith('gene:'):
        return jsonify(redirect='/gene/{}'.format(query.replace('gene:', '')))
    elif query.startswith('patient:') or query.startswith('PH'):
        return jsonify(redirect='/individual/{}'.format(query.replace('patient:', '')))
    elif query.startswith('phenotype:'):
        return jsonify(redirect='/hpo/{}'.format(query.replace('phenotype:', '')))
    elif query.startswith('variant:'):
        return jsonify(redirect='/variant/{}'.format(query.replace('variant:', '')))
    elif '-' in query and len(query.split('-')) == 4:
        return jsonify(redirect='/variant/{}'.format(query.replace('variant:', '')))
    return jsonify(message='Could not find search query'), 420
