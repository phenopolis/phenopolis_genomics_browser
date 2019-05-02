from views import *
import json
from collections import defaultdict, Counter

@app.route('/<language>/individual/<individual_id>')
@app.route('/<language>/individual/<individual_id>/<subset>')
@app.route('/individual/<individual_id>')
@app.route('/individual/<individual_id>/<subset>')
@requires_auth
def individual(individual_id, subset='all', language='en'):
   c,fd,=sqlite3_ro_cursor(app.config['PHENOPOLIS_DB'])
   x=json.loads(file(app.config['USER_CONFIGURATION'].format(session['user'],language,'individual') ,'r').read())
   c.execute(""" select i.*
           from users_individuals as ui, individuals as i
           where
           i.internal_id=ui.internal_id
           and ui.user=?
           and ui.internal_id=?
           """,(session['user'],individual_id,))
   individual=[dict(zip( [h[0] for h in c.description],r)) for r in c.fetchall()]
   print(individual)
   if individual:
       individual=individual[0]
   else:
       x[0]['preview']=[['Sorry', 'You are not permitted to see this patient']]
       return json.dumps(x)
   ind=individual
   if subset=='preview':
       query=""" select count(1)
       from hom_variants hv, variants v
       where hv."#CHROM"=v."#CHROM"
       and hv."POS"=v."POS"
       and hv."REF"=v."REF"
       and hv."ALT"=v."ALT"
       and hv.individual='%s' """ % (ind['external_id'],)
       hom_count=c.execute(query).fetchone()[0]
       query=""" select count(1)
       from het_variants hv, variants v
       where
       hv."#CHROM"=v."#CHROM"
       and hv."POS"=v."POS"
       and hv."REF"=v."REF"
       and hv."ALT"=v."ALT"
       and hv.individual='%s' """ % (ind['external_id'],)
       het_count=c.execute(query).fetchone()[0]
       query=""" select count (1) from (select count(1) from het_variants hv, variants v where hv."#CHROM"=v."#CHROM" and hv."POS"=v."POS" and hv."REF"=v."REF" and hv."ALT"=v."ALT" and hv.individual='%s' group by v.gene_symbol having count(v.gene_symbol)>1) as t """ % (ind['external_id'],)
       comp_het_count=c.execute(query).fetchone()[0]
       x[0]['preview']=[
               ['External_id', ind['external_id']],
               ['Sex', ind['sex']],
               ['Genes', [g for g in ind.get('genes','').split(',')]],
               ['Features',[f for f in ind['simplified_observed_features_names'].split(',')]],
               ['Number of hom variants',hom_count],
               ['Number of compound hets',comp_het_count],
               ['Number of het variants', het_count] ]
       sqlite3_ro_close(c,fd)
       return json.dumps(x)
   # hom variants
   query=""" select v.*
       from hom_variants hv, variants v
       where hv."#CHROM"=v."#CHROM"
       and hv."POS"=v."POS"
       and hv."REF"=v."REF"
       and hv."ALT"=v."ALT"
       and hv.individual='%s' """ % (ind['external_id'],)
   print query
   c.execute(query)
   hom_variants=[dict(zip( [h[0] for h in c.description] ,r)) for r in c.fetchall()]
   x[0]['rare_homs']['data']=hom_variants
   # rare variants
   query=""" select v.*
      from het_variants hv, variants v
      where
      hv."#CHROM"=v."#CHROM"
      and hv."POS"=v."POS"
      and hv."REF"=v."REF"
      and hv."ALT"=v."ALT" and hv.individual='%s' """ % (ind['external_id'],)
   print query
   c.execute(query)
   rare_variants=[dict(zip( [h[0] for h in c.description],r)) for r in c.fetchall()]
   sqlite3_ro_close(c,fd)
   x[0]['rare_variants']['data']=rare_variants
   # rare_comp_hets
   gene_counter=Counter([v['gene_symbol'] for v in x[0]['rare_variants']['data']])
   x[0]['rare_comp_hets']['data']=[v for v in x[0]['rare_variants']['data'] if gene_counter[v['gene_symbol']]>1]
   if not x[0]['metadata']['data']: x[0]['metadata']['data']=[dict()]
   x[0]['metadata']['data'][0]['sex']=ind['sex']
   x[0]['metadata']['data'][0]['internal_id']=[{'display':ind['internal_id']}]
   x[0]['metadata']['data'][0]['external_id']=ind['external_id']
   x[0]['metadata']['data'][0]['simplified_observed_features']=[{'display':i, 'end_href':j} for i,j, in zip(ind['simplified_observed_features_names'].split(';'),ind['simplified_observed_features'].split(','))]
   process_for_display(x[0]['rare_homs']['data'])
   process_for_display(x[0]['rare_variants']['data'])
   if ind['genes']:
       x[0]['metadata']['data'][0]['genes']=[{'display':i} for i in ind.get('genes','').split(',')]
   else:
       x[0]['metadata']['data'][0]['genes']=[]
   if subset=='all':
       return json.dumps(x)
   else:
       return json.dumps([{subset:y[subset]} for y in x])
    
@app.route('/<language>/update_patient_data/<individual_id>',methods=['POST'])
@app.route('/update_patient_data/<individual_id>',methods=['POST'])
@requires_auth
def update_patient_data(individual_id,language='en'):
   if session['user']=='demo': return jsonify(error='Unauthorized'), 401
   print(request.form)
   consanguinity=request.form.getlist('consanguinity_edit[]')[0]
   gender=request.form.getlist('gender_edit[]')[0]
   genes=request.form.getlist('genes[]')
   features=request.form.getlist('feature[]')
   gender={'male':'M','female':'F','unknown':'U'}.get(gender,'unknown')
   print('INDIVIDUAL',individual_id)
   print('GENDER',gender)
   print('CONSANGUINITY',consanguinity)
   print('GENES',genes)
   print('FEATURES',features)
   print(individual_id)
   c,fd,=sqlite3_ro_cursor(app.config['PHENOPOLIS_DB'])
   hpo=[dict(zip(['hpo_id','hpo_name','hpo_ancestor_ids','hpo_ancestor_names'] ,c.execute("select * from hpo where hpo_name=? limit 1",(x,)).fetchone())) for x in features]
   print hpo
   x=json.loads(file(app.config['USER_CONFIGURATION'].format(session['user'],language,'individual') ,'r').read())
   c.execute(""" select i.*
       from users_individuals as ui, individuals as i
       where i.internal_id=ui.internal_id
       and ui.user=?
       and ui.internal_id=? """,
       (session['user'],individual_id,))
   individual=[dict(zip( [h[0] for h in c.description],r)) for r in c.fetchall()]
   sqlite3_ro_close(c,fd,)
   print(individual)
   if individual:
       individual=individual[0]
   else:
       x[0]['preview']=[['Sorry', 'You are not permitted to edit this patient']]
       return json.dumps(x)
   ind=individual
   #update
   #features to hpo ids
   ind['sex']=gender
   ind['consanguinity']=consanguinity
   ind['observed_features']=','.join([h['hpo_id'] for h in hpo])
   ind['observed_features_names']=';'.join([h['hpo_name'] for h in hpo])
   ind['simplified_observed_features']=ind['observed_features']
   ind['simplified_observed_features_names']=ind['observed_features_names']
   ind['unobserved_features']=''
   ind['ancestor_observed_features']=';'.join(sorted(list(set(list(itertools.chain.from_iterable([h['hpo_ancestor_ids'].split(';') for h in hpo]))))))
   ind['genes']=','.join([x for x in genes])
   print 'UPDATE:', ind
   conn,c,=sqlite3_cursor(app.config['PHENOPOLIS_DB'])
   c.execute("""update individuals set
           sex=?,
           consanguinity=?,
           observed_features=?,
           observed_features_names=?,
           simplified_observed_features=?,
           simplified_observed_features_names=?,
           ancestor_observed_features=?,
           unobserved_features=?,
           genes=?
           where external_id=?""",
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
   print c.execute("select * from individuals where external_id=?",(ind['external_id'],)).fetchall()
   sqlite3_close(conn,c)
   return jsonify({'success': True}), 200





