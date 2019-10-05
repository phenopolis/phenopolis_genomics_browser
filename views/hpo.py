from views import *


@app.route('/<language>/hpo/<hpo_id>')
@app.route('/<language>/hpo/<hpo_id>/<subset>')
@app.route('/hpo/<hpo_id>')
@app.route('/hpo/<hpo_id>/<subset>')
@requires_auth
def hpo(hpo_id='HP:0000001',subset='all',language='en'):
   x=json.loads(open(app.config['USER_CONFIGURATION'].format(session['user'],language,'hpo') ,'r').read())
   c=postgres_cursor()
   if not hpo_id.startswith('HP:'):
       c.execute("select * from hpo where hpo_name='%s' limit 1"%hpo_id)
   else:
       c.execute("select * from hpo where hpo_id='%s' limit 1"%hpo_id)
   res=[dict(zip([h[0] for h in c.description],r)) for r in c.fetchall()][0]
   hpo_id=res['hpo_id']
   hpo_name=res['hpo_name']
   parent_phenotypes=[{'display':i, 'end_href':j} for i,j, in zip(res['hpo_ancestor_names'].split(';'), res['hpo_ancestor_ids'].split(';')) ]
   c.execute(""" select *
       from individuals as i,
       users_individuals as ui
       where
       i.internal_id=ui.internal_id
       and ui.user='%s'
       and i.ancestor_observed_features like '%s'"""%(session['user'],'%'+hpo_id+'%',))
   individuals=[dict(zip([h[0] for h in c.description],r)) for r in c.fetchall()]
   if hpo_id != 'HP:0000001':
       c.execute('select * from phenogenon where hpo_id="%s"'%hpo_id)
       x[0]['phenogenon_recessive']['data']=[{'gene_id':[{'display':gene_id,'end_href':gene_id}],'hpo_id':hpo_id,'hgf_score':hgf,'moi_score':moi_score} for gene_id,hpo_id,hgf,moi_score, in c.fetchall()]
       c.execute('select * from phenogenon where hpo_id="%s"'%hpo_id)
       x[0]['phenogenon_dominant']['data']=[{'gene_id':[{'display':gene_id,'end_href':gene_id}],'hpo_id':hpo_id,'hgf_score':hgf,'moi_score':moi_score,} for gene_id,hpo_id,hgf,moi_score, in c.fetchall()]
       #Chr,Start,End,HPO,Symbol,ENSEMBL,FisherPvalue,SKATO,variants,CompoundHetPvalue,HWEp,min_depth,nb_alleles_cases,case_maf,nb_ctrl_homs,nb_case_homs,MaxMissRate,nb_alleles_ctrls,nb_snps,nb_cases,minCadd,MeanCallRateCtrls,MeanCallRateCases,OddsRatio,MinSNPs,nb_ctrl_hets,total_maf,MaxCtrlMAF,ctrl_maf,nb_ctrls,nb_case_hets,maxExac
       c.execute('select Symbol,FisherPvalue,SKATO,OddsRatio,variants from skat where HPO="%s"'%hpo_id)
       x[0]['skat']['data']=[{'gene_id':[{'display':gene_id,'end_href':gene_id}],'fisher_p_value':fisher_p_value,'skato':skato,'odds_ratio':odds_ratio,'variants':[]} for gene_id,fisher_p_value,skato,odds_ratio,variants, in c.fetchall()[:100]]
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



