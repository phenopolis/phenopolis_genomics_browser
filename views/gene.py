from views import *


@app.route('/<language>/gene/<gene_id>')
@app.route('/<language>/gene/<gene_id>/<subset>')
@app.route('/gene/<gene_id>')
@app.route('/gene/<gene_id>/<subset>')
@requires_auth
def gene(gene_id, subset='all', language='en'):
   x=json.loads(file(app.config['USER_CONFIGURATION'].format(session['user'],language,'gene') ,'r').read())
   c,fd,=sqlite3_ro_cursor(app.config['PHENOPOLIS_DB'])
   gene_id=gene_id.upper()
   if gene_id.startswith('ENSG'):
      c.execute('select * from genes where gene_id=?',(gene_id,))
      data=c.fetchall()
   else:
      c.execute('select * from genes where gene_name=?',(gene_id,))
      data=c.fetchall()
   if not data:
      c.execute('select * from genes where other_names like ?',('%'+gene_id+'%',))
      data=c.fetchall()
   x[0]['metadata']['data']=[dict(zip([h[0] for h in c.description],r)) for r in data]
   print x[0]['metadata']['data']
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
       d["related_hpo"]=[ {'display':c.execute("select hpo_name from hpo where hpo_id='%s' limit 1"%hpo_id).fetchone()[0], 'end_href':hpo_id} for hpo_id, in c.execute("select hpo_id from gene_hpo where gene_symbol='%s'"%gene_name).fetchall() ]
   c.execute("select * from variants where gene_symbol=?",(x[0]['metadata']['data'][0]['gene_name'],))
   headers=[h[0] for h in c.description]
   x[0]['variants']['data']=[dict(zip(headers,r)) for r in c.fetchall()]
   cadd_gt_20=0
   for v in x[0]['variants']['data']:
       v['variant_id']=[{'display':'%s-%s-%s-%s' % (v['#CHROM'], v['POS'], v['REF'], v['ALT'],)}]
       if v['cadd_phred'] and float(v['cadd_phred'])>=20: cadd_gt_20+=1
   x[0]['preview']=[['pLI', x[0]['metadata']['data'][0].get('pLI','')],['Number of variants',len(x[0]['variants']['data'])],['CADD > 20',cadd_gt_20]]
   sqlite3_ro_close(c,fd)
   for d in x[0]['metadata']['data']: d['number_of_variants']=len(x[0]['variants']['data'])
   process_for_display(x[0]['variants']['data'])
   print x[0]['preview']
   #print x[0]['variants']['data'][0]
   if session['user']=='demo': x[0]['variants']['data']=[]
   if subset=='all': return json.dumps(x)
   else: return json.dumps([{subset:y[subset]} for y in x])
    


    
