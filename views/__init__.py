
#flask import
from flask import Flask
from flask import session
from flask.ext.session import Session
from flask import Response
from flask import stream_with_context
from flask import request
from flask import make_response
from flask import request
from flask import send_file
from flask import g
from flask import redirect
from flask import url_for
from flask import abort
from flask import flash
from flask import jsonify
from flask import send_from_directory
from flask.ext.compress import Compress
from flask.ext.runner import Runner
from flask_debugtoolbar import DebugToolbarExtension 
from flask.ext.cache import Cache
import sys
import StringIO
import urllib, base64 
import md5 
from scipy.stats import chisquare
import math 
from bson.json_util import loads
import itertools
import json
import os
import pymongo
import gzip
import logging
import lookups
import random
from utils import * 
from collections import defaultdict, Counter
from collections import OrderedDict
from werkzeug.contrib.cache import SimpleCache 
from multiprocessing import Process
import glob
import sqlite3
import traceback
import time 
from functools import wraps 
from werkzeug.exceptions import default_exceptions, HTTPException 
import pandas
import csv
import time
import StringIO 
from urlparse import urlparse
import pickle 
import numpy
import subprocess
import datetime
from Crypto.Cipher import DES
import base64
from binascii import b2a_base64, a2b_base64
from werkzeug.security import generate_password_hash, check_password_hash
from passlib.hash import argon2
import orm
from lookups import *
import regex
import requests

logging.getLogger().addHandler(logging.StreamHandler())
logging.getLogger().setLevel(logging.INFO)

# Load default config and override config from an environment variable
app = Flask(__name__)
app.config.from_pyfile('../local.cfg')

Compress(app)
#app.config['COMPRESS_DEBUG'] = True
#cache = SimpleCache(default_timeout=70*60*24)
cache = Cache(app,config={'CACHE_TYPE': 'simple'})

#from flask_httpauth import HTTPBasicAuth
#auth = HTTPBasicAuth()

REGION_LIMIT = 1E5
EXON_PADDING = 50

# Check Configuration section for more details
SESSION_TYPE = 'mongodb'
app.config.from_object(__name__)
sess=Session()
sess.init_app(app)


def sqlite3_ro_cursor(dbname):
   fd = os.open(dbname, os.O_RDONLY)
   conn = sqlite3.connect('/dev/fd/%d' % fd)
   c=conn.cursor()
   return (c, fd)

def sqlite3_ro_close(cursor, fd):
   cursor.close()
   os.close(fd)

def check_auth(username, password):
    """
    This function is called to check if a username / password combination is valid.
    """
    c,fd,=sqlite3_ro_cursor(app.config['USERS_DB'])
    c.execute('select * from users where user=?',(username,))
    headers=[h[0] for h in c.description]
    user=[dict(zip(headers,r)) for r in c.fetchall()]
    print(user)
    if len(user)==0: return False
    session['user']=username
    return argon2.verify(password, user[0]['argon_password'])

def authenticate():
    """Sends a 401 response that enables basic auth"""
    return Response( 'Could not verify your access level for that URL.\n' 'You have to login with proper credentials', 401, {'WWW-Authenticate': 'Basic realm="Login Required"'})


def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if session:
          if 'user' in session: 
             return f(*args, **kwargs)
        if request.method == 'POST':
          username=request.form['user']
          password=request.form['password']
          if check_auth(username,password):
             return f(*args, **kwargs)
        print('Not Logged In - Redirect to home to login')
        return jsonify(success='Unauthenticated'), 403
    return decorated


@app.before_request
def make_session_timeout():
    session.permanent = True
    app.permanent_session_lifetime = datetime.timedelta(hours=2)

# 
@app.route('/login', methods=['POST'])
def login():
    username=request.form['name']
    password=request.form['password']
    print(username)
    print(check_auth(username,password))
    if not check_auth(username,password):
       print('Login Failed')
       return jsonify(error='Invalid Credentials. Please try again.'), 401
    else:
        print('LOGIN SUCCESS')
        return jsonify(success="Authenticated"), 200

# 
@app.route('/logout', methods=['POST'])
def logout():
    print('DELETE SESSION')
    session.pop('user',None)
    return jsonify(success='logged out'), 200


@app.route('/set/<query>')
def set(query):
    value = query
    session['key'] = value
    return value

@app.route('/get/')
def get():
    return session.get('key', 'not set')


def get_db(dbname=None):
    """
    Opens a new database connection if there is none yet for the
    current application context.
    """
    if dbname is None: dbname=app.config['DB_NAME']
    if not hasattr(g, 'db_conn'):
        g.db_conn=dict()
        g.db_conn[dbname] = connect_db(dbname)
    elif dbname not in g.db_conn:
        g.db_conn[dbname] = connect_db(dbname)
    return g.db_conn[dbname]

def get_hpo_graph():
    """
    """
    if not hasattr(g, 'hpo_graph'):
        from hpo_similarity.ontology import Ontology
        from hpo_similarity.similarity import CalculateSimilarity
        ontology=Ontology(app.config['HPO_OBO'])
        g.hpo_graph=ontology.get_graph()
    return g.hpo_graph


def connect_db(dbname=None):
    """
    Connects to the specific database.
    """
    if dbname=='neo4j':
        from neo4j.v1 import GraphDatabase, basic_auth
        neo4j=GraphDatabase.driver("bolt://localhost:7687", auth=basic_auth("neo4j", "1"))
        return neo4j.session()
    print(app.config['DB_HOST'], app.config['DB_PORT'])
    client = pymongo.MongoClient(host=app.config['DB_HOST'], port=app.config['DB_PORT'])
    print(client)
    if not dbname: dbname=app.config['DB_NAME']
    print(dbname)
    return client[dbname]



def parse_tabix_file_subset(tabix_filenames, subset_i, subset_n, record_parser):
    """
    Returns a generator of parsed record objects (as returned by record_parser) for the i'th out n subset of records
    across all the given tabix_file(s). The records are split by files and contigs within files, with 1/n of all contigs
    from all files being assigned to this the i'th subset.

    Args:
        tabix_filenames: a list of one or more tabix-indexed files. These will be opened using pysam.Tabixfile
        subset_i: zero-based number
        subset_n: total number of subsets
        record_parser: a function that takes a file-like object and returns a generator of parsed records
    """
    start_time = time.time()
    print(tabix_filenames)
    open_tabix_files = [pysam.Tabixfile(tabix_filename) for tabix_filename in tabix_filenames]
    tabix_file_contig_pairs = [(tabix_file, contig) for tabix_file in open_tabix_files for contig in tabix_file.contigs]
    # get every n'th tabix_file/contig pair
    tabix_file_contig_subset = tabix_file_contig_pairs[subset_i : : subset_n]
    short_filenames = ", ".join(map(os.path.basename, tabix_filenames))
    print(short_filenames)
    num_file_contig_pairs = len(tabix_file_contig_subset)
    print(("Loading subset %(subset_i)s of %(subset_n)s total: %(num_file_contig_pairs)s contigs from %(short_filenames)s") % locals())
    counter = 0
    for tabix_file, contig in tabix_file_contig_subset:
        header_iterator = tabix_file.header
        records_iterator = tabix_file.fetch(contig, 0, 10**9, multiple_iterators=True)
        for parsed_record in record_parser(itertools.chain(header_iterator, records_iterator)):
            counter += 1
            yield parsed_record
            if counter % 100000 == 0:
                seconds_elapsed = int(time.time()-start_time)
                print(("Loaded %(counter)s records from subset %(subset_i)s of %(subset_n)s from %(short_filenames)s " "(%(seconds_elapsed)s seconds)") % locals())
    print("Finished loading subset %(subset_i)s from  %(short_filenames)s (%(counter)s records)" % locals())



def create_cache():
    """
    This is essentially a compile step that generates all cached resources.
    Creates files like autocomplete_entries.txt
    Should be run on every redeploy.
    """
    # create autocomplete_entries.txt
    autocomplete_strings = []
    for gene in get_db().genes.find():
        autocomplete_strings.append(gene['gene_name'])
        if 'other_names' in gene:
            autocomplete_strings.extend(gene['other_names'])
    f = open(os.path.join(app.config['UCLEX_FILES_DIRECTORY'],'autocomplete_strings.txt'), 'w')
    for s in sorted(autocomplete_strings):
        f.write(s+'\n')
    f.close()
    # create static gene pages for genes in
    if not os.path.exists(app.config['GENE_CACHE_DIR']): os.makedirs(app.config['GENE_CACHE_DIR'])
    # get list of genes ordered by num_variants
    for gene_id in app.config['GENES_TO_CACHE']:
        try:
            page_content = get_gene_page_content(gene_id)
        except Exception as e:
            print(e)
            continue
        f = open(os.path.join(app.config['GENE_CACHE_DIR'], '{}.html'.format(gene_id)), 'w')
        f.write(page_content)
        f.close()


def precalculate_metrics():
    db = get_db()
    print('Reading %s variants...' % db.variants.count())
    metrics = defaultdict(list)
    binned_metrics = defaultdict(list)
    progress = 0
    start_time = time.time()
    for variant in db.variants.find(fields=['quality_metrics', 'site_quality', 'allele_num', 'allele_count']):
        for metric, value in variant['quality_metrics'].iteritems():
            metrics[metric].append(float(value))
        qual = float(variant['site_quality'])
        metrics['site_quality'].append(qual)
        if variant['allele_num'] == 0: continue
        if variant['allele_count'] == 1:
            binned_metrics['singleton'].append(qual)
        elif variant['allele_count'] == 2:
            binned_metrics['doubleton'].append(qual)
        else:
            for af in AF_BUCKETS:
                if float(variant['allele_count'])/variant['allele_num'] < af:
                    binned_metrics[af].append(qual)
                    break
        progress += 1
        if not progress % 100000:
            print('Read %s variants. Took %s seconds' % (progress, int(time.time() - start_time)))
    print('Done reading variants. Dropping metrics database... ')
    db.metrics.drop()
    print('Dropped metrics database. Calculating metrics...')
    for metric in metrics:
        bin_range = None
        data = map(numpy.log, metrics[metric]) if metric == 'DP' else metrics[metric]
        if metric == 'FS':
            bin_range = (0, 20)
        elif metric == 'VQSLOD':
            bin_range = (-20, 20)
        elif metric == 'InbreedingCoeff':
            bin_range = (0, 1)
        if bin_range is not None:
            data = [x if (x > bin_range[0]) else bin_range[0] for x in data]
            data = [x if (x < bin_range[1]) else bin_range[1] for x in data]
        hist = numpy.histogram(data, bins=40, range=bin_range)
        edges = hist[1]
        # mids = [(edges[i]+edges[i+1])/2 for i in range(len(edges)-1)]
        lefts = [edges[i] for i in range(len(edges)-1)]
        db.metrics.insert({
            'metric': metric,
            'mids': lefts,
            'hist': list(hist[0])
        })
    for metric in binned_metrics:
        hist = numpy.histogram(map(numpy.log, binned_metrics[metric]), bins=40)
        edges = hist[1]
        mids = [(edges[i]+edges[i+1])/2 for i in range(len(edges)-1)]
        db.metrics.insert({
            'metric': 'binned_%s' % metric,
            'mids': mids,
            'hist': list(hist[0])
        })
    db.metrics.ensure_index('metric')
    print('Done pre-calculating metrics!')

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



def get_rathergood_suggestions(query):
    """
    This generates autocomplete suggestions when user
    query is the string that user types
    If it is the prefix for a gene, return list of gene names
    """
    regex = re.compile(re.escape(query), re.IGNORECASE)
    patient_results = [x['external_id'] for x in get_db(app.config['DB_NAME_PATIENTS']).patients.find(
      {'external_id':regex}, {'score': {'$meta': 'textScore'}}
      ).sort([('score', {'$meta': 'textScore'})])
    ]
    gene_results = [x['gene_name'] for x in get_db().genes.find(
      {'gene_name':regex}, {'score': {'$meta': 'textScore'}}
      ).sort([('score', {'$meta': 'textScore'})])
    ]
    hpo_results = [x['name'][0] for x in get_db(app.config['DB_NAME_HPO']).hpo.find(
      {'name':regex}, {'score': {'$meta': 'textScore'}}
      ).sort([('score', {'$meta': 'textScore'})])
    ]
    results = patient_results+gene_results+hpo_results
    results = itertools.islice(results, 0, 20)
    return list(results)

@app.route('/phenotype_suggestions/<hpo>')
def get_phenotype_suggestions(hpo):
    # pattern = '.*?'.join(re.escape(hpo))   # Converts 'kid' to 'k.*?i.*?d'
    regex = re.compile(re.escape(hpo), re.IGNORECASE)  # Compiles a regex.
    suggestions = [x['name'][0] for x in get_db(app.config['DB_NAME_HPO']).hpo.find(
            {['name'][0]:regex}, {"score": {"$meta": "textScore"}} 
      ).sort([('score', {'$meta': 'textScore'})])]
    return json.dumps(suggestions[0:20])

@app.route('/gene_suggestions/<gene>')
def get_gene_suggestions(gene):
    # pattern = '.*?'.join(re.escape(gene))   # Converts 'kid' to 'k.*?i.*?d'
    regex = re.compile(re.escape(gene), re.IGNORECASE)  # Compiles a regex.
    suggestions = [x['gene_name'] for x in get_db().genes.find(
        {'gene_name':regex}, {"score": {"$meta": "textScore"}} 
      ).sort([('score', {'$meta': 'textScore'})]
    )]
    return json.dumps(suggestions[0:20])

def get_rathergood_result(db, query):
    """
    Similar to the above, but this is after a user types enter
    We need to figure out what they meant - could be gene, variant, region
    Return tuple of (datatype, identifier)
    Where datatype is one of 'gene', 'variant', or 'region'
    And identifier is one of:
    - ensembl ID for gene
    - variant ID string for variant (eg. 1-1000-A-T)
    - region ID string for region (eg. 1-1000-2000)
    Follow these steps:
    - if query is an ensembl ID, return it
    - if a gene symbol, return that gene's ensembl ID
    - if an RSID, return that variant's string
    Finally, note that we don't return the whole object here - only it's identifier.
    This could be important for performance later
    """
    query = query.strip()
    print('Query: %s' % query)
    # phenotype
    if query.startswith('HP:'):
        description=phizz.query_hpo([query])
        #description=hpo_db.hpo.find_one({'hpo_id':query})
        return 'hpo', query
    hpo=get_db(app.config['DB_NAME_HPO']).hpo.find_one({'name':query})
    if hpo:
        hpo_id=hpo['id'][0]
        return 'hpo', hpo_id
    if query.startswith('MIM'):
        disease=phizz.query_disease([query])
        return 'mim', query
    # patient
    patient=get_db(app.config['DB_NAME_PATIENTS']).patients.find_one({'external_id':query})
    if patient:
        return 'individual', patient['external_id']
    # Variant
    variant = orm.get_variants_by_rsid(db, query.lower())
    if variant:
        if len(variant) == 1:
            return 'variant', variant[0]['variant_id']
        else:
            return 'dbsnp_variant_set', variant[0]['rsid']
    variant = get_variants_from_dbsnp(db, query.lower())
    if variant:
        return 'variant', variant[0]['variant_id']
    # variant = get_variant(db, )
    # TODO - https://github.com/brettpthomas/exac_browser/issues/14
    gene = get_gene_by_name(db, query)
    if gene:
        return 'gene', gene['gene_id']
    # From here out, all should be uppercase (gene, tx, region, variant_id)
    query = query.upper()
    gene = get_gene_by_name(db, query)
    if gene:
        return 'gene', gene['gene_id']
    # Ensembl formatted queries
    if query.startswith('ENS'):
        # Gene
        gene = get_gene(db, query)
        if gene:
            return 'gene', gene['gene_id']
        # Transcript
        transcript = get_transcript(db, query)
        if transcript:
            return 'transcript', transcript['transcript_id']
    # From here on out, only region queries
    if query.startswith('CHR'):
        query = query.lstrip('CHR')
    # Region
    m = R1.match(query)
    if m:
        if int(m.group(3)) < int(m.group(2)):
            return 'region', 'invalid'
        return 'region', '{}-{}-{}'.format(m.group(1), m.group(2), m.group(3))
    m = R2.match(query)
    if m:
        return 'region', '{}-{}-{}'.format(m.group(1), m.group(2), m.group(2))
    m = R3.match(query)
    if m:
        return 'region', '{}'.format(m.group(1))
    m = R4.match(query)
    if m:
        return 'variant', '{}-{}-{}-{}'.format(m.group(1), m.group(2), m.group(3), m.group(4))
    return 'not_found', query



@app.route('/autocomplete/<query>')
def rathergood_autocomplete(query):
    suggestions = get_rathergood_suggestions(query)
    return Response(json.dumps(suggestions),  mimetype='application/json')


@app.route('/awesome')
@requires_auth
def awesome():
    db = get_db()
    query = str(request.args.get('query'))
    #for n in dir(request): print(n, getattr(request,n))
    #print(request.HTTP_REFERER)
    print(request.referrer)
    if request.referrer:
        referrer=request.referrer
        u = urlparse(referrer)
        referrer='%s://%s' % (u.scheme,u.hostname,)
        if u.port: referrer='%s:%s' % (referrer,u.port,)
    else:
        referrer=''
    #u.netloc
    print(referrer)
    datatype, identifier = get_rathergood_result(db, query)
    print("Searched for %s: %s" % (datatype, identifier))
    if datatype == 'gene':
        return redirect('{}/gene/{}'.format(referrer,identifier))
    elif datatype == 'transcript':
        return redirect('{}/transcript/{}'.format(referrer,identifier))
    elif datatype == 'variant':
        return redirect('{}/variant/{}'.format(referrer,identifier))
    elif datatype == 'region':
        return redirect('{}/region/{}'.format(referrer,identifier))
    elif datatype == 'dbsnp_variant_set':
        return redirect('{}/dbsnp/{}'.format(referrer,identifier))
    elif datatype == 'hpo':
        return redirect('{}/hpo/{}'.format(referrer,identifier))
    elif datatype == 'mim':
        return redirect('{}/mim/{}'.format(referrer,identifier))
    elif datatype == 'individual':
        return redirect('{}/individual/{}'.format(referrer,identifier))
    elif datatype == 'error':
        return redirect('{}/error/{}'.format(referrer,identifier))
    elif datatype == 'not_found':
        return redirect('{}/not_found/{}'.format(referrer,identifier))
    else:
        raise Exception


@app.route('/patient/<patient_str>')
def get_patient(patient_str):
    return patient_str

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

def generate_patient_table():
    def get_variants(variant_ids):
        for vid in db.variants.find({'variant_id':{'$in':variant_ids}}):
            yield 

'''
serve the Vincent annotated csv files
'''
@app.route('/download/send_csv', methods=['GET','POST'])
@requires_auth
def download_csv():
    p_id = request.args.get('p_id')
    if not lookup_patient(session['user'],p_id): return 'Sorry you are not permitted to see this patient, please get in touch with us to access this information.'
    folder = request.args.get('folder')
    path = DROPBOX
    csv_file = os.path.join(path,folder, p_id + '.csv')
    filename = folder+'_'+p_id+'.csv'
    if not os.path.isfile(csv_file):
        return 'Oops, file not found!'
    return send_file(csv_file,
                     mimetype='text/csv',
                     attachment_filename=filename,
                     as_attachment=True)

@app.route('/download', methods=['GET','POST'])
@requires_auth
def download():
    p_id = request.args.get('p_id')
    if not lookup_patient(session['user'],p_id): return 'Sorry you are not permitted to see this patient, please get in touch with us to access this information.'
    filetype = request.args.get('filetype')
    index = request.args.get('index')
    path=app.config[str(filetype)]
    print(path)
    if p_id:
        filename=os.path.join(path, p_id)
    else:
        filename=os.path.join(path)
    if filetype=='VCF_DIR':
        if index=='true':
            filename=os.path.join(path, p_id,'all.vcf.gz.tbi')
            attachment_filename=p_id+'.vcf.gz.tbi'
        else:
            filename=os.path.join(path, p_id,'all.vcf.gz')
            attachment_filename=p_id+'.vcf.gz'
    elif filetype=='BAM_DIR':
        if index=='true':
            filename=os.path.join(path, p_id+'_sorted_unique.bam.bai')
            attachment_filename=p_id+'.bam.bai'
        else:
            filename=os.path.join(path, p_id+'_sorted_unique.bam')
            attachment_filename=p_id+'.bam'
    elif filetype=='IRDC_VARIANT_FILES':
        filename=os.path.join(path)
        attachment_filename='IRDC_VARIANTS.zip'
    elif filetype=='IRDC_CNV_FILES':
        filename=os.path.join(path)
        attachment_filename='IRDC_CNV.zip'
    return send_file(filename, mimetype='*/*', attachment_filename=attachment_filename, as_attachment=True)


def encrypt(s):
    obj=DES.new(session['password'][:8], DES.MODE_ECB)
    s=s+(8-(len(s) % 8))*' '
    s=obj.encrypt(s)
    s=base64.urlsafe_b64encode(s)
    return s

def decrypt(s):
    obj=DES.new(session['password'][:8], DES.MODE_ECB)
    s=base64.urlsafe_b64decode(str(s))
    s=obj.decrypt(s)
    s=s.replace(' ','')
    return s

@app.route('/research_pubmed', methods=['POST'])
def research_pubmed():
    # use new search terms to update the individual-pubmedbatch table
    patient_id = request.form['p_id']
    search_term = request.form['OR']
    # update patient pubmed result status as running (1)
    db=get_db()
    db.patients.update({'external_id':patient_id},{'$set': {'pubmedbatch_status': 1}})
    # do the actual update
    exit_status = subprocess.call(['python','offline_analysis/pubmedScore/pubmedScore.py', '-p', patient_id, '--keywords', search_term])
    #exit_status=0
    # reset update status to 0
    db.patients.update({'external_id':patient_id},{'$set': {'pubmedbatch_status': 0}})
    return str(exit_status)

# AJAX
# fetch patients iwth hpo term
@app.route('/fetch_hpo',methods=['GET','POST'])
def fetch_hpo():
    if request.method=='POST':
        hpo_ids=request.form['hpo_ids'].strip().split(',')
    else:
        hpo_ids=request.args.get('hpo_ids').strip().split(',')
    hpo_id=hpo_ids[0]
    print('HPO',hpo_id)
    hpo_db=get_db(app.config['DB_NAME_HPO'])
    patients_db=get_db(app.config['DB_NAME_PATIENTS'])
    hpo_patients=[p['external_id'] for p in lookups.get_hpo_patients(hpo_db,patients_db,hpo_id)]
    print('num patients',len(hpo_patients))
    res=jsonify(result=hpo_patients)
    return res

# AJAX
# fetch variants private to patients
# That is variants which are only seen in these patients and no one else.
@app.route('/fetch_private_variants',methods=['GET','POST'])
def fetch_private_variants():
    if request.method=='POST':
        hpo_patients=request.form['patients'].strip().split(',')
    else:
        hpo_patients=request.args.get('patients').strip().split(',')
    print('hpo_patients',hpo_patients,)
    db=get_db()
    if len(hpo_patients)==1:
        variants=db.variants.find({'PRIVATE_MUT':hpo_patients})
    else:
        #rsession=get_R_session()
        variants=rsession.r.private_variants(hpo_patients)
        #variants=[]
        print('private variants', variants)
        if type(variants) is str:
            variants=[variants]
        else:
            variants=variants.tolist()
    print('num of private variants',len(variants),)
    res=jsonify(result=variants)
    return res

# AJAX
# fetch common variants to patients
# That is variants which are seen in all these patients.
@app.route('/fetch_common_variants',methods=['GET','POST'])
def fetch_common_variants():
    if request.method=='POST':
        hpo_patients=request.form['patients'].strip().split(',')
    else:
        hpo_patients=request.args.get('patients').strip().split(',')
    print('hpo_patients',hpo_patients,)
    #rsession=get_R_session()
    #variants=rsession.r.common_variants(hpo_patients)
    variants=[]
    print('common variants', variants)
    if type(variants) is str:
        variants=[variants]
    else:
        variants=variants.tolist()
    print('num of common variants',len(variants),)
    res=jsonify(result=variants)
    return res


# AJAX
# fetches variant record from db
@app.route('/fetch_variant',methods=['GET','POST'])
def fetch_variant():
    if request.method=='POST':
        variants=request.form['variants'].strip().split(',')
    else:
        variants=request.args.get('variants').strip().split(',')
    db=get_db()
    req_len=len(variants)
    variant_ids=map(lambda x: x.replace('_','-'),variants)
    variants=[v for v in db.variants.find({'variant_id':{'$in':variant_ids}}, projection={'_id': False})]
    ans_len=len(variants)
    print(req_len==ans_len)
    res=jsonify(result=variants)
    return res


# AJAX
# fetches information from db
@app.route('/variant_count',methods=['GET','POST'])
def variant_count():
    if request.method=='POST':
        external_id=request.form['external_id'].strip()
    else:
        external_id=request.args.get('external_id').strip()
    #rsession=get_R_session()
    #res=jsonify(result={'variant_count':rsession.eval('sum(as.logical(variants[["%s"]]))' % external_id) , 'external_id':external_id})
    #return res

# AJAX
# fetches information from db
@app.route('/private_variant_count',methods=['GET','POST'])
def private_variant_count():
    if request.method=='POST':
        external_id=request.form['external_id'].strip()
    else:
        external_id=request.args.get('external_id').strip()
    db=get_db(app.config['DB_NAME_PATIENTS'])
    p=db.patients.find_one({'external_id':external_id})
    if 'PRIVATE_MUT' not in p: private_variant_count=0
    else: private_variant_count=len(p['PRIVATE_MUT'])
    res=jsonify(result={'variant_count': private_variant_count, 'external_id':external_id})
    return res

@app.route('/Exomiser/<path:path>')
@requires_auth
def exomiser_page(path):
    #is this user authorized to see this patient?
    return send_from_directory('Exomiser', path)


@app.route('/about')
def about_page():
    db=get_db()
    patients_db=get_db(app.config['DB_NAME_PATIENTS']) 
    total_variants=db.variants.count()
    total_variants=db.variants.count()
    print('total_variants',total_variants,)
    total_patients=patients_db.patients.count()
    print('total_patients',total_patients,)
    male_patients=patients_db.patients.find( {'sex':'M'}).count()
    print('male_patients',male_patients,)
    female_patients=patients_db.patients.find( {'sex':'F'}).count()
    print('female_patients',female_patients,)
    unknown_patients=patients_db.patients.find( {'sex':'U'}).count()
    return jsonify('about.html',total_patients=total_patients)


@app.route('/participants')
def participants_page():
    return jsonify('about.html')


@app.route('/terms')
def terms_page():
    return jsonify('terms.html')


@app.route('/contact')
def contact_page():
    return jsonify('contact.html')


@app.route('/faq')
def faq_page():
    patients_db=get_db(app.config['DB_NAME_PATIENTS']) 
    total_patients=patients_db.patients.count()
    return jsonify(total_patients=total_patients)

@app.route('/samples')
def samples_page():
    samples=pandas.read_csv('HPO/hpo.txt')
    return jsonify(samples=samples.to_html(escape=False))


@app.route('/text')
def text_page():
    db = get_db()
    query = request.args.get('text')
    datatype, identifier = get_awesomebar_result(db, query)
    if datatype in ['gene', 'transcript']:
        gene = lookups.get_gene(db, identifier)
        link = "http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg19&position=chr%(chrom)s%%3A%(start)s-%(stop)s" % gene
        output = '''Searched for %s. Found %s.
%s; Canonical: %s.
%s''' % (query, identifier, gene['full_gene_name'], gene['canonical_transcript'], link)
        output += '' if 'omim_accession' not in gene else '''
In OMIM: %(omim_description)s
http://omim.org/entry/%(omim_accession)s''' % gene
        return output
    elif datatype == 'error' or datatype == 'not_found':
        return "Gene/transcript %s not found" % query
    else:
        return "Search types other than gene transcript not yet supported"


@app.after_request
def apply_caching(response):
    response.headers['Cache-Control'] = 'no-cache'
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    # prevent click-jacking vulnerability identified by BITs
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    return response

### all the mongodb reading/writing code


"""
Get the most recent common ancestor between two sets of hpo terms.
"""
def mrc_hpo():
    hpo_graph=get_hpo_graph()
    db=get_db()
    for var in db.variants.find():
        hpo_anc=[]
        for eid in list(set(var['HET']+var['HOM'])):
            patient=db.patients.find_one({'external_id':eid})
            if not patient: continue
            if 'features' not in patient: continue
            for f in patient['features']:
                fid=f['id']
                if not fid.startswith('HP'): continue
                hpo_anc.append(set(hpo_graph.get_ancestors(fid)))
        if not hpo_anc: continue
        if 'SYMBOL' not in var: continue
        var['ALL_HPO']=list(set(set.union(*hpo_anc)))
        var['SHARED_HPO']=list(set.intersection(*hpo_anc))
        print(var['VARIANT_ID'],var['SYMBOL'],len(var['HET']+var['HOM']),var['SHARED_HPO'],var['ALL_HPO'])
        db.variants.update({'VARIANT_ID':var['VARIANT_ID']},var,upsert=True)


#progressbar
'''
{
    'random_p_id':{
        'total':456,
        'count':123,
        'status':['running','done']
    },
    ...
}
'''
PROGRESS_BAR = {}

'''
initiate a progress instance
arg: total length of genes
return: progress_id
'''

def init_progress_bar(id,length):
    # check id
    if id in PROGRESS_BAR:
        if PROGRESS_BAR[id]['status'] != 'done':
            return 'the id already exists in PROGRESS_BAR'

    # initialise progress_bar
    PROGRESS_BAR[id] = {
            'total': length,
            'count':0,
            'message': '',
            'status':'running'
    }
    return 0

'''
update progress
arg: {
    id: id, 
    message: message,
    step: 1
    }
default step 1
'''


'''
to check if an iterable is empty
'''
def peek(iterable):
    try:
        first = next(iterable)
    except RuntimeError:
        return None
    except StopIteration:
        return None
    return first, itertools.chain([first], iterable)

@app.route('/search', methods=['GET','POST'])
@requires_auth
def search():
    db=get_db()
    patients_db=get_db(app.config['DB_NAME_PATIENTS']) 
    total_variants=db.variants.count()
    print('total_variants',total_variants,)
    total_patients=patients_db.patients.count()
    print('total_patients',total_patients,)
    male_patients=patients_db.patients.find( {'sex':'M'}).count()
    print('male_patients',male_patients,)
    female_patients=patients_db.patients.find( {'sex':'F'}).count()
    print('female_patients',female_patients,)
    unknown_patients=patients_db.patients.find( {'sex':'U'}).count()
    hpo_json={}
    exac_variants=0
    print('exac_variants',exac_variants,)
    pass_variants=db.variants.find({'FILTER':'PASS'}).count()
    print('pass_variants',pass_variants,)
    pass_exac_variants=0
    print('pass_exac_variants',pass_exac_variants,)
    pass_exac_variants=0
    nonexac_variants=0
    pass_nonexac_variants=0
    nonpass_variants=(total_variants-pass_variants)
    nonpass_nonexac_variants=nonexac_variants-pass_nonexac_variants
    try:
        version_number = subprocess.check_output(['git', 'describe', '--exact-match'])
    except:
        version_number = None
    print('Version number is:-')
    print(version_number)
    return jsonify( title='home',
        total_patients=total_patients,
        male_patients=male_patients,
        female_patients=female_patients,
        unknown_patients=unknown_patients,
        hpo_json=json.dumps(hpo_json),
        total_variants=total_variants,
        exac_variants=exac_variants,
        pass_variants=pass_variants,
        nonpass_variants=nonpass_variants,
        pass_exac_variants=pass_exac_variants,
        pass_nonexac_variants=pass_nonexac_variants,
        #image=image.decode('utf8'))
        image="",
        version_number=version_number)


@app.route('/search', methods=['GET','POST'])
@requires_auth
def search():
    db=get_db()
    patients_db=get_db(app.config['DB_NAME_PATIENTS']) 
    total_variants=db.variants.count()
    print('total_variants',total_variants,)
    total_patients=patients_db.patients.count()
    print('total_patients',total_patients,)
    male_patients=patients_db.patients.find( {'sex':'M'}).count()
    print('male_patients',male_patients,)
    female_patients=patients_db.patients.find( {'sex':'F'}).count()
    print('female_patients',female_patients,)
    unknown_patients=patients_db.patients.find( {'sex':'U'}).count()
    hpo_json={}
    exac_variants=0
    print('exac_variants',exac_variants,)
    pass_variants=db.variants.find({'FILTER':'PASS'}).count()
    print('pass_variants',pass_variants,)
    pass_exac_variants=0
    print('pass_exac_variants',pass_exac_variants,)
    pass_exac_variants=0
    nonexac_variants=0
    pass_nonexac_variants=0
    nonpass_variants=(total_variants-pass_variants)
    nonpass_nonexac_variants=nonexac_variants-pass_nonexac_variants
    try:
        version_number = subprocess.check_output(['git', 'describe', '--exact-match'])
    except:
        version_number = None
    print('Version number is:-')
    print(version_number)
    return jsonify( title='home',
        total_patients=total_patients,
        male_patients=male_patients,
        female_patients=female_patients,
        unknown_patients=unknown_patients,
        hpo_json=json.dumps(hpo_json),
        total_variants=total_variants,
        exac_variants=exac_variants,
        pass_variants=pass_variants,
        nonpass_variants=nonpass_variants,
        pass_exac_variants=pass_exac_variants,
        pass_nonexac_variants=pass_nonexac_variants,
        #image=image.decode('utf8'))
        image="",
        version_number=version_number)



import views.my_patients
import views.gene
import views.variant
import views.individual
import views.hpo
import views.search
import views.users



