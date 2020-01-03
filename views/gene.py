from views import *
from db import *


@application.route('/<language>/gene/<gene_id>')
@application.route('/<language>/gene/<gene_id>/<subset>')
@application.route('/gene/<gene_id>')
@application.route('/gene/<gene_id>/<subset>')
@requires_auth
def gene(gene_id, subset='all', language='en'):
   c=postgres_cursor()
   c.execute("select config from user_config u where u.user_name='%s' and u.language='%s' and u.page='%s' limit 1" % (session['user'], language, 'gene'))
   #get_db_session().query().filter(
   x=c.fetchone()[0]
   gene_id=gene_id.upper()
   if gene_id.startswith('ENSG'):
      data=get_db_session().query(Gene).filter(Gene.gene_id==gene_id)
   else:
      data=get_db_session().query(Gene).filter(Gene.gene_name==gene_id)
   if not data:
      data=get_db_session().query(Gene).filter(Gene.other_names.like('%'+gene_id+'%'))
   data=[p.as_dict() for p in data]
   if not data: return jsonify({'Gene not found': False}), 404
   x[0]['metadata']['data']=data
   chrom=x[0]['metadata']['data'][0]['chrom']
   start=x[0]['metadata']['data'][0]['start']
   stop=x[0]['metadata']['data'][0]['stop']
   gene_id=x[0]['metadata']['data'][0]['gene_id']
   gene_name=x[0]['metadata']['data'][0]['gene_name']
   for d in x[0]['metadata']['data']:
       #d['pLI']=1
       d["external_services"]=[
               {"display": "GnomAD Browser","href": "http://gnomad.broadinstitute.org/gene/"+gene_id},
               {"display": "GeneCards","href": "http://www.genecards.org/cgi-bin/carddisp.pl?gene="+gene_name}
               ]
       d["genome_browser"]=[
               {"display": "Ensembl Browser", "href": "http://grch37.ensembl.org/Homo_sapiens/Gene/Summary?g="+gene_id},
               {"display": "UCSC Browser", "href": "http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg19&position=chr%s:%s-%s"%(chrom,start,stop,)}
               ]
       d["other"]=[
               {"display": "Wikipedia","href": "http://en.wikipedia.org/"+gene_name},
                {"display": "Pubmed Search","href": "http://www.ncbi.nlm.nih.gov/pubmed?term="+gene_name},
                {"display": "Wikigenes","href": "http://www.wikigenes.org/?search="+gene_name},
                {"display": "GTEx (expression)","href": "http://www.gtexportal.org/home/gene/"+gene_name}
               ]
       #d["related_hpo"]=[ {'display':c.execute("select hpo_name from hpo where hpo_id='%s' limit 1"%hpo_id).fetchone()[0], 'end_href':hpo_id} for hpo_id, in c.execute("select hpo_id from gene_hpo where gene_symbol='%s'"%gene_name).fetchall() ]
       d["related_hpo"]=[ ]
   #c.execute("select * from variants where gene_symbol='%s'"%(x[0]['metadata']['data'][0]['gene_name'],))
   gene_id=x[0]['metadata']['data'][0]['gene_id']
   data=get_db_session().query(Gene).filter(Gene.gene_id==gene_id).first().variants
   x[0]['variants']['data']=[p.as_dict() for p in data]
   cadd_gt_20=0
   for v in x[0]['variants']['data']:
       v['variant_id']=[{'display':'%s-%s-%s-%s' % (v['CHROM'], v['POS'], v['REF'], v['ALT'],)}]
       if v['cadd_phred'] and v['cadd_phred']!='NA' and float(v['cadd_phred'])>=20: cadd_gt_20+=1
   x[0]['preview']=[['pLI', x[0]['metadata']['data'][0].get('pLI','')],['Number of variants',len(x[0]['variants']['data'])],['CADD > 20',cadd_gt_20]]
   for d in x[0]['metadata']['data']: d['number_of_variants']=len(x[0]['variants']['data'])
   process_for_display(x[0]['variants']['data'])
   c.close()
   #print x[0]['preview']
   #print x[0]['variants']['data'][0]
   if session['user']=='demo' and gene_name not in ['TTLL5','DRAM2']: x[0]['variants']['data']=[]
   if subset=='all': return json.dumps(x)
   else: return json.dumps([{subset:y[subset]} for y in x])
    


    
