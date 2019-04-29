from views import *
from lookups import *
from flask import request
import re
from utils import *
import itertools
import csv

@app.route('/<language>/hpo/<hpo_id>')
@app.route('/<language>/hpo/<hpo_id>/<subset>')
@app.route('/hpo/<hpo_id>')
@app.route('/hpo/<hpo_id>/<subset>')
@requires_auth
def hpo(hpo_id='HP:0000001',subset='all',language='en'):
   x=json.loads(file(app.config['USER_CONFIGURATION'].format(session['user'],language,'hpo') ,'r').read())
   c,fd,=sqlite3_ro_cursor(app.config['PHENOPOLIS_DB'])
   if not hpo_id.startswith('HP:'):
       c.execute("select * from hpo where hpo_name=? limit 1",(hpo_id,))
   else:
       c.execute("select * from hpo where hpo_id=? limit 1",(hpo_id,))
   res=[dict(zip([h[0] for h in c.description],r)) for r in c.fetchall()][0]
   hpo_id=res['hpo_id']
   hpo_name=res['hpo_name']
   parent_phenotypes=[{'display':i, 'end_href':j} for i,j, in zip(res['hpo_ancestor_names'].split(';'), res['hpo_ancestor_ids'].split(';')) ]
   c.execute(""" select *
       from individuals as i, users_individuals as ui
       where
       i.internal_id=ui.internal_id
       and ui.user=?
       and i.ancestor_observed_features like ?""",(session['user'],'%'+hpo_id+'%',))
   individuals=[dict(zip([h[0] for h in c.description],r)) for r in c.fetchall()]
   sqlite3_ro_close(c, fd)
   print(len(individuals))
   x[0]["preview"]=[["Number of Individuals",len(individuals)]]
   if subset=='preview': return json.dumps([{subset:y['preview']} for y in x])
   for ind in individuals:
     ind['internal_id']=[{'display':ind['internal_id']}]
     ind['simplified_observed_features_names']=[{'display':i, 'end_href':j} for i,j, in zip(ind['simplified_observed_features_names'].split(';'),ind['simplified_observed_features'].split(','))]
     if ind['genes']: ind['genes']=[{'display':i} for i in ind.get('genes','').split(',')]
   x[0]['individuals']['data']=individuals
   x[0]['metadata']['data']=[{'name':hpo_name,'id':hpo_id, 'count':len(individuals), 'parent_phenotypes':parent_phenotypes}]
   process_for_display(x[0]['metadata']['data'])
   if subset=='all': return json.dumps(x)
   else: return json.dumps([{subset:y[subset]} for y in x])



