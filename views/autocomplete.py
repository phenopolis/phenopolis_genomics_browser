from views import *


@app.route('/<language>/autocomplete/<query_type>/<query>')
@app.route('/<language>/autocomplete/<query>')
@app.route('/autocomplete/<query_type>/<query>')
@app.route('/autocomplete/<query>')
@requires_auth
def autocomplete(query, query_type=''):
   if query_type: query_type=query_type+':'
   print query_type, query
   patient_results=[]
   gene_results=[]
   hpo_results=[]
   regex="%"+re.escape(query)+"%"
   c,fd,=sqlite3_ro_cursor(app.config['PHENOPOLIS_DB'])
   #c.execute("select * from phenopolis_ids")
   #pheno_ids=[dict(zip([h[0] for h in c.description],r)) for r in c.fetchall()]
   #phenoid_mapping={ind['internal_id']:ind['external_id'] for ind in pheno_ids}
   if query_type in ['gene:','']: 
       c.execute("select * from genes where gene_name_upper like '%s' limit 20"%regex)
       headers=[h[0] for h in c.description]
       gene_hits=[dict(zip(headers,r)) for r in c.fetchall()]
       if query_type=='gene:':
           gene_results = [x['gene_name_upper'] for x in gene_hits]
       else:
           gene_results = [query_type+x['gene_name_upper'] for x in gene_hits]
   if query_type in ['phenotype:','']: 
       c.execute("select * from hpo where hpo_name like '%s' limit 20"%regex)
       headers=[h[0] for h in c.description]
       hpo_hits=[dict(zip(headers,r)) for r in c.fetchall()]
       if query_type=='phenotype:':
           hpo_results = [x['hpo_name'] for x in hpo_hits]
       else:
           hpo_results = [query_type+x['hpo_name'] for x in hpo_hits]
   if query_type in ['patient:','']:
       #c,fd,=sqlite3_ro_cursor(app.config['PATIENTS_DB'].format(session['user']))
       c.execute("select * from phenopolis_ids where internal_id like '%s' limit 20"%regex)
       #c.execute("select * from individuals where external_id like '%s' limit 20"%regex)
       patient_hits=[dict(zip([h[0] for h in c.description],r)) for r in c.fetchall()]
       if query_type=='patient:':
           patient_results = [x['internal_id'] for x in patient_hits]
       else:
           patient_results = [query_type+x['internal_id'] for x in patient_hits]
       #sqlite3_ro_close(c,fd)
   sqlite3_ro_close(c,fd)
   #c,fd,=sqlite3_ro_cursor(app.config['PHENOPOLIS_DB'])
   #c.execute('select * from variants where "#CHROM"=? and POS=? and REF=? and ALT=? limit 20',regex.split('-'))
   #headers=[h[0] for h in c.description]
   #variant_hits=[dict(zip(headers,r)) for r in c.fetchall()]
   #variant_results = ['variant:'+x['variant_id'] for x in variant_hits]
   #sqlite3_ro_close(c,fd)
   results = patient_results+gene_results+hpo_results
   suggestions = list(itertools.islice(results, 0, 20))
   return Response(json.dumps(suggestions),  mimetype='application/json')

@app.route('/best_guess')
@requires_auth
def best_guess():
     query = str(request.args.get('query'))
     if query.startswith('gene:'): return jsonify(redirect='/gene/{}'.format(query.replace('gene:','')))
     elif query.startswith('individual:') or query.startswith('PH'): return jsonify(redirect='/individual/{}'.format(query.replace('individual:','')))
     elif query.startswith('phenotype:'): return jsonify(redirect='/hpo/{}'.format(query.replace('phenotype:','')))
     elif query.startswith('variant:'): return jsonify(redirect='/variant/{}'.format(query.replace('variant:','')))
     elif '-' in query and len(query.split('-'))==4: return jsonify(redirect='/variant/{}'.format(query.replace('variant:','')))
     return jsonify(message='Could not find search query'), 420




