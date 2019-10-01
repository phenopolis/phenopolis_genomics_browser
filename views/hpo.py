from views import *


@app.route('/<language>/hpo/<hpo_id>')
@app.route('/<language>/hpo/<hpo_id>/<subset>')
@app.route('/hpo/<hpo_id>')
@app.route('/hpo/<hpo_id>/<subset>')
@requires_auth
def hpo(hpo_id='HP:0000001',subset='all',language='en'):
   x=json.loads(open(app.config['USER_CONFIGURATION'].format(session['user'],language,'hpo') ,'r').read())
   if not hpo_id.startswith('HP:'):
       q="select * from `poised-breaker-236510.phenopolis_August2019.hpo` where hpo_name='%s' limit 1"%(hpo_id,)
   else:
       q="select * from `poised-breaker-236510.phenopolis_August2019.hpo` where hpo_id='%s' limit 1"%(hpo_id,)
   query_job=bigquery_client.query(q, location="EU",) 
   res=[dict(y) for y in query_job][0]
   hpo_id=res['hpo_id']
   hpo_name=res['hpo_name']
   parent_phenotypes=[{'display':i, 'end_href':j} for i,j, in zip(res['hpo_ancestor_names'].split(';'), res['hpo_ancestor_ids'].split(';')) ]
   q=""" select i.*
       from
        `poised-breaker-236510.phenopolis_August2019.individuals` as i,
        `poised-breaker-236510.phenopolis_August2019.users_individuals` as ui
       where
       i.internal_id=ui.internal_id
       and ui.user='%s'
       and i.ancestor_observed_features like '%s'"""%(session['user'],'%'+hpo_id+'%',)
   query_job=bigquery_client.query(q, location="EU",) 
   individuals=[dict(y) for y in query_job]
   if hpo_id != 'HP:0000001':
       q='select * from `poised-breaker-236510.phenopolis_August2019.phenogenon` where hpo_id="%s"'%hpo_id
       query_job=bigquery_client.query(q, location="EU",) 
       x[0]['phenogenon_recessive']['data']=[]
       for y in query_job:
           y=dict(y)
           x[0]['phenogenon_recessive']['data'].append({'gene_id':[{'display':y['gene_id'],'end_href':y['gene_id']}],'hpo_id':y['hpo_id'],'hgf_score':y['hgf'],'moi_score':y['moi_score']})
       q='select * from `poised-breaker-236510.phenopolis_August2019.phenogenon` where hpo_id="%s"'%hpo_id
       query_job=bigquery_client.query(q, location="EU",) 
       x[0]['phenogenon_dominant']['data']=[]
       for y in query_job:
           y=dict(y)
           x[0]['phenogenon_dominant']['data'].append({'gene_id':[{'display':y['gene_id'],'end_href':y['gene_id']}],'hpo_id':y['hpo_id'],'hgf_score':y['hgf'],'moi_score':y['moi_score'],})
       #Chr,Start,End,HPO,Symbol,ENSEMBL,FisherPvalue,SKATO,variants,CompoundHetPvalue,HWEp,min_depth,nb_alleles_cases,case_maf,nb_ctrl_homs,nb_case_homs,MaxMissRate,nb_alleles_ctrls,nb_snps,nb_cases,minCadd,MeanCallRateCtrls,MeanCallRateCases,OddsRatio,MinSNPs,nb_ctrl_hets,total_maf,MaxCtrlMAF,ctrl_maf,nb_ctrls,nb_case_hets,maxExac
       q='select Symbol,FisherPvalue,SKATO,OddsRatio,variants from `poised-breaker-236510.phenopolis_August2019.skat` where HPO="%s"'%hpo_id
       #query_job=bigquery_client.query(q, location="EU",) 
       query_job=[]
       x[0]['skat']['data']=[]
       for y in query_job:
           y=dict(y)
           x[0]['skat']['data'].append({'gene_id':[{'display':x['gene_id'],'end_href':x['gene_id']}],'fisher_p_value':x['fisher_p_value'],'skato':x['skato'],'odds_ratio':x['odds_ratio'],'variants':[]})
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



