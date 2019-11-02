
#flask import
from flask import Flask
from flask import session
from flask_session import Session
from flask import current_app, g
from flask import Response
from flask import request
from flask import redirect
from flask import jsonify
from flask_compress import Compress
from flask_caching import Cache
import json
import os
import logging
from collections import defaultdict, Counter, OrderedDict
from functools import wraps 
import time
import datetime
from passlib.hash import argon2
import re
import itertools
import pysam
from time import strftime
from werkzeug.exceptions import HTTPException

import psycopg2

from logging.handlers import RotatingFileHandler

import traceback
logging.getLogger().addHandler(logging.StreamHandler())
logging.getLogger().setLevel(logging.INFO)

# Load default config and override config from an environment variable
application = Flask(__name__)

Compress(application)
#app.config['COMPRESS_DEBUG'] = True
#cache = SimpleCache(default_timeout=70*60*24)
cache = Cache(application,config={'CACHE_TYPE': 'simple'})

# Check Configuration section for more details
#SESSION_TYPE = 'redis'
#SESSION_TYPE='memcached'
#SESSION_TYPE = 'mongodb'
SESSION_TYPE='filesystem'
SESSION_FILE_DIR='/tmp/sessions'

if not os.path.exists(SESSION_FILE_DIR):
    os.mkdir(SESSION_FILE_DIR)

application.config.from_object(__name__)
sess=Session()
sess.init_app(application)

def get_db():
    if 'db' not in g:
        g.db = psycopg2.connect(host=os.environ['DB_HOST'],
                        database=os.environ['DB_DATABASE'],
                        user=os.environ['DB_USER'],
                        password=os.environ['DB_PASSWORD'])
    return g.db


def close_db():
    db = g.pop('db', None)
    if db is not None:
        db.close()

def postgres_cursor():
   cursor = get_db().cursor()
   return (cursor)

@application.after_request
def after_request(response):
    timestamp = strftime('[%Y-%b-%d %H:%M]')
    logging.error('%s %s %s %s %s %s', timestamp, request.remote_addr, request.method, request.scheme, request.full_path, response.status)
    return response

@application.errorhandler(Exception)
def exceptions(e):
    tb = traceback.format_exc()
    timestamp = strftime('[%Y-%b-%d %H:%M]')
    logging.error('%s %s %s %s %s 5xx INTERNAL SERVER ERROR\n%s', timestamp, request.remote_addr, request.method, request.scheme, request.full_path, tb)
    code = 500
    if isinstance(e, HTTPException):
       code = e.code
    return jsonify(error='error', code=code)

@application.route('/phenopolis_statistics')
def phenopolis_statistics():
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
# need to figure out how to encode json data type in postgres import
# rather do the conversion on the fly
def process_for_display(data):
   c=postgres_cursor()
   c.execute("select internal_id from users_individuals ui where ui.user='%s'"%session['user'])
   my_patients=[pid for pid, in c.fetchall()]
   for x2 in data:
       if 'CHROM' in x2 and 'POS' in x2 and 'REF' in x2 and 'ALT' in x2:
           variant_id='%s-%s-%s-%s' % (x2['CHROM'], x2['POS'], x2['REF'], x2['ALT'],)
           x2['variant_id']=[{'end_href':variant_id,'display':variant_id[:60]}]
       if 'gene_symbol' in x2:
           x2['gene_symbol']=[{'display':x3} for x3 in x2['gene_symbol'].split(',') if x3]
       if 'HET' in x2:
           x2['HET']=[{'display':'my:'+x3,'end_href':x3} if x3 in my_patients else {'display':x3,'end_href':x3} for x3 in json.loads(x2['HET']) ]
       if 'HOM' in x2:
           x2['HOM']=[{'display':'my:'+x3,'end_href':x3} if x3 in my_patients else {'display':x3,'end_href':x3} for x3 in json.loads(x2['HOM']) ]
       if 'hpo_ancestors' in x2:
           x2['hpo_ancestors']=[{'display':x3} for x3 in x2['hpo_ancestors'].split(';') if x3]


def check_auth(username, password):
    """
    This function is called to check if a username / password combination is valid.
    """
    c=postgres_cursor()
    c.execute("select * from users u where u.user='%s'"%username)
    user=[ dict(zip( [h[0] for h in c.description] ,r)) for r in c.fetchall() ]
    print(user)
    print(password)
    print(argon2.hash(password))
    print(user[0]['argon_password'])
    print(argon2.verify(password, user[0]['argon_password']))
    if len(user)==0: return False
    return argon2.verify(password, user[0]['argon_password'])


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
             session['user']=username
             return f(*args, **kwargs)
        print('Not Logged In - Redirect to home to login')
        return jsonify(error='Unauthenticated'), 401
    return decorated


@application.before_request
def make_session_timeout():
    print('session timeout')
    session.permanent = True
    application.permanent_session_lifetime = datetime.timedelta(hours=2)
    #app.permanent_session_lifetime = datetime.timedelta(seconds=2)

# 
@application.route('/<language>/login', methods=['POST'])
@application.route('/login', methods=['POST'])
def login(language='en'):
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
        return jsonify(success="Authenticated", username=username), 200

# 
@application.route('/<language>/logout', methods=['POST'])
@application.route('/logout', methods=['POST'])
def logout(language='en'):
    print('DELETE SESSION')
    session.pop('user',None)
    return jsonify(success='logged out'), 200


@application.route('/is_logged_in')
@requires_auth
def is_logged_in():
    return jsonify(username=session['user']), 200

@application.after_request
def apply_caching(response):
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



