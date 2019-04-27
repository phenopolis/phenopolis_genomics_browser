import flask
from views import *
from lookups import *
import requests
import myvariant
import re
from utils import *
import itertools
import csv
#hpo lookup
import random
import orm
import vcf
import subprocess
import os
import pysam

@app.route('/<language>/variant/<variant_id>')
@app.route('/<language>/variant/<variant_id>/<subset>')
@app.route('/variant/<variant_id>')
@app.route('/variant/<variant_id>/<subset>')
@requires_auth
def variant(variant_id, subset='all', language='en'):
   #c,fd,=sqlite3_ro_cursor(app.config['PHENOPOLIS_DB'])
   #c.execute("select * from phenopolis_ids")
   #pheno_ids=csv.DictReader(open('/media/pontikos_nas/pontikos/phenopolis/db/phenopolis_ids.csv'))
   #pheno_ids=[dict(zip([h[0] for h in c.description],r)) for r in c.fetchall()]
   #phenoid_mapping={ind['external_id']:ind['internal_id'] for ind in pheno_ids}
   #sqlite3_ro_close(c, fd)
   chrom,pos,ref,alt,=variant_id.split('-')
   pos=int(pos)
   variant_file=pysam.VariantFile("/media/pontikos/fast_storage/KaoruFujinami/merged2.vcf.gz")
   samples=variant_file.header.samples
   variant=dict()
   for v in variant_file.fetch(chrom, pos-1, pos):
      variant['pos']=v.pos
      variant['start']=v.start
      variant['stop']=v.stop
      variant['ref']=v.ref
      variant['alt']=alt
      variant['alleles']=v.alleles
      variant['alts']=v.alts
      variant['rlen']=v.rlen
      variant['chrom']=v.chrom
      variant['id']=v.id
      variant['rid']=v.rid
      variant['qual']=v.qual
      variant['filter']=[k for k in v.filter.keys()]
      variant['format']=dict([(v.format[k].name,v.format[k].id,) for k in v.format.keys()])
      variant['info']=dict(v.info)
      #variant['genotypes']=[{'sample':{'display':phenoid_mapping[s]},'GT':v.samples[s]['GT'],'AD':v.samples[s]['AD'],'DP':v.samples[s]['DP']} for s in v.samples]
      variant['genotypes']=[{'sample':s,'GT':v.samples[s]['GT'],'AD':v.samples[s]['AD'],'DP':v.samples[s]['DP']} for s in v.samples]
      #variant['HET']=dict([(s,dict(zip(variant['alleles'],v.samples[s]['AD'])),) for s in v.samples if v.samples[s]['GT'].count(1)==1])
      #variant['HOM']=dict([(s,dict(zip(variant['alleles'],v.samples[s]['AD'])),) for s in v.samples if v.samples[s]['GT'].count(1)==2])
   x=json.loads(file(app.config['USER_CONFIGURATION'].format(session['user'],language,'variant') ,'r').read())
   c,fd,=sqlite3_ro_cursor(app.config['PHENOPOLIS_DB'])
   #python3
   #conn=sqlite3.connect('file:/media/pontikos_nas/pontikos/phenopolis/genes.db?mode=ro', uri=True)
   c.execute('select * from variants where "#CHROM"=? and POS=? and REF=? and ALT=?',variant_id.split('-'))
   var=[dict(zip([h[0] for h in c.description] ,r)) for r in c.fetchall()]
   process_for_display(var)
   var=var[0]
   print json.dumps(var)
   x[0]['metadata']['data']=[var]
   x[0]['individuals']['data']=[var]
   x[0]['frequency']['data']=[var]
   x[0]['consequence']['data']=[var]
   x[0]['genotypes']['data']=variant['genotypes']
   if subset=='all': return json.dumps(x)
   else: return json.dumps([{subset:y[subset]} for y in x])


# AJAX
# Not finished
@app.route('/chisqu/<variant_str>',methods=['GET','POST'])
@requires_auth
def chisq(variant_str):
    if request.method=='POST':
        hpo_patients=request.form['patients'].strip().split(',')
    else:
        hpo_patients=request.args.get('patients').strip().split(',')
    print('hpo_patients',hpo_patients,)
    variant_str=str(variant_str).strip().replace('_','-')
    chrom, pos, ref, alt = variant_str.split('-')
    tb=pysam.TabixFile('chr%s.vcf.gz' % chrom,)
    region=str('%s:%s-%s'%(chrom, pos, int(pos),))
    headers=[h for h in tb.header]
    headers=(headers[len(headers)-1]).strip().split('\t')
    print(region)
    records=tb.fetch(region=region)
    geno=dict(zip(headers, [r.split('\t') for r in records][0]))
    samples=[h for h in geno if geno[h].split(':')[0]=='0/1' or geno[h].split(':')[0]=='1/1']
    res=jsonify(result=hpo_patients)
    return res



def response(POS, REF, ALT, index, geno, chrom, pos):
    homozygous_genotype='/'.join([str(index),str(index)])
    heterozygous_genotype='/'.join(['0',str(index)])
    variant=dict()
    variant['pos']=POS
    variant['ref']=REF
    variant['alt']=ALT
    variant['hom_samples']=[h for h in geno if geno[h].split(':')[0]==homozygous_genotype][0:100]
    variant['HOM_COUNT']=len(variant['hom_samples'])
    variant['het_samples']=[h for h in geno if geno[h].split(':')[0]==heterozygous_genotype][0:100]
    variant['HET_COUNT']=len(variant['het_samples'])
    variant['wt_samples']=[h for h in geno if geno[h].split(':')[0]=='0/0'][1:100]
    variant['WT_COUNT']=len([h for h in geno if geno[h].split(':')[0]=='0/0'])
    variant['MISS_COUNT']=len([h for h in geno if geno[h].split(':')[0]=='./.'])
    variant['allele_num']= 2*(variant['HOM_COUNT'] + variant['HET_COUNT']+variant['WT_COUNT'])
    variant['allele_count']=2*variant['HOM_COUNT'] + variant['HET_COUNT']
    #variant['site_quality'] = variant['QUAL']
    #variant['filter'] = variant['FILTER']
    if variant['WT_COUNT']==0:
        variant['allele_freq'] = None
    else:
        variant['allele_freq'] = float(variant['HET_COUNT']+2*variant['HOM_COUNT']) / float(2*variant['WT_COUNT'])
    var2='-'.join([str(chrom),str(pos),variant['ref'],variant['alt']])
    variant['variant_id']=var2
    samples=variant['het_samples']+variant['hom_samples']
    print(samples)
    variant['hpo']=[p for p in get_db(app.config['DB_NAME_PATIENTS']).patients.find({'external_id':{'$in':samples}},{'_id':0,'features':1,'external_id':1})]
    return(jsonify(result=variant))


    
@app.route('/variant/<variant_str>')
@requires_auth
def variant_page(variant_str):
    try:
        variant=orm.Variant(variant_id=variant_str,db=get_db())
    except:
        return 'Variant does not exist'
    if not variant: return 'Variant does not exist'
    variant=variant.__dict__
    if session['user'] == 'demo':
        del variant['wt_samples']
        del variant['het_samples']
        del variant['hom_samples']
    return jsonify( 'variant.html', title=variant_str, variant=variant)


@app.route('/variant_json/<variant_str>')
def variant_json(variant_str):
    variant=orm.Variant(variant_id=variant_str,db=get_db())
    if session['user'] == 'demo':
        variant.__dict__['wt_samples']=[]
        variant.__dict__['het_samples']=[]
        variant.__dict__['hom_samples']=[]
    return jsonify(result=variant.__dict__)

@app.route('/variant_json_db_new/<variant_str>')
def variant_json_db_new(variant_str):
    if session['user'] == 'demo': return ''
    variant=orm.Variant(variant_id=variant_str,db=get_db())
    return jsonify(result=variant.__dict__)

@app.route('/set_variant_causal/<individual>/<variant_str>')
def set_variant_causal(individual, variant_str):
    print individual, variant_str
    db=get_db()
    #get_db().patients.update({'patient_id':individual},{'$addToSet':{'causal_variants':variant_str}})
    var=db.variants.find_one({'variant_id':variant_str})
    gene_id=var['genes'][0]
    gene_name=db.genes.find_one({'gene_id':gene_id})['gene_name_upper']
    print 'GENE_NAME', gene_name
    p=get_db('DB_NAME_PATIENTS').patients.find_one({'external_id':individual})
    get_db('DB_NAME_PATIENTS').patients.update_one({'external_id':individual},{'$set':{'genes': p.get('genes',[])+[{'gene':gene_name}]}})
    print get_db(app.config['DB_NAME_PATIENTS']).patients.update({'external_id':individual},{'$set':p},w=0)
    p=db.patients.find_one({'external_id':individual})
    p['causal_variants']=list(frozenset(p.get('causal_variants',[])+[variant_str]))
    db.patients.update({'external_id':individual},{'$set':{'causal_variants':p['causal_variants']}},w=0)
    if request.referrer:
        referrer=request.referrer
        u = urlparse(referrer)
        referrer='%s://%s' % (u.scheme,u.hostname,)
        if u.port: referrer='%s:%s' % (referrer,u.port,)
    return redirect(referrer+'/individual/'+individual)

@app.route('/unset_variant_causal/<individual>/<variant_str>')
def unset_variant_causal(individual, variant_str):
    print individual, variant_str
    db=get_db()
    p=db.patients.find_one({'external_id':individual})
    if 'causal_variants' in p and not p['causal_variants']: p['causal_variants']=[]
    if variant_str in p.get('causal_variants',[]):
        p['causal_variants']=p['causal_variants'].remove(variant_str)
    db.patients.update({'external_id':individual},{'$set':{'causal_variants':p['causal_variants']}},w=0)
    p2=get_db('DB_NAME_PATIENTS').patients.find_one({'external_id':individual})
    p2['genes']=[]
    for var in p['causal_variants']:
        var=db.variants.find_one({'variant_id':var})
        gene_id=var['genes'][0]
        gene_name=db.genes.find_one({'gene_id':gene_id})['gene_name_upper']
        print 'GENE_NAME', gene_name
        p2['genes']=list(frozenset(p2.get('genes',[])+[{'gene':gene_name}]))
    print get_db(app.config['DB_NAME_PATIENTS']).patients.update({'external_id':individual},{'$set':p2},w=0)
    if request.referrer:
        referrer=request.referrer
        u = urlparse(referrer)
        referrer='%s://%s' % (u.scheme,u.hostname,)
        if u.port: referrer='%s:%s' % (referrer,u.port,)
    return redirect(referrer+'/individual/'+individual)

@app.route('/set_variant_status/<individual>/<variant_str>/<status>')
def set_variant_status(individual, variant_str, status):
    print individual, variant_str, status
    db=get_db()
    #print get_db().patients.update({'patient_id':individual},{'$addToSet':{'variant_status':{variant_str:status}}})
    rare_variants=db.patients.find_one({'external_id':individual},{'rare_variants':1})['rare_variants']
    for rv in rare_variants:
        if rv['variant_id']==variant_str:
            rv['status']=status
    print db.patients.update({'external_id':individual},{'$set':{'rare_variants':rare_variants}})
    return status


@app.route('/private_variants/<individual>')
def private_variants(individual):
    pv=[]
    cmd="bgt view -s,"+individual+" -s 'name!=\""+individual+"\"' -f 'AC1>0&&AC2==0' -G "+ "/slms/gee/research/vyplab/UCLex/mainset_July2016/bgt/mainset_July2016.bgt"
    print(cmd)
    s=subprocess.check_output([cmd],shell=True)
    for l in s.split('\n'):
        if len(l)<5: continue
        if l.startswith('##'): continue
        if l.startswith('#'):
            headers=l.split('\t')
            continue
        d=dict(zip(headers,l.split('\t')))
        d.update(dict([x.split('=') for x in d['INFO'].split(';')]))
        del d['INFO']
        d['variant_id']='-'.join([d['#CHROM'],d['POS'],d['REF'],d['ALT']])
        pv.append(d)
    return jsonify(result=pv)

@app.route('/rare_variants/<individual>/<AC>')
def rare_variants(individual,AC=10):
    pv=[]
    cmd="bgt view -s,"+individual+" -s 'name!=\""+individual+"\"' -f 'AC1>0&&AC2<%s' "%str(AC)+ "-G /slms/gee/research/vyplab/UCLex/mainset_July2016/bgt/mainset_July2016.bgt" 
    print(cmd)
    proc=subprocess.Popen(cmd,stdout=subprocess.PIPE,shell=True)
    def generate():
        for l in iter(proc.stdout.readline,''):
            l=l.strip()
            print(l)
            if len(l)<5: continue
            if l.startswith('##'): continue
            if l.startswith('#'):
                headers=l.split('\t')
                continue
            d=dict(zip(headers,l.split('\t')))
            d.update(dict([x.split('=') for x in d['INFO'].split(';')]))
            del d['INFO']
            if ',' in d['ALT']: d['ALT']=d['ALT'].split(',')[0]
            d['variant_id']='-'.join([d['#CHROM'],d['POS'],d['REF'],d['ALT']])
            try:
                var=orm.Variant(variant_id=d['variant_id'],db=get_db())
            except Exception, e:
                print(e)
                print(d)
                continue
            yield flask.json.dumps(var.__dict__)+'\n'
            #yield l+'\n'
    #return Response(stream_with_context(generate()),mimetype='application/json')
    return Response(stream_with_context(generate()),mimetype='text/plain')

@app.route('/common_private_variants/<individual>/<individual2>')
def common_private_variants(individual,individual2):
    pv=[]
    s=subprocess.check_output(["bgt view -s,"+individual+" -s,"+individual2+" -s 'name!=\""+individual+"\"&&name!=\""+individual2+"\"' -f 'AC1>0&&AC2>0&&AC3==0' -G /slms/gee/research/vyplab/UCLex/mainset_July2016/bgt/mainset_July2016.bgt" ],shell=True)
    #bgt view -s,IRDC_batch6_LON_2055 -s,WebsterURMD_Sample_06G02870 -s 'name!="IRDC_batch6_LON_2055"&&name!="WebsterURMD_Sample_06G02870"' -f 'AC1>0&&AC2>0&&AC3==0' -G mainset_July2016_chr1.bgt
    for l in s.split('\n'):
        if len(l)<5: continue
        if l.startswith('##'): continue
        if l.startswith('#'):
            headers=l.split('\t')
            continue
        d=dict(zip(headers,l.split('\t')))
        d.update(dict([x.split('=') for x in d['INFO'].split(';')]))
        del d['INFO']
        d['variant_id']='-'.join([d['#CHROM'],d['POS'],d['REF'],d['ALT']])
        pv.append(d)
    return jsonify(result=pv)

@app.route('/common_rare_variants/<individual>/<individual2>/<AC>')
def common_rare_variants(individual,individual2,AC=1):
    pv=[]
    s=subprocess.check_output(["bgt view -s,"+individual+" -s,"+individual2+" -s 'name!=\""+individual+"\"&&name!=\""+individual2+"\"' -f 'AC1>0&&AC2>0&&AC3<%s' "%AC+ "-G /slms/gee/research/vyplab/UCLex/mainset_July2016/bgt/mainset_July2016.bgt" ],shell=True)
    #bgt view -s,IRDC_batch6_LON_2055 -s,WebsterURMD_Sample_06G02870 -s 'name!="IRDC_batch6_LON_2055"&&name!="WebsterURMD_Sample_06G02870"' -f 'AC1>0&&AC2>0&&AC3==0' -G mainset_July2016_chr1.bgt
    for l in s.split('\n'):
        if len(l)<5: continue
        if l.startswith('##'): continue
        if l.startswith('#'):
            headers=l.split('\t')
            continue
        d=dict(zip(headers,l.split('\t')))
        d.update(dict([x.split('=') for x in d['INFO'].split(';')]))
        del d['INFO']
        #d['variant_id']='-'.join([d['#CHROM'],d['POS'],d['REF'],d['ALT']])
        #pv.append(d)
        d['variant_id']='-'.join([d['#CHROM'],d['POS'],d['REF'],d['ALT']])
        try:
            var=orm.Variant(variant_id=d['variant_id'],db=get_db())
        except Exception, e:
            print(e)
            print(d)
            continue
        pv.append(var.__dict__)
    return jsonify(result=pv)



