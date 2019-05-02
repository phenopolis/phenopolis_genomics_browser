import flask
from views import *
from lookups import *
import requests
import myvariant
import re
from utils import *
import itertools
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
   c,fd,=sqlite3_ro_cursor(app.config['PHENOPOLIS_DB'])
   c.execute("select external_id, internal_id from individuals")
   pheno_ids=[dict(zip([h[0] for h in c.description],r)) for r in c.fetchall()]
   phenoid_mapping={ind['external_id']:ind['internal_id'] for ind in pheno_ids}
   print(phenoid_mapping)
   chrom,pos,ref,alt,=variant_id.split('-')
   pos=int(pos)
   variant_file=pysam.VariantFile(app.config['VCF_FILE'])
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
      variant['genotypes']=[{'sample':[{'display':phenoid_mapping[s]}],'GT':v.samples[s].get('GT',''),'AD':v.samples[s].get('AD',''),'DP':v.samples[s].get('DP','')} for s in v.samples]
   x=json.loads(file(app.config['USER_CONFIGURATION'].format(session['user'],language,'variant') ,'r').read())
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



