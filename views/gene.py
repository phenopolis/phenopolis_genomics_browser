from views import *
from lookups import *
from orm import *
import requests
from config import config
from vcf import vcf_query
import hashlib
from bson.json_util import dumps

'''
defs
'''
def hide_id_for_demo(data):
    if not data: return
    for k,v in data['patients'].items():
        # hide hpo
        v['hpo'] = ['hidden']
        # hide variants
        v['variants'] = ['hidden_'+hashlib.sha224(i).hexdigest()[:6] for i in v['variants']]
        # hide p_id
        new_p = 'hidden_'+hashlib.sha224(k).hexdigest()[:6]
        data['patients'][new_p] = data['patients'].pop(k)

    for k1,v1 in data['data'].items():
        for k2,v2 in v1['p'].items():
            v1['p'][k2] = ['hidden_'+hashlib.sha224(i).hexdigest()[:6] for i in v2]

    for k,v in data['variants'].items():
        new_v = 'hidden_'+hashlib.sha224(k).hexdigest()[:6]
        data['variants'][new_v] = data['variants'].pop(k)

'''
routes
'''
@app.route('/gene/<gene_id>',methods=['GET'])
#@cache.cached(timeout=24*3600)
@requires_auth
def gene_page(gene_id):
    # if gene not ensembl id then translate to
    db=get_db()
    hpo_db=get_db(app.config['DB_NAME_HPO'])
    patient_db=get_db(app.config['DB_NAME_PATIENTS'])
    hpo=request.args.get('hpo')
    if not gene_id.startswith('ENSG'):
        gene=db.genes.find_one({'gene_name': gene_id}, projection={'_id': False})
        #if not gene: gene=db.genes.find_one({'other_names': gene_id}, projection={'_id': False})
        if not gene: return gene_id+' does not exist'
        gene_id=gene['gene_id']
    else:
        gene=db.genes.find_one({'gene_id':gene_id})
        if not gene: return gene_id+' does not exist'
    if session['user'] == 'demo' and gene_id not in ['ENSG00000156171','ENSG00000119685']: return 'Sorry you are not permitted to see these genes in demo account, please contact us to setup an account!'
    variants=db.variants.find({'genes':gene_id},projection={'_id':False})
    gene['variants']=[Variant(variant_id=v['variant_id'],db=db) for v in variants]
    individuals=dict()
    for v in gene['variants']:
        v.canonical_hgvs=dict(zip( v.canonical_hgvsp, v.canonical_hgvsc))
        v.__dict__['protein_mutations']=dict([(p,p.split(':')[1],) for p in v.canonical_hgvsp if ':' in p])
        for s in v.het_samples:
            if v.HET_COUNT < 10:
                individuals[s]=individuals.get(s,[])+[v]
    print(gene['gene_id'])
    hpo_terms=hpo_db.gene_hpo.find_one({'gene_id':gene['gene_id']})
    if hpo_terms:
        hpo_terms=hpo_terms['hpo_terms']
    else:
        hpo_terms=hpo_db.genes_pheno.find_one({'gene':gene['gene_name']})
        if hpo_terms:
            hpo_terms=hpo_terms['hpo']
        else:
            hpo_terms=[]
    hpo_terms_dict=dict()
    for hpo_id in hpo_terms:
        hpo_terms_dict[hpo_id]=hpo_db.hpo.find_one({'id':hpo_id})
    gene_hpo = db.gene_hpo.find_one({'gene_id':gene_id},{'_id':0})
    patients_status = {}
    if session['user'] == 'demo': hide_id_for_demo(gene_hpo) 
    else:
    # get patients status, solved? candidate genes? Only work when user is not demo for the time-being. Will probably change data struture later on to make it work for demo too
        all_patients = gene_hpo['patients'].keys()
        patients_status = dict([(i['external_id'],i) for i in patient_db.patients.find({'external_id':{'$in':list(all_patients)}},{'external_id':1,'solved':1,'genes':1})])
    table_headers=re.findall("<td class='?\"?(.*)-cell'?\"?>",file('templates/gene-page-tabs/gene_variant_row.tmpl','r').read())
    # get simreg
    simreg_data = list(db.simreg.find({'gene':gene_id}))
    simreg = {'rec':{'data':[],'p':None},'dom':{'data':[],'p':None}}
    for mode in ['rec','dom']:
        temp = [i for i in simreg_data if i['mode'] == mode]
        if not temp: continue
        simreg[mode]['p'] = temp[0]['p']
        # convert it to array
        simreg[mode]['data'] = temp[0]['phi'].values()
        # sort desc
        simreg[mode]['data'] = sorted(simreg[mode]['data'], key=lambda x: x['prob'], reverse=True)
    pli=get_db('exac').pli.find_one({'gene':gene['gene_name']})
    if pli:
        pli=pli['pLI']
    else:
        pli=-1
    return jsonify({'title':gene['gene_name'], 'gene':gene, 'pli':pli,
            'table_headers':table_headers,
            'phenogenon' : json.dumps(gene_hpo) if gene_hpo else {},
            'simreg' : simreg,
            'individuals':individuals,
            'hpo_terms_json': json.dumps(hpo_terms),
            'patients_status':dumps(patients_status),
            'hpo_terms':hpo_terms_dict})


@app.route('/gene_json/<gene_id>',methods=['GET','POST'])
@requires_auth
def gene_json(gene_id):
    # if gene not ensembl id then translate to
    db=get_db()
    hpo_db=get_db(app.config['DB_NAME_HPO'])
    patient_db=get_db(app.config['DB_NAME_PATIENTS'])
    hpo=request.args.get('hpo')
    if not gene_id.startswith('ENSG'): gene_id = lookups.get_gene_by_name(get_db(), gene_id)['gene_id']
    gene=db.genes.find_one({'gene_id':gene_id})
    del gene['_id']
    variants=db.variants.find({'genes':gene_id})
    return json.dumps(gene)

   
@app.route('/gene_phenogenon_json/<gene_id>',methods=['GET','POST'])
@requires_auth
def gene_phenogenon_json(gene_id):
    # if gene not ensembl id then translate to
    db=get_db()
    if not gene_id.startswith('ENSG'): gene_id = lookups.get_gene_by_name(get_db(), gene_id)['gene_id']
    gene=db.gene_hpo_new.find_one({'gene_id':gene_id})
    del gene['_id']
    return json.dumps(gene)

@app.route('/gene/',methods=['GET'])
@requires_auth
def gene():
   gene_id=request.args.get('id')
   x=json.loads(file('tests/data/TTLL5.json','r').read())
   return json.dumps(x)
    

    
