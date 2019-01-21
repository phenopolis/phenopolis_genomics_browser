
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
import itertools
import json
import os
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
import time 
from functools import wraps 
#from werkzeug.exceptions import default_exceptions, HTTPException 
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
import phizz

logging.getLogger().addHandler(logging.StreamHandler())
logging.getLogger().setLevel(logging.INFO)

# Load default config and override config from an environment variable
app = Flask(__name__)
app.config.from_pyfile('../local.cfg')

Compress(app)
#app.config['COMPRESS_DEBUG'] = True
#cache = SimpleCache(default_timeout=70*60*24)
cache = Cache(app,config={'CACHE_TYPE': 'simple'})

# Check Configuration section for more details
SESSION_TYPE='filesystem'
SESSION_TYPE='memcached'
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


@app.route('/phenopolis_statistics')
def phenopolis_statistics():
    try:
        version_number = subprocess.check_output(['git', 'describe', '--exact-match'])
    except:
        version_number = None
    print('Version number is:-')
    print(version_number)
    total_patients=6048
    male_patients=0
    female_patients=0
    unknown_patients=0
    exomes=0
    males=0
    females=0
    unknowns=0
    total_variants=4859971
    exac_variants=0
    pass_variants=0
    nonpass_variants=0
    pass_exac_variants=0
    pass_nonexac_variants=0
    return jsonify( exomes="{:,}".format(total_patients),
        males="{:,}".format(male_patients),
        females="{:,}".format(female_patients),
        unknowns="{:,}".format(unknown_patients),
        total_variants="{:,}".format(total_variants),
        exac_variants="{:,}".format(exac_variants),
        pass_variants="{:,}".format(pass_variants),
        nonpass_variants="{:,}".format(nonpass_variants),
        pass_exac_variants="{:,}".format(pass_exac_variants),
        pass_nonexac_variants="{:,}".format(pass_nonexac_variants),
        #image=image.decode('utf8'))
        version_number=version_number)


# this should not be done live but offline
# need to figure out how to encode json data type in sqlite import
# rather do the conversion on the fly
def process_for_display(data):
   for x2 in data:
       if 'gene_symbol' in x2:
           x2['gene_symbol']=[{'display':x3} for x3 in x2['gene_symbol'].split(',') if x3]
       if 'HET' in x2:
           x2['HET']=[{'display':x3} for x3 in json.loads(x2['HET'])]
       if 'HOM' in x2:
           x2['HOM']=[{'display':x3} for x3 in json.loads(x2['HOM'])]
       if 'hpo_ancestors' in x2:
           x2['hpo_ancestors']=[{'display':x3} for x3 in x2['hpo_ancestors'].split(';') if x3]


def check_auth(username, password):
    """
    This function is called to check if a username / password combination is valid.
    """
    argon_password=file(app.config['USER_PASS'].format(username),'r').read().strip()
    #c,fd,=sqlite3_ro_cursor(app.config['USERS_DB'])
    #c.execute('select * from users where user=?',(username,))
    #headers=[h[0] for h in c.description]
    #user=[dict(zip(headers,r)) for r in c.fetchall()]
    #print(user)
    #if len(user)==0: return False
    #return argon2.verify(password, user[0]['argon_password'])
    return argon2.verify(password, argon_password)


def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if session:
          print 'session'
          print session
          print session.keys()
          if 'user' in session: 
             print session['user']
             return f(*args, **kwargs)
        if request.method == 'POST':
          username=request.form['user']
          password=request.form['password']
          if check_auth(username,password):
             session['user']=username
             return f(*args, **kwargs)
        print('Not Logged In - Redirect to home to login')
        return jsonify(error='Unauthenticated'), 401
    return decorated


@app.before_request
def make_session_timeout():
    print('session timeout')
    session.permanent = True
    app.permanent_session_lifetime = datetime.timedelta(hours=2)
    #app.permanent_session_lifetime = datetime.timedelta(seconds=2)

# 
@app.route('/login', methods=['POST'])
def login():
    print(request.args)
    print('LOGIN form')
    print(request.form.keys())
    username=request.form['name']
    password=request.form['password']
    print(username)
    print(check_auth(username,password))
    if not check_auth(username,password):
       print('Login Failed')
       return jsonify(error='Invalid Credentials. Please try again.'), 401
    else:
        print('LOGIN SUCCESS')
        session['user']=username
        print session['user']
        print session
        return jsonify(success="Authenticated", username=username), 200

# 
@app.route('/logout', methods=['POST'])
def logout():
    print('DELETE SESSION')
    session.pop('user',None)
    return jsonify(success='logged out'), 200


@app.route('/is_logged_in')
@requires_auth
def is_logged_in():
    return jsonify(username=session['user']), 200

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

#@app.route('/patient/<patient_str>')
#def get_patient(patient_str): return patient_str
def generate_patient_table():
    def get_variants(variant_ids):
        for vid in db.variants.find({'variant_id':{'$in':variant_ids}}):
            yield 

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

@app.route('/Exomiser/<path:path>')
@requires_auth
def exomiser_page(path):
    #is this user authorized to see this patient?
    return send_from_directory('Exomiser', path)

@app.after_request
def apply_caching(response):
    print 'CACHE'
    response.headers['Cache-Control'] = 'no-cache'
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    # prevent click-jacking vulnerability identified by BITs
    #response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response



import views.gene
import views.variant
import views.individual
import views.hpo
import views.users
import views.autocomplete
import views.save_configuration



