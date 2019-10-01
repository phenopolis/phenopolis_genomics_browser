from views import *
import requests


@app.route('/<language>/variant/<variant_id>')
@app.route('/<language>/variant/<variant_id>/<subset>')
@app.route('/variant/<variant_id>')
@app.route('/variant/<variant_id>/<subset>')
@requires_auth
def variant(variant_id, subset='all', language='en'):
   q="select external_id, internal_id from `poised-breaker-236510.phenopolis_August2019.individuals`"
   query_job=bigquery_client.query(q, location="EU",) 
   pheno_ids=[dict(x) for x in query_job]
   phenoid_mapping={ind['external_id']:ind['internal_id'] for ind in pheno_ids}
   chrom,pos,ref,alt,=variant_id.split('-')
   url='https://myvariant.info/v1/variant/chr%s:g.%s%s>%s?fields=clinvar.rcv.clinical_significance&dotfield=true' % (chrom,pos,ref,alt,)
   x=requests.get(url).json()
   if x:
       clinical_significance=str(x.get("clinvar.rcv.clinical_significance",''))
   else:
       clinical_significance=''
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
      variant['genotypes']=[{'sample':[{'display':phenoid_mapping[s]}],'GT':v.samples[s].get('GT',''),'AD':v.samples[s].get('AD',''),'DP':v.samples[s].get('DP','')} for s in v.samples]
   x=json.loads(open(app.config['USER_CONFIGURATION'].format(session['user'],language,'variant') ,'r').read())
   chrom,pos,ref,alt,=variant_id.split('-')
   q="select * from `poised-breaker-236510.phenopolis_August2019.variants` where CHROM='%s' and POS=%s and REF='%s' and ALT='%s'"%(chrom,pos,ref,alt,)
   print(q)
   query_job=bigquery_client.query(q, location="EU",) 
   var=[dict(x) for x in query_job]
   process_for_display(var)
   var=var[0]
   x[0]['metadata']['data']=[var]
   x[0]['individuals']['data']=[var]
   x[0]['frequency']['data']=[var]
   x[0]['consequence']['data']=[var]
   x[0]['genotypes']['data']=variant['genotypes']
   x[0]['preview']=[['Clinvar', clinical_significance]]
   if subset=='all': return json.dumps(x)
   else: return json.dumps([{subset:y[subset]} for y in x])



