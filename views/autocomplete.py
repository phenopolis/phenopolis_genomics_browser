from views import *


@app.route('/autocomplete/<query>')
@requires_auth
def autocomplete(query):
   regex="%"+re.escape(query)+"%"
   c,fd,=sqlite3_ro_cursor(app.config['PHENOPOLIS_DB'])
   #
   c.execute("select * from genes where gene_name_upper like '%s' limit 20"%regex)
   headers=[h[0] for h in c.description]
   gene_hits=[dict(zip(headers,r)) for r in c.fetchall()]
   gene_results = ['gene:'+x['gene_name_upper'] for x in gene_hits]
   #
   c.execute("select * from hpo where hpo_name like '%s' limit 20"%regex)
   headers=[h[0] for h in c.description]
   hpo_hits=[dict(zip(headers,r)) for r in c.fetchall()]
   hpo_results = ['phenotype:'+x['hpo_name'] for x in hpo_hits]
   sqlite3_ro_close(c,fd)
   #
   c,fd,=sqlite3_ro_cursor(app.config['PATIENTS_DB'].format(session['user']))
   c.execute("select * from individuals where external_id like '%s' limit 20"%regex)
   headers=[h[0] for h in c.description]
   patient_hits=[dict(zip(headers,r)) for r in c.fetchall()]
   patient_results = ['individual:'+x['external_id'] for x in patient_hits]
   sqlite3_ro_close(c,fd)
   #
   results = patient_results+gene_results+hpo_results
   suggestions = list(itertools.islice(results, 0, 20))
   return Response(json.dumps(suggestions),  mimetype='application/json')

@app.route('/best_guess')
@requires_auth
def best_guess():
     query = str(request.args.get('query'))
     if query.startswith('gene:'): return jsonify(redirect='/gene/{}'.format(query.replace('gene:','')))
     elif query.startswith('individual:'): return jsonify(redirect='/individual/{}'.format(query.replace('individual:','')))
     elif query.startswith('phenotype:'): return jsonify(redirect='/hpo/{}'.format(query.replace('phenotype:','')))
     return jsonify(message='Could not find search query'), 420




