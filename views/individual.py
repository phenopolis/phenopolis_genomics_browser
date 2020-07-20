'''
Individual view
'''
from views import application, session, json, Counter, request, jsonify, itertools, psycopg2, cursor2dict
from views.auth import requires_auth
from views.postgres import postgres_cursor, get_db
from views.general import process_for_display


def get_hpo_ids_per_gene(variants, _ind):
    '''
    :param variants:
    :param _ind: UNUSED
    '''
    c = postgres_cursor()
    for y in variants:
        query = """ select * from gene_hpo where gene_symbol='%s' """ % (y['gene_symbol'])
        c.execute(query)
        _gene_hpo_ids = cursor2dict(c)
        # y['hpo_,terms']=[{'display': c.execute("select hpo_name from hpo where hpo_id=? limit 1",(gh['hpo_id'],)).fetchone()[0], 'end_href':gh['hpo_id']} for gh in gene_hpo_ids if gh['hpo_id'] in ind['ancestor_observed_features'].split(';')]
        y['hpo_,terms'] = []
    return variants


@application.route('/<language>/individual/<individual_id>')
@application.route('/<language>/individual/<individual_id>/<subset>')
@application.route('/individual/<individual_id>')
@application.route('/individual/<individual_id>/<subset>')
@requires_auth
def individual(individual_id, subset='all', language='en'):
    '''
    :param individual_id:
    :param subset:
    :param language:
    '''
    c = postgres_cursor()
    c.execute("select config from user_config u where u.user_name='%s' and u.language='%s' and u.page='%s' limit 1" % (session['user'], language, 'individual'))
    x = c.fetchone()[0]
    c.execute(""" select i.*
            from users_individuals as ui, individuals as i
            where
            i.internal_id=ui.internal_id
            and ui.user='%s'
            and ui.internal_id='%s'
            """ % (session['user'], individual_id,))
    a_individual = cursor2dict(c)
    application.logger.debug(a_individual)
    if a_individual:
        a_individual = a_individual[0]
    else:
        # NOTE: since 'demo' and 'Admin' users apparently have full access to
        x[0]['preview'] = [['Sorry', 'You are not permitted to see this patient']]
        return json.dumps(x)
    ind = a_individual
    if subset == 'preview':
        query = """ select count(1)
        from hom_variants hv, variants v
        where hv."CHROM"=v."CHROM"
        and hv."POS"=v."POS"
        and hv."REF"=v."REF"
        and hv."ALT"=v."ALT"
        and hv.individual='%s' """ % (ind['external_id'],)
        c.execute(query)
        hom_count = c.fetchone()[0]
        query = """ select count(1)
        from het_variants hv, variants v
        where
        hv."CHROM"=v."CHROM"
        and hv."POS"=v."POS"
        and hv."REF"=v."REF"
        and hv."ALT"=v."ALT"
        and hv.individual='%s' """ % (ind['external_id'],)
        c.execute(query)
        het_count = c.fetchone()[0]
        query = """ select count (1) from (select count(1) from het_variants hv, variants v where hv."CHROM"=v."CHROM" and hv."POS"=v."POS" and hv."REF"=v."REF" and hv."ALT"=v."ALT" and hv.individual='%s' group by v.gene_symbol having count(v.gene_symbol)>1) as t """ % (ind['external_id'],)
        c.execute(query)
        comp_het_count = c.fetchone()[0]
        x[0]['preview'] = [
                ['External_id', ind['external_id']],
                ['Sex', ind['sex']],
                ['Genes', [g for g in ind.get('genes', '').split(',')]],
                ['Features', [f for f in ind['simplified_observed_features_names'].split(',')]],
                ['Number of hom variants', hom_count],
                ['Number of compound hets', comp_het_count],
                ['Number of het variants', het_count]]
        return json.dumps(x)
    # hom variants
    query = """ select v.*
        from hom_variants hv, variants v
        where hv."CHROM"=v."CHROM"
        and hv."POS"=v."POS"
        and hv."REF"=v."REF"
        and hv."ALT"=v."ALT"
        and hv.individual='%s' """ % (ind['external_id'],)
    c.execute(query)
    hom_variants = cursor2dict(c)
    hom_variants = get_hpo_ids_per_gene(hom_variants, ind)
    x[0]['rare_homs']['data'] = hom_variants
    # rare variants
    query = """ select v.*
       from het_variants hv, variants v
       where
       hv."CHROM"=v."CHROM"
       and hv."POS"=v."POS"
       and hv."REF"=v."REF"
       and hv."ALT"=v."ALT"
       and hv.individual='%s' """ % (ind['external_id'],)
    c.execute(query)
    rare_variants = cursor2dict(c)
    rare_variants = get_hpo_ids_per_gene(rare_variants, ind)
    x[0]['rare_variants']['data'] = rare_variants
    # rare_comp_hets
    gene_counter = Counter([v['gene_symbol'] for v in x[0]['rare_variants']['data']])
    rare_comp_hets_variants = [v for v in x[0]['rare_variants']['data'] if gene_counter[v['gene_symbol']] > 1]
    rare_comp_hets_variants = get_hpo_ids_per_gene(rare_comp_hets_variants, ind)
    x[0]['rare_comp_hets']['data'] = rare_comp_hets_variants
    # NOTE: there's no such case in 'user_config' table
    if not x[0]['metadata']['data']:
        x[0]['metadata']['data'] = [dict()]
    x[0]['metadata']['data'][0]['sex'] = ind['sex']
    x[0]['metadata']['data'][0]['internal_id'] = [{'display': ind['internal_id']}]
    x[0]['metadata']['data'][0]['external_id'] = ind['external_id']
    x[0]['metadata']['data'][0]['simplified_observed_features'] = [{'display': i, 'end_href': j} for i, j, in zip(ind['simplified_observed_features_names'].split(';'), ind['simplified_observed_features'].split(','))]
    process_for_display(x[0]['rare_homs']['data'])
    process_for_display(x[0]['rare_variants']['data'])
    if ind['genes']:
        x[0]['metadata']['data'][0]['genes'] = [{'display': i} for i in ind.get('genes', '').split(',')]
    else:
        x[0]['metadata']['data'][0]['genes'] = []
    if subset == 'all':
        return json.dumps(x)
    return json.dumps([{subset: y[subset]} for y in x])


@application.route('/<language>/update_patient_data/<individual_id>', methods=['POST'])
@application.route('/update_patient_data/<individual_id>', methods=['POST'])
@requires_auth
def update_patient_data(individual_id, language='en'):
    '''
    :param individual_id:
    :param language:
    '''
    if session['user'] == 'demo':
        return jsonify(error='Demo user not authorised'), 405
    application.logger.debug(request.form)
    consanguinity = request.form.getlist('consanguinity_edit[]')[0]
    gender = request.form.getlist('gender_edit[]')[0]
    genes = request.form.getlist('genes[]')
    features = request.form.getlist('feature[]')
    if not len(features):
        features = ['All']
    gender = {'male': 'M', 'female': 'F', 'unknown': 'U'}.get(gender, 'unknown')
    c = postgres_cursor()
    hpo = []
    for x in features:
        c.execute("select * from hpo where hpo_name='%s' limit 1" % x)
        hpo += [dict(zip(['hpo_id', 'hpo_name', 'hpo_ancestor_ids', 'hpo_ancestor_names'], c.fetchone()))]
    c.execute("select config from user_config u where u.user_name='%s' and u.language='%s' and u.page='%s' limit 1" % (session['user'], language, 'individual'))
    x = c.fetchone()[0]
    c.execute(""" select i.*
        from users_individuals as ui, individuals as i
        where i.internal_id=ui.internal_id
        and ui.user='%s'
        and ui.internal_id='%s' """ % (session['user'], individual_id,))
    a_individual = cursor2dict(c)
    c.close()
    if a_individual:
        a_individual = a_individual[0]
    else:
        x[0]['preview'] = [['Sorry', 'You are not permitted to edit this patient']]
        return json.dumps(x)
    ind = a_individual
    # update
    # features to hpo ids
    ind['sex'] = gender
    ind['consanguinity'] = consanguinity
    ind['observed_features'] = ','.join([h['hpo_id'] for h in hpo])
    ind['observed_features_names'] = ';'.join([h['hpo_name'] for h in hpo])
    ind['simplified_observed_features'] = ind['observed_features']
    ind['simplified_observed_features_names'] = ind['observed_features_names']
    ind['unobserved_features'] = ''
    ind['ancestor_observed_features'] = ';'.join(sorted(list(set(list(itertools.chain.from_iterable([h['hpo_ancestor_ids'].split(';') for h in hpo]))))))
    ind['genes'] = ','.join([x for x in genes])
    application.logger.info("UPDATE: {}".format(ind))
    c = postgres_cursor()
    try:
        c.execute("""update individuals set
            sex='%s',
            consanguinity='%s',
            observed_features='%s',
            observed_features_names='%s',
            simplified_observed_features='%s',
            simplified_observed_features_names='%s',
            ancestor_observed_features='%s',
            unobserved_features='%s',
            genes='%s'
            where external_id='%s'""" %
            (ind['sex'],
             ind['consanguinity'],
             ind['observed_features'],
             ind['observed_features'],
             ind['simplified_observed_features'],
             ind['simplified_observed_features_names'],
             ind['ancestor_observed_features'],
             ind['unobserved_features'],
             ind['genes'],
             ind['external_id'],))
        get_db().commit()
        c.close()
    except (Exception, psycopg2.DatabaseError) as error:
        application.logger.exception(error)
        get_db().rollback()
    finally:
        c.close()
    # print(c.execute("select * from individuals where external_id=?",(ind['external_id'],)).fetchall())
    return jsonify({'success': True}), 200

