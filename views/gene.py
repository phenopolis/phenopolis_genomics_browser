from views import *


@app.route('/<language>/gene/<gene_id>')
@app.route('/<language>/gene/<gene_id>/<subset>')
@app.route('/gene/<gene_id>')
@app.route('/gene/<gene_id>/<subset>')
@requires_auth
def gene(gene_id, subset='all', language='en'):
   x=json.loads(open(app.config['USER_CONFIGURATION'].format(session['user'],language,'gene') ,'r').read())
   #c,fd,=sqlite3_ro_cursor(app.config['PHENOPOLIS_DB'])
   gene_id=gene_id.upper()
   if gene_id.startswith('ENSG'):
      q="SELECT * FROM `poised-breaker-236510.phenopolis_August2019.genes` where gene_id='%s'" % gene_id
      query_job=bigquery_client.query(q, location="EU",) 
      data=[dict(x) for x in query_job]
   else:
      q="SELECT * FROM `poised-breaker-236510.phenopolis_August2019.genes` where gene_name='%s'" % gene_id
      query_job=bigquery_client.query(q, location="EU",) 
      data=[dict(x) for x in query_job]
   if not data:
      q="SELECT * FROM `poised-breaker-236510.phenopolis_August2019.genes` where other_names like '%s'" % ('%'+gene_id+'%')
      query_job=bigquery_client.query(q, location="EU",) 
      data=[dict(x) for x in query_job]
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
       q="select hpo_id from `poised-breaker-236510.phenopolis_August2019.gene_hpo` where gene_symbol='%s'"%gene_name
       query_job=bigquery_client.query(q, location="EU",) 
       data=[dict(x) for x in query_job]
       d["related_hpo"]=[]
       for x in []:
           hpo_id=x['hpo_id']
           print(hpo_id)
           q="select hpo_name from `poised-breaker-236510.phenopolis_August2019.hpo` where hpo_id='%s' limit 1"%hpo_id
           query_job=bigquery_client.query(q, location="EU",) 
           data=[dict(x) for x in query_job][0]
           d['related_hpo']+=[{'display':data['hpo_name'], 'end_href':hpo_id}]
   q="select * from `poised-breaker-236510.phenopolis_August2019.variants` where gene_symbol='%s'" % (x[0]['metadata']['data'][0]['gene_name'],)
   query_job=bigquery_client.query(q, location="EU",) 
   data=[dict(x) for x in query_job]
   x[0]['variants']['data']=data
   cadd_gt_20=0
   for v in x[0]['variants']['data']:
       v['variant_id']=[{'display':'%s-%s-%s-%s' % (v['CHROM'], v['POS'], v['REF'], v['ALT'],)}]
       if v['cadd_phred'] and v['cadd_phred']!='NA' and float(v['cadd_phred'])>=20: cadd_gt_20+=1
   x[0]['preview']=[['pLI', x[0]['metadata']['data'][0].get('pLI','')],['Number of variants',len(x[0]['variants']['data'])],['CADD > 20',cadd_gt_20]]
   for d in x[0]['metadata']['data']: d['number_of_variants']=len(x[0]['variants']['data'])
   process_for_display(x[0]['variants']['data'])
   print(x[0]['preview'])
   #print x[0]['variants']['data'][0]
   if subset=='all': return json.dumps(x)
   else: return json.dumps([{subset:y[subset]} for y in x])
    


    
