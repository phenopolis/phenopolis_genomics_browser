from views import *
import boto3
import os
import requests


@application.route('/<language>/variant/<variant_id>')
@application.route('/<language>/variant/<variant_id>/<subset>')
@application.route('/variant/<variant_id>')
@application.route('/variant/<variant_id>/<subset>')
@requires_auth
def variant(variant_id, subset='all', language='en'):
   c=postgres_cursor()
   c.execute("select external_id, internal_id from individuals")
   pheno_ids=[dict(zip([h[0] for h in c.description],r)) for r in c.fetchall()]
   phenoid_mapping={ind['external_id']:ind['internal_id'] for ind in pheno_ids}
   #print(phenoid_mapping)
   chrom,pos,ref,alt,=variant_id.split('-')
   url='https://myvariant.info/v1/variant/chr%s:g.%s%s>%s?fields=clinvar.rcv.clinical_significance&dotfield=true' % (chrom,pos,ref,alt,)
   x=requests.get(url).json()
   if x:
       clinical_significance=str(x.get("clinvar.rcv.clinical_significance",''))
   else:
       clinical_significance=''
   pos=int(pos)
   s3 = boto3.client('s3', aws_secret_access_key = os.environ['VCF_S3_SECRET'],
                     aws_access_key_id = os.environ['VCF_S3_KEY'],
                     region_name = "eu-west-2",
                     config = boto3.session.Config(signature_version='s3v4'))
   vcf_index = s3.generate_presigned_url('get_object',Params={'Bucket': 'phenopolis-vcf','Key': 'August2019/merged2.vcf.gz.tbi'}, ExpiresIn=5000)
   vcf_file = s3.generate_presigned_url('get_object',Params={'Bucket': 'phenopolis-vcf','Key': 'August2019/merged2.vcf.gz'}, ExpiresIn=5000)
   variant_file=pysam.VariantFile(vcf_file, index_filename = vcf_index)
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
   c.execute("select config from user_config u where u.user_name='%s' and u.language='%s' and u.page='%s' limit 1" % (session['user'], language, 'variant'))
   x=c.fetchone()[0]
   CHROM,POS,REF,ALT,=variant_id.split('-')
   q="""select * from variants where "CHROM"='%s' and "POS"='%s' and "REF"='%s' and "ALT"='%s'"""%(CHROM,POS,REF,ALT,)
   print(q)
   c.execute(q)
   var=[dict(zip([h[0] for h in c.description] ,r)) for r in c.fetchall()]
   process_for_display(var)
   var=var[0]
   #print(json.dumps(var))
   x[0]['metadata']['data']=[var]
   x[0]['individuals']['data']=[var]
   x[0]['frequency']['data']=[var]
   x[0]['consequence']['data']=[var]
   x[0]['genotypes']['data']=variant['genotypes']
   x[0]['preview']=[['Clinvar', clinical_significance]]
   if subset=='all': return json.dumps(x)
   else: return json.dumps([{subset:y[subset]} for y in x])



