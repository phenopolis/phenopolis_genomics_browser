from views import *
import requests
from utils import *
#hpo lookup
from pprint import pprint
import os
import json
import pymongo
import sys
import re
import itertools
from collections import defaultdict, Counter
#import rest as annotation

@app.route('/<language>/individual/<individual_id>')
@app.route('/<language>/individual/<individual_id>/<subset>')
@app.route('/individual/<individual_id>')
@app.route('/individual/<individual_id>/<subset>')
@requires_auth
def individual(individual_id, subset='all', language='en'):
   c,fd,=sqlite3_ro_cursor(app.config['PHENOPOLIS_DB'])
   c.execute("select * from phenopolis_ids")
   pheno_ids=[dict(zip([h[0] for h in c.description],r)) for r in c.fetchall()]
   phenoid_mapping={ind['internal_id']:ind['external_id'] for ind in pheno_ids}
   sqlite3_ro_close(c, fd)
   individual_id=phenoid_mapping[individual_id]
   x=json.loads(file(app.config['USER_CONFIGURATION'].format(session['user'],language,'individual') ,'r').read())
   c,fd,=sqlite3_ro_cursor(app.config['PATIENTS_DB'].format(session['user']))
   c.execute("select * from individuals where external_id=?",(individual_id,))
   hits=c.fetchall()
   sqlite3_ro_close(c,fd)
   print(hits)
   if not hits:
       x[0]['preview']=[['Sorry', 'You are not permitted to see this patient']]
       return json.dumps(x)
   individual=[dict(zip( [h[0] for h in c.description],r)) for r in hits]
   print(individual)
   if individual:
       individual=individual[0]
   else:
       return x
   ind=individual
   c,fd,=sqlite3_ro_cursor(app.config['PHENOPOLIS_DB'])
   if subset=='preview':
       query=""" select count(1) from hom_variants hv, variants v where hv."#CHROM"=v."#CHROM" and hv."POS"=v."POS" and hv."REF"=v."REF" and hv."ALT"=v."ALT" and hv.individual='%s' """ % (individual_id,)
       hom_count=c.execute(query).fetchone()[0]
       query=""" select count(1) from het_variants hv, variants v where hv."#CHROM"=v."#CHROM" and hv."POS"=v."POS" and hv."REF"=v."REF" and hv."ALT"=v."ALT" and hv.individual='%s' """ % (individual_id,)
       het_count=c.execute(query).fetchone()[0]
       query=""" select count (1) from (select count(1) from het_variants hv, variants v where hv."#CHROM"=v."#CHROM" and hv."POS"=v."POS" and hv."REF"=v."REF" and hv."ALT"=v."ALT" and hv.individual='%s' group by v.gene_symbol having count(v.gene_symbol)>1) as t """ % (individual_id,)
       comp_het_count=c.execute(query).fetchone()[0]
       x[0]['preview']=[
               ['Sex', ind['sex']],
               ['Genes', [g for g in ind.get('genes','').split(',')]],
               ['Features',[f for f in ind['simplified_observed_features_names'].split(',')]],
               ['Number of hom variants',hom_count],
               ['Number of compound hets',comp_het_count],
               ['Number of het variants', het_count] ]
       sqlite3_ro_close(c,fd)
       return json.dumps(x)
   # hom variants
   query=""" select v.* from hom_variants hv, variants v where hv."#CHROM"=v."#CHROM" and hv."POS"=v."POS" and hv."REF"=v."REF" and hv."ALT"=v."ALT" and hv.individual='%s' """ % (individual_id,)
   print query
   c.execute(query)
   headers=[h[0] for h in c.description]
   hom_variants=[dict(zip(headers,r)) for r in c.fetchall()]
   x[0]['rare_homs']['data']=hom_variants
   # rare variants
   query=""" select v.* from het_variants hv, variants v where hv."#CHROM"=v."#CHROM" and hv."POS"=v."POS" and hv."REF"=v."REF" and hv."ALT"=v."ALT" and hv.individual='%s' """ % (individual_id,)
   print query
   c.execute(query)
   headers=[h[0] for h in c.description]
   rare_variants=[dict(zip(headers,r)) for r in c.fetchall()]
   sqlite3_ro_close(c,fd)
   x[0]['rare_variants']['data']=rare_variants
   # rare_comp_hets
   gene_counter=Counter([v['gene_symbol'] for v in x[0]['rare_variants']['data']])
   x[0]['rare_comp_hets']['data']=[v for v in x[0]['rare_variants']['data'] if gene_counter[v['gene_symbol']]>1]
   if not x[0]['metadata']['data']: x[0]['metadata']['data']=[dict()]
   x[0]['metadata']['data'][0]['sex']=ind['sex']
   x[0]['metadata']['data'][0]['external_id']=[{'display':ind['external_id']}]
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
   if session['user']=='demo': return 'not permitted'
   print(request.form)
   consanguinity=request.form.getlist('consanguinity_edit[]')[0]
   gender=request.form.getlist('gender_edit[]')[0]
   genes=request.form.getlist('genes[]')
   features=request.form.getlist('feature[]')
   print('INDIVIDUAL',individual_id)
   print('GENDER',gender)
   print('CONSANGUINITY',consanguinity)
   print('GENES',genes)
   print('FEATURES',features)
   print(individual_id)
   c,fd,=sqlite3_ro_cursor(app.config['PHENOPOLIS_DB'])
   hpo=[dict(zip(['hpo_id','hpo_name','hpo_ancestor_ids','hpo_ancestor_names'] ,c.execute("select * from hpo where hpo_name=? limit 1",(x,)).fetchone())) for x in features]
   print hpo
   c.execute("select * from phenopolis_ids")
   pheno_ids=[dict(zip([h[0] for h in c.description],r)) for r in c.fetchall()]
   phenoid_mapping={ind['internal_id']:ind['external_id'] for ind in pheno_ids}
   sqlite3_ro_close(c, fd)
   individual_id=phenoid_mapping[individual_id]
   x=json.loads(file(app.config['USER_CONFIGURATION'].format(session['user'],language,'individual') ,'r').read())
   c,fd,=sqlite3_ro_cursor(app.config['PATIENTS_DB'].format(session['user']))
   c.execute("select * from individuals where external_id=?",(individual_id,))
   hits=c.fetchall()
   sqlite3_ro_close(c,fd,)
   print(hits)
   if not hits:
       x[0]['preview']=[['Sorry', 'You are not permitted to see this patient']]
       return json.dumps(x)
   individual=[dict(zip( [h[0] for h in c.description],r)) for r in hits]
   print(individual)
   if individual:
       p=individual[0]
   #update
   #features to hpo ids
   p['sex']=gender
   p['observed_features']=','.join([h['hpo_id'] for h in hpo])
   p['observed_features_names']=';'.join([h['hpo_name'] for h in hpo])
   p['simplified_observed_features']=p['observed_features']
   p['simplified_observed_features_names']=p['observed_features_names']
   p['unobserved_features']=','.join([h['hpo_ancestor_ids'] for h in hpo])
   p['ancestor_observed_features']=';'.join([h['hpo_ancestor_names'] for h in hpo])
   p['genes']=','.join([x for x in genes])
   print 'UPDATE:', p
   conn,c,=sqlite3_cursor(app.config['PATIENTS_DB'].format(session['user']))
   c.execute("""update individuals set
           sex=?,
           observed_features=?,
           observed_features_names=?,
           simplified_observed_features=?,
           simplified_observed_features_names=?,
           ancestor_observed_features=?,
           unobserved_features=?,
           genes=?
           where external_id=?""",
           (p['sex'],
            p['observed_features'],
            p['observed_features'],
            p['simplified_observed_features'],
            p['simplified_observed_features_names'],
            p['ancestor_observed_features'],
            p['unobserved_features'],
            p['genes'],
            individual_id,))
   c.execute("select * from individuals where external_id=?",(individual_id,))
   hits=c.fetchall()
   print hits
   sqlite3_close(conn,c)
   return jsonify({'success': True}), 200


def get_feature_venn(patient):
    hpo_ids=[feature['id'] for feature in patient.observed_features]
    hpo_db=get_db(app.config['DB_NAME_HPO'])
    #hpo_terms = [(i, hpo_db.hpo.find_one({'id':i})['name'][0]) for i in hpo_ids]
    hpo_terms = [(feature['id'], feature['label']) for feature in patient.observed_features]
    # this has missing HPO ids. see IRDC_batch2_OXF_3001 and #HP:0000593
    hpo_gene=dict()
    for hpo_id,hpo_term, in hpo_terms:
        hpo_gene[hpo_id] = []
        for gene_name in [x['Gene-Name'] for x in hpo_db.ALL_SOURCES_ALL_FREQUENCIES_phenotype_to_genes.find({'HPO-ID':hpo_id},{'Gene-Name':1,'_id':0})]:
            #gene_hpo[gene_name]=gene_hpo.get(gene_name,[])+[{'hpo_id':hpo_id,'hpo_term':hpo_term}]
            hpo_gene[hpo_id]=hpo_gene.get(hpo_id,[])+[gene_name]
    for k in hpo_gene: hpo_gene[k]=list(frozenset(list(hpo_gene[k])))
    print '========'
    #print hpo_gene
    print '========'
    genes = {}
    # get combinatorics of features to draw venn diagram
    feature_combo = []
    feature_venn = []
    for i in range(len(hpo_terms[:5])):
        feature_combo.extend(itertools.combinations(range(len(hpo_terms)), i+1))
    #venn_ind = -1
    print 'calculate Venn diagram'
    for combo in feature_combo:
        # construct features_venn key
        #venn_ind += 1
        dic_key = [hpo_terms[i][1] for i in combo]
        for ind in range(len(combo)):
            if ind == 0:
                x=hpo_terms[combo[ind]][0]
                feature_venn.append({'key': dic_key, 'value':list(frozenset(hpo_gene.get(x,"")))})
            else:
                tem = feature_venn[-1]['value']
                feature_venn[-1]['value'] = list(frozenset(feature_venn[-1]['value']) & frozenset(hpo_gene[hpo_terms[combo[ind]][0]]))
    return feature_venn



@app.route('/venn_json/<individual>')
@requires_auth
def venn_json(individual):
    patient=Patient(individual,get_db(app.config['DB_NAME_PATIENTS']))
    feature_venn=get_feature_venn(patient)
    return jsonify(result=feature_venn)


def patient_variants():
    # add known gene and retnet gene labels, and re-calculate pubmed_score
    for mm in ['rare_variants','homozygous_variants','compound_het_variants']:
        for v in patient.__dict__[mm]:
            if 'canonical_gene_name_upper' not in v: v['canonical_gene_name_upper']=v['Gene']
            gene=v['canonical_gene_name_upper']
            pubmed_key = '_'.join([gene,patient.get('pubmed_key','')])
            gene_info[gene]=dict()
            if gene in known_genes: 
                gene_info[gene]['known']=True
                pubmedbatch[pubmed_key] = max(1,pubmedbatch.get('pubmed_key',0))
            if gene not in RETNET: continue
            gene_info[gene]['disease'] = RETNET[gene]['disease']
            gene_info[gene]['omim'] = RETNET[gene]['omim']
            gene_info[gene]['mode'] = RETNET[gene]['mode']
            pubmedbatch[pubmed_key] = max(1,pubmedbatch.get('pubmed_key',0))
            if mm != 'rare_variants' or ('d' in gene_info[gene]['mode'] and mm == 'rare_variants') :
                pubmedbatch[pubmed_key] = max(100,pubmedbatch[pubmed_key])
                if gene=='DRAM2':
                    print pubmed_key
                    print pubmedbatch[pubmed_key]
            if 'het_samples' not in v: print(v)
            for s in v['het_samples']:
                if v['HET_COUNT'] < 10:
                    individuals[s]=individuals.get(s,[])+[v]



def get_hpo_gene(hpo_ids):
    hpo_db=get_db(app.config['DB_NAME_HPO'])
    hpo_terms = [(i, hpo_db.hpo.find_one({'id':i})['name'][0]) for i in hpo_ids]
    # this has missing HPO ids. see IRDC_batch2_OXF_3001 and #HP:0000593
    hpo_gene=dict()
    for hpo_id,hpo_term, in hpo_terms:
        hpo_gene[hpo_id] = []
        for gene_name in [x['Gene-Name'] for x in hpo_db.ALL_SOURCES_ALL_FREQUENCIES_phenotype_to_genes.find({'HPO-ID':hpo_id},{'Gene-Name':1,'_id':0})]:
            #gene_hpo[gene_name]=gene_hpo.get(gene_name,[])+[{'hpo_id':hpo_id,'hpo_term':hpo_term}]
            hpo_gene[hpo_id]=hpo_gene.get(hpo_id,[])+[gene_name]
    for k in hpo_gene: hpo_gene[k]=list(frozenset(list(hpo_gene[k])))
    return hpo_gene

def exomiser(individual):
    patient_hpo_terms=lookups.get_patient_hpo(hpo_db, patient_db, individual, ancestors=False)
    patient_hpo_terms = dict([(hpo['id'][0],{'id':hpo['id'][0],'name':hpo['name'][0], 'is_a':hpo.get('is_a',[])}) for hpo in patient_hpo_terms])
    patient_hpo_ids=patient_hpo_terms.keys()
    x['exomiser']=[]
    for g in list(set(x['genes'])):
        r=db.ensembl_entrez.find_one({'Ensembl Gene ID':g})
        if not r or not r['EntrezGene ID']: continue
        x['entrezgeneid']=r['EntrezGene ID']
        #url='http://localhost:8085/exomiser/api/prioritise/?phenotypes=%s&prioritiser=hiphive&genes=%s&prioritiser-params=human,mouse,fish'%(','.join(patient_hpo_terms.keys()), x['entrezgeneid'])
        url='http://monarch-exomiser-prod.monarchinitiative.org/exomiser/api/prioritise/?phenotypes=%s&prioritiser=hiphive&genes=%s&prioritiser-params=human,mouse,fish'%(','.join(patient_hpo_terms.keys()), x['entrezgeneid'])
        print(url)
        r=requests.get(url)
        if isinstance(r.json(),list):
            x['exomiser']+=r.json()[0]['results']
        else:
            x['exomiser']+=r.json()['results']
    if len(x['exomiser'])<1: x['exomiser']=[{'score':-1}]
    exomiser_scores=[xx['score'] for xx in x['exomiser']]
    i=exomiser_scores.index(max(exomiser_scores))
    x['exomiser']=x['exomiser'][i]


@app.route('/homozygous_variants_json/<individual>')
@requires_auth
def homozgous_variants(individual):
    patient=Patient(individual,patient_db=get_db(app.config['DB_NAME_PATIENTS']),variant_db=get_db(app.config['DB_NAME']),hpo_db=get_db(app.config['DB_NAME_HPO']))
    return jsonify(result=patient.homozygous_variants)


@app.route('/homozygous_variants_json2/<individual>')
@requires_auth
def homozgous_variants2(individual):
    allele_freq=float(request.args.get('allele_freq',0.001))
    kaviar_AF=float(request.args.get('kaviar_AF',0.001))
    s ="""
    MATCH (gv:GeneticVariant)-[:HomVariantToPerson]->(p:Person)
    WHERE p.personId="%s" and gv.kaviar_AF < %f and gv.allele_freq < %f
    RETURN gv ;
    """%(individual,kaviar_AF,allele_freq)
    data=requests.post('http://localhost:57474/db/data/cypher',auth=('neo4j', '1'),json={'query':s})
    print (data.json())
    return jsonify(data.json())
    
@app.route('/compound_het_variants_json2/<individual>',methods=['GET','POST'])
@requires_auth
def compound_het_variants2(individual):
    kaviar_AF=float(request.args.get('kaviar_AF',0.01))
    allele_freq=float(request.args.get('allele_freq',0.01))
    s="""
    MATCH (g:Gene)-[]->(gv:GeneticVariant)-[:HetVariantToPerson]->(p:Person)
    WHERE p.personId="%s" AND gv.kaviar_AF<%f and gv.allele_freq < %f
    WITH gv, p, g, collect (gv) AS cgv
    WHERE length(cgv) > 1 
    RETURN gv.variantId ; 
    """%(individual,kaviar_AF,allele_freq)
    data=requests.post('http://localhost:57474/db/data/cypher',auth=('neo4j', '1'),json={'query':s})
    variants=[v[0] for v in data]
    variants=[get_db().variants.find_one({'variant_id':v},{'_id':False}) for v in variants]
    variants=[v for v in variants if v]
    for v in variants: v['HPO']=[]
    variants=[v for v in variants if 'transcript_consequences' in v]
    return jsonify(nrows=len(variants),result=variants)

@app.route('/compound_het_variants_json/<individual>')
@requires_auth
def compound_het_variants(individual):
    patient=Patient(individual,patient_db=get_db(app.config['DB_NAME_PATIENTS']),variant_db=get_db(app.config['DB_NAME']),hpo_db=get_db(app.config['DB_NAME_HPO']))
    return jsonify(result=patient.compound_het_variants)

@app.route('/rare_variants_json2/<individual>')
@requires_auth
def rare_variants2(individual):
    #patient=Patient(individual,patient_db=get_db(app.config['DB_NAME_PATIENTS']),variant_db=get_db(app.config['DB_NAME']),hpo_db=get_db(app.config['DB_NAME_HPO']))
    #return jsonify(result=patient.rare_variants)
    print 'rare_variants2'
    s="""
    MATCH (gv:GeneticVariant)-[:HetVariantToPerson]->(p:Person)
    WHERE p.personId="%s" and gv.kaviar_AF < 0.0001 and gv.allele_freq < 0.001
    RETURN gv.variantId ;
    """%individual
    data=requests.post('http://localhost:57474/db/data/cypher',auth=('neo4j', '1'),json={'query':s})
    data=data.json()
    variants=[v[0] for v in data['data']]
    print(len(variants))
    #variants=[r['row'][0] for r in resp.json()['results'][0]['data']]
    #variants=[get_db().variants.find_one({'variant_id':v},{'_id':False}).get('canonical_gene_name_upper','') for v in variants]
    variants=[get_db().variants.find_one({'variant_id':v},{'_id':False}) for v in variants]
    variants=[v for v in variants if v]
    for v in variants: v['HPO']=[]
    variants=[v for v in variants if 'transcript_consequences' in v]
    #print(variants)
    return jsonify(count=len(variants),result=variants)



def load_patient(individual,auth,pubmed_key,hpo='HP:0000001'):
    hpo_db=get_db(app.config['DB_NAME_HPO'])
    db = get_db()
    patient_db=get_db(app.config['DB_NAME_PATIENTS'])
    patient_id=individual
    patient={u'features': {u'observed': u'yes', u'type': u'phenotype', u'id': hpo}, 'clinicalStatus': {u'clinicalStatus': u'affected'}, u'ethnicity': {u'maternal_ethnicity': [], u'paternal_ethnicity': []}, u'family_history': {}, u'disorders': [], u'life_status': u'alive', u'reporter': u'', u'genes': [], u'prenatal_perinatal_phenotype': {u'prenatal_phenotype': [], u'negative_prenatal_phenotype': []}, u'prenatal_perinatal_history': {u'twinNumber': u''}, u'sex': u'U', u'solved': {u'status': u'unsolved'}}
    eid=patient_id
    if p: patient.update(p)
    #patient_hpo_terms=','.join([f['id'] for f in patient['features'] if f['observed']=='yes'])
    gene_counter=Counter([var['canonical_gene_name_upper'] for var in patient.rare_variants])
    for var in patient['rare_variants']: var['gene_count']=gene_counter[var['canonical_gene_name_upper']]
    patient["pubmedbatch_status"]=0
    pubmed_key="blindness-macula-macular-pigmentosa-retina-retinal-retinitis-stargardt"
    patient["pubmed_key"]=pubmed_key
    #db.patients.update({'external_id':patient_id}, patient, upsert=True)


