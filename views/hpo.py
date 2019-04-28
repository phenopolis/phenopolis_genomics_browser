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
   c.execute("select * from phenopolis_ids")
   pheno_ids=[dict(zip([h[0] for h in c.description],r)) for r in c.fetchall()]
   sqlite3_ro_close(c, fd)
   phenoid_mapping={ind['external_id']:ind['internal_id'] for ind in pheno_ids}
   hpo_id=res['hpo_id']
   hpo_name=res['hpo_name']
   parent_phenotypes=[{'display':i, 'end_href':j} for i,j, in zip(res['hpo_ancestor_names'].split(';'), res['hpo_ancestor_ids'].split(';')) ]
   c,fd,=sqlite3_ro_cursor(app.config['PATIENTS_DB'].format(session['user']))
   c.execute("select * from individuals where ancestor_observed_features like ?",('%'+hpo_id+'%',))
   individuals=[dict(zip([h[0] for h in c.description],r)) for r in c.fetchall()]
   sqlite3_ro_close(c, fd)
   print(len(individuals))
   for ind in individuals:
       ind['external_id']=phenoid_mapping[ind['external_id']]
   x[0]["preview"]=[["Number of Individuals",len(individuals)]]
   if subset=='preview': return json.dumps([{subset:y['preview']} for y in x])
   for ind in individuals:
     ind['external_id']=[{'display':ind['external_id']}]
     ind['simplified_observed_features_names']=[{'display':i, 'end_href':j} for i,j, in zip(ind['simplified_observed_features_names'].split(';'),ind['simplified_observed_features'].split(','))]
     if ind['genes']: ind['genes']=[{'display':i} for i in ind.get('genes','').split(',')]
   x[0]['individuals']['data']=individuals
   x[0]['metadata']['data']=[{'name':hpo_name,'id':hpo_id, 'count':len(individuals), 'parent_phenotypes':parent_phenotypes}]
   process_for_display(x[0]['metadata']['data'])
   if subset=='all': return json.dumps(x)
   else: return json.dumps([{subset:y[subset]} for y in x])

def phenogenon(hpo_id,lit_genes,omim_genes,recessive_genes,dominant_genes,cache=True):
    cache_db=get_db('cache')
    temp=cache_db.phenogenon_cache.find_one({'hpo_id':hpo_id})
    if temp and cache:
        lit_genes.extend(temp['lit_genes'])
        omim_genes.extend(temp['omim_genes'])
        recessive_genes.extend(temp['recessive_genes'])
        dominant_genes.extend(temp['dominant_genes'])
        return
    #hpo_db=get_db(app.config['DB_NAME_HPO'])
    #db=get_db()
    def f(r):
        g=db.genes.find_one({'gene_name_upper':r['Gene-Name'].upper()},{'_id':0})
        if not g: return
        phenogenon=db.gene_hpo.find_one({'gene_id':g['gene_id']})
        if not phenogenon: return
        het=phenogenon.get('het',{}).get(hpo_id,{})
        hom_comp=phenogenon.get('hom_comp',{}).get(hpo_id,{})
        if 'data' in het: del het['data']
        if 'data' in hom_comp: del hom_comp['data']
        g['phenogenon']={ 'het':het, 'hom_comp': hom_comp}
        return g
    lit_genes=[f(r) for r in hpo_db.hpo_gene.find({'HPO-ID':hpo_id})]
    lit_genes=[lg for lg in lit_genes if lg]
    omim_genes.extend(map(lambda x: x['gene_id'], lit_genes))
    phenogenon=db.hpo_gene.find_one({'hpo_id':hpo_id})
    if phenogenon: phenogenon=phenogenon['data']['unrelated']
    else: phenogenon={'recessive':[],'dominant':[]}
    recessive_genes.extend([{'gene_id':x['gene_id'],'gene_name':db.genes.find_one({'gene_id':x['gene_id']})['gene_name'],'p_val':x['p_val'],'known':x['gene_id'] in omim_genes} for x in phenogenon['recessive']])
    dominant_genes.extend([{'gene_id':x['gene_id'],'gene_name':db.genes.find_one({'gene_id':x['gene_id']})['gene_name'],'p_val':x['p_val'], 'known':x['gene_id'] in omim_genes} for x in phenogenon['dominant']])
    #print({'hpo_id':hpo_id,'dominant_genes':dominant_genes,'recessive_genes':recessive_genes,'omim_genes':omim_genes,'lit_genes':lit_genes})
    cache_db.phenogenon_cache.insert_one({'hpo_id':hpo_id,'dominant_genes':dominant_genes,'recessive_genes':recessive_genes,'omim_genes':omim_genes,'lit_genes':lit_genes})

def skat(hpo_id):
    db=get_db()
    skat_genes=db.skat.find({'HPO':hpo_id},{'_id':False})
    skat_genes=[g for g in skat_genes if g['FisherPvalue']<0.05 and g['SKATO']<0.005]
    for g in skat_genes:
        pli=get_db('exac').pli.find_one({'gene':g['Symbol']})
        if str(g['OddsRatio'])=='inf': g['OddsRatio']=9999999
        if pli:
            g['pli']=pli['pLI'] 
        else:
            g['pli']=-1
    return skat_genes

@app.route('/hpo_skat_json/<hpo_id>')
@requires_auth
def hpo_skat_json(hpo_id):
    skat_genes=skat(hpo_id)
    return jsonify( result={ 'individuals':skat_genes }, allow_nan=False )


@app.route('/phenogenon_json/<hpo_id>')
@requires_auth
def phenogenon_json(hpo_id):
    cache = bool(request.args.get('cache',True))
    threshold = float(request.args.get('threshold',0.05))
    print 'PHENOGENON_JSON'
    print cache
    #print(intersect(obs_genes.keys(),lit_genes))
    #print(Counter([rv['HUGO'] for rv in db.patients.find_one({'external_id':p['external_id']},{'rare_variants':1})]['rare_variants']))
    ## only return common variants if there are many individuals
    ##rsession.voidEval('common_variants <- common.variants')
    lit_genes=[]
    omim_genes=[]
    recessive_genes=[]
    dominant_genes=[]
    phenogenon(hpo_id, lit_genes, omim_genes, recessive_genes, dominant_genes,cache)
    print(len(lit_genes))
    print(len(omim_genes))
    print(len(recessive_genes))
    print(len(dominant_genes))
    true_positives=len([g for g in lit_genes if 'unrelated_recessive_p_val' in g['phenogenon']['hom_comp'] and g['phenogenon']['hom_comp']['unrelated_recessive_p_val']<=threshold])
    false_negatives=len([g for g in lit_genes if 'unrelated_recessive_p_val' in g['phenogenon']['hom_comp'] and g['phenogenon']['hom_comp']['unrelated_recessive_p_val']>threshold])
    false_positives=len([g for g in recessive_genes if not g['known'] and g['p_val']<=threshold])
    true_negatives=len([g for g in recessive_genes if not g['known'] and g['p_val']>threshold])
    # can have zero denominator sometimes
    #{'TPR':float(true_positives)/float(true_positives+false_negatives),'FPR':float(false_positives)/float(false_positives+true_negatives)}
    return jsonify( result={
        'performance':{'TP':true_positives,'FN':false_negatives,'FP':false_positives,'TN':true_negatives},
                    'lit_genes':lit_genes,
                    'omim_genes':omim_genes,
                    'recessive_genes':recessive_genes,
                    'dominant_genes':dominant_genes,
                    } )


@app.route('/phenogenon_recessive_csv/<hpo_id>')
@requires_auth
def phenogenon_recessive_csv(hpo_id):
    lit_genes=[]
    omim_genes=[]
    recessive_genes=[]
    dominant_genes=[]
    phenogenon(hpo_id, lit_genes, omim_genes, recessive_genes, dominant_genes)
    print(len(lit_genes))
    print(len(omim_genes))
    print(len(recessive_genes))
    print(len(dominant_genes))
    text=','.join([k for k in recessive_genes[0].keys()])+'\n'
    for g in recessive_genes:
        text+=','.join([str(g[k]) for k in recessive_genes[0].keys()])+'\n'
    return text


@app.route('/phenogenon_dominant_csv/<hpo_id>')
@requires_auth
def phenogenon_dominant_csv(hpo_id):
    lit_genes=[]
    omim_genes=[]
    recessive_genes=[]
    dominant_genes=[]
    phenogenon(hpo_id, lit_genes, omim_genes, recessive_genes, dominant_genes)
    print(len(lit_genes))
    print(len(omim_genes))
    print(len(recessive_genes))
    print(len(dominant_genes))
    text=','.join([k for k in dominant_genes[0].keys()])+'\n'
    for g in dominant_genes:
        text+=','.join([str(g[k]) for k in dominant_genes[0].keys()])+'\n'
    return text

@app.route('/phenogenon_literature_csv/<hpo_id>')
@requires_auth
def phenogenon_literature_csv(hpo_id):
    lit_genes=[]
    omim_genes=[]
    recessive_genes=[]
    dominant_genes=[]
    phenogenon(hpo_id, lit_genes, omim_genes, recessive_genes, dominant_genes)
    print(len(lit_genes))
    print(len(omim_genes))
    print(len(recessive_genes))
    print(len(dominant_genes))
    names=['gene_name','phenogenon.dominant_pvalue','phenogenon.recessive_pvalue']
    text=','.join([k for k in names])+'\n'
    for g in lit_genes:
        gene_name=g['gene_name']
        dominant_pvalue=str(g['phenogenon']['het'].get('unrelated_dominant_all_p_val',None))
        recessive_pvalue=str(g['phenogenon']['hom_comp'].get('unrelated_recessive_p_val',None))
        print(gene_name)
        print(dominant_pvalue)
        print(recessive_pvalue)
        text+=','.join([gene_name,dominant_pvalue,recessive_pvalue])+'\n'
    return text


@app.route('/hpo/<hpo_id>')
@requires_auth
@cache.cached(timeout=24*3600)
def hpo_page(hpo_id):
    db=get_db()
    hpo_db=get_db(app.config['DB_NAME_HPO'])
    print hpo_id 
    if not hpo_id.startswith('HP:'):
        hpo_term=hpo_db.hpo.find_one({'name':re.compile('^'+hpo_id+'$',re.IGNORECASE)})
        if not hpo_term: return hpo_id+' does not exist'
        hpo_id=hpo_term['id'][0]
    print hpo_id 
    hpo_name=hpo_db.hpo.find_one({'id':hpo_id})['name'][0]
    print hpo_name
    #print('HPO ANCESTORS')
    #hpo_ancestors=lookups.get_hpo_ancestors(hpo_db,hpo_id)
    #print(len(hpo_ancestors))
    #print([h['name'] for h in hpo_ancestors])
    #print(len([v['VARIANT_ID'] for v in db.variants.find({'HET' : { '$in': patient_ids }})]))
    #print(len([v['VARIANT_ID'] for v in db.variants.find({'HOM' : { '$in': patient_ids }})]))
    #if r: external_ids=r['external_ids']
    #else: external_ids=[]
    #for r in hpo_db.hpo_pubmed.find({'hpoid':hpo_id}): print(r)
    #print recessive_genes
    #print dominant_genes
    return jsonify(title=hpo_id, hpo_id=hpo_id, hpo_name=hpo_name)


