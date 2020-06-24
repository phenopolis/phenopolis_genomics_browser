'''
Package to init views
'''
import json
import os
import re
import itertools
import datetime
import traceback
from functools import wraps
from collections import defaultdict, Counter, OrderedDict
import logging
from logging.handlers import SMTPHandler, RotatingFileHandler
from time import strftime
import psycopg2
# flask import
from flask import Flask, session, current_app, g, Response, request, redirect, jsonify
from flask_sessionstore import Session, SqlAlchemySessionInterface
# from flask_session import SqlAlchemySessionInterface
from flask_compress import Compress
from flask_caching import Cache
from flask_mail import Mail
from flask_mail import Message
from passlib.hash import argon2
from werkzeug.exceptions import HTTPException
from flask_sqlalchemy import SQLAlchemy
# from FlaskSQLAlchemySession import set_db_session_interface
import pysam
from db import *

# Load default config and override config from an environment variable
application = Flask(__name__)
application.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
# application.secret_key=os.urandom(24)

mail_handler = SMTPHandler(mailhost=(os.environ['MAIL_SERVER'], os.environ['MAIL_PORT']), fromaddr='no-reply@phenopolis.org', toaddrs=['nikolas.pontikos@phenopolis.org', 'ismail.moghul@phenopolis.org'], subject='Phenopolis Error', credentials=(os.environ['MAIL_USERNAME'], os.environ['MAIL_PASSWORD']))
mail_handler.setLevel(logging.ERROR)
application.logger.addHandler(mail_handler)

logging.getLogger().addHandler(logging.StreamHandler())
logging.getLogger().setLevel(logging.INFO)

Compress(application)
# app.config['COMPRESS_DEBUG'] = True
# cache = SimpleCache(default_timeout=70*60*24)
cache = Cache(application, config={'CACHE_TYPE': 'simple'})

# Check Configuration section for more details
host = os.environ['DB_HOST']
database = os.environ['DB_DATABASE']
user = os.environ['DB_USER']
apassword = os.environ['DB_PASSWORD']
port = os.environ['DB_PORT']

application.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://%s:%s@%s/%s' % (user, apassword, host, database,)
SESSION_COOKIE_NAME = 'phenopolis_api'
SESSION_TYPE = 'sqlalchemy'
SESSION_SQLALCHEMY = create_engine(application.config['SQLALCHEMY_DATABASE_URI'], echo=True)
# SESSION_SQLALCHEMY_TABLE='session'
db = SQLAlchemy(application)
db.init_app(application)
application.session_interface = SqlAlchemySessionInterface(application, db, "test_sessions", "test_sess_")
# set_db_session_interface(application, data_serializer=json)
# db.create_all()
application.permanent_session_lifetime = datetime.timedelta(hours=1)
# sess=Session(application)
# sess.init_app(application)

# print(dir(db))

mail = Mail(application)
application.config['MAIL_SERVER'] = os.environ['MAIL_SERVER']
application.config['MAIL_PORT'] = os.environ['MAIL_PORT']
application.config['MAIL_USERNAME'] = os.environ['MAIL_USERNAME']
application.config['MAIL_PASSWORD'] = os.environ['MAIL_PASSWORD']
application.config['MAIL_USE_TLS'] = os.environ['MAIL_USE_TLS'] == 'true'
application.config['MAIL_USE_SSL'] = os.environ['MAIL_USE_SSL'] == 'true'
mail = Mail(application)


def get_db():
    '''
    Get DB
    '''
    if 'db' not in g:
        g.db = psycopg2.connect(host=os.environ['DB_HOST'],
                                database=os.environ['DB_DATABASE'],
                                user=os.environ['DB_USER'],
                                password=os.environ['DB_PASSWORD'])
    return g.db


def get_db_session():
    """
    Opens a new database connection if there is none yet for the
    current application context.
    """
    if not hasattr(g, 'dbsession'):
        # ahost = os.environ['DB_HOST']
        # adatabase = os.environ['DB_DATABASE']
        # auser = os.environ['DB_USER']
        # apassword = os.environ['DB_PASSWORD']
        # aport = os.environ['DB_PORT']
        engine = create_engine(application.config['SQLALCHEMY_DATABASE_URI'], echo=True)
        engine.connect()
        DbSession = sessionmaker(bind=engine)
        DbSession.configure(bind=engine)
        g.dbsession = DbSession()
    return g.dbsession


def close_db():
    '''
    Close DB
    '''
    adb = g.pop('db', None)
    if adb is not None:
        adb.close()


def postgres_cursor():
    '''
    Postgres cursor
    '''
    cursor = get_db().cursor()
    return cursor


@application.after_request
def after_request(response):
    '''
    After request
    :param response:
    '''
    timestamp = strftime('[%Y-%b-%d %H:%M]')
    logging.error('%s %s %s %s %s %s', timestamp, request.remote_addr, request.method, request.scheme, request.full_path, response.status)
    # msg = Message('error', sender="no-reply@phenopolis.org", recipients=["no-reply@phenopolis.org"])
    # mail.send(msg)
    return response

@application.errorhandler(Exception)
def exceptions(e):
    '''
    Exceptions
    :param e:
    '''
    tb = traceback.format_exc()
    timestamp = strftime('[%Y-%b-%d %H:%M]')
    logging.error('%s %s %s %s %s 5xx INTERNAL SERVER ERROR\n%s', timestamp, request.remote_addr, request.method, request.scheme, request.full_path, tb)
    code = 500
    if isinstance(e, HTTPException):
        code = e.code
    msg = Message('internal error ' + request.full_path + ' from ' + request.remote_addr, sender="no-reply@phenopolis.org", recipients=["no-reply@phenopolis.org"])
    msg.body = tb
    if code != 404:
        mail.send(msg)

    # start with the correct headers and status code from the error
    response = e.get_response()
    # replace the body with JSON
    response.data = json.dumps({
        "code": e.code,
        "name": e.name,
        "description": e.description,
        "remote_addr": request.remote_addr,
        "method": request.method,
        "scheme": request.scheme,
        "full_path": request.full_path,
        "timestamp": timestamp
    })
    response.content_type = "application/json"
    return response

@application.route('/statistics')
def phenopolis_statistics():
    '''
    Stats
    '''
    # total_patients=get_db_session().query(Individual).count()
    total_patients = 8000
    # male_patients=get_db_session().query(Individual).filter(Individual.sex=='M').count()
    male_patients = 3000
    # female_patients=get_db_session().query(Individual).filter(Individual.sex=='F').count()
    female_patients = 4000
    # unknown_patients=get_db_session().query(Individual).filter(Individual.sex=='U').count()
    unknown_patients = 1000
    # total_variants=get_db_session().query(Variant).count()
    total_variants = 8000000
    exac_variants = 0
    # pass_variants=get_db_session().query(Variant).filter(Variant.FILTER=='PASS').count()
    pass_variants = 700000
    # nonpass_variants=get_db_session().query(Variant).filter(Variant.FILTER!='PASS').count()
    nonpass_variants = 100000
#     pass_exac_variants = 0
#     pass_nonexac_variants = 0
    return jsonify(exomes="{:,}".format(total_patients),
                   males="{:,}".format(male_patients),
                   females="{:,}".format(female_patients),
                   unknowns="{:,}".format(unknown_patients),
                   total_variants="{:,}".format(total_variants),
                   exac_variants="{:,}".format(exac_variants),
                   pass_variants="{:,}".format(pass_variants),
                   nonpass_variants="{:,}".format(nonpass_variants),
                   # image=image.decode('utf8'))
                   version_number=0)


# this should not be done live but offline
# need to figure out how to encode json data type in postgres import
# rather do the conversion on the fly
def process_for_display(data):
    '''
    Process for display
    :param data:
    '''
    my_patients = [x for x in get_db_session().query(User_Individual).filter(User_Individual.user == session['user']).with_entities(User_Individual.internal_id)]
    for x2 in data:
        if 'CHROM' in x2 and 'POS' in x2 and 'REF' in x2 and 'ALT' in x2:
            variant_id = '%s-%s-%s-%s' % (x2['CHROM'], x2['POS'], x2['REF'], x2['ALT'],)
            x2['variant_id'] = [{'end_href': variant_id, 'display': variant_id[:60]}]
        if 'gene_symbol' in x2:
            x2['gene_symbol'] = [{'display': x3} for x3 in x2['gene_symbol'].split(',') if x3]
        if 'HET' in x2:
            x2['HET'] = [{'display': 'my:' + x3, 'end_href': x3} if x3 in my_patients else {'display': x3, 'end_href': x3} for x3 in json.loads(x2['HET'])]
        if 'HOM' in x2:
            x2['HOM'] = [{'display': 'my:' + x3, 'end_href': x3} if x3 in my_patients else {'display': x3, 'end_href': x3} for x3 in json.loads(x2['HOM'])]
        if 'hpo_ancestors' in x2:
            x2['hpo_ancestors'] = [{'display': x3} for x3 in x2['hpo_ancestors'].split(';') if x3]


def check_auth(username, password):
    """
    This function is called to check if a username / password combination is valid.
    """
    data = get_db_session().query(User).filter(User.user == username)
    auser = [p.as_dict() for p in data]
    if not auser:
        return False
    return argon2.verify(password, auser[0]['argon_password'])


def requires_auth(f):
    '''
    Requires autho
    :param f:
    '''

    @wraps(f)
    def decorated(*args, **kwargs):
        if session.get('user'):
            return f(*args, **kwargs)
        if request.method == 'POST':
            username = request.form['user']
            password = request.form['password']
            if check_auth(username, password):
                session['user'] = username
                # session.permanent = True
                return f(*args, **kwargs)
        return jsonify(error='Unauthenticated'), 401

    return decorated


#
@application.route('/<language>/login', methods=['POST'])
@application.route('/login', methods=['POST'])
def login():
    '''
    Login
    '''
    print(request.args)
    print('LOGIN form')
    print(request.form.keys())
    username = request.form['name']
    password = request.form['password']
    print(username)
    print(check_auth(username, password))
    if not check_auth(username, password):
        logging.error('Login failed')
        msg = Message("bad login " + username + " from " + request.remote_addr, sender="no-reply@phenopolis.org", recipients=["no-reply@phenopolis.org"])
        mail.send(msg)
        return jsonify(error='Invalid Credentials. Please try again.'), 401
    print('LOGIN SUCCESS')
    print(session)
    session['user'] = username
    # session.permanent=True
    print(dir(session))
    session.update()
    return jsonify(success="Authenticated", username=username), 200


#
@application.route('/<language>/logout', methods=['POST'])
@application.route('/logout', methods=['POST'])
@requires_auth
def logout():
    '''
    Logout
    '''
    print('DELETE SESSION')
    session.pop('user', None)
    return jsonify(success='logged out'), 200


@application.route('/is_logged_in')
@requires_auth
def is_logged_in():
    '''
    To log
    '''
    return jsonify(username=session.get('user', '')), 200


@application.route('/check_health')
def check_health():
    '''
    Check health
    '''
    return jsonify(health='ok'), 200


@application.after_request
def apply_caching(response):
    '''
    Apply caching
    :param response:
    '''
    response.headers['Cache-Control'] = 'no-cache'
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    # prevent click-jacking vulnerability identified by BITs
    # response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


# These imports must be placed at the end of this file
# pylint: disable=wrong-import-position
import views.gene  # @IgnorePep8
import views.variant  # @IgnorePep8
import views.individual  # @IgnorePep8
import views.hpo  # @IgnorePep8
import views.users  # @IgnorePep8
import views.autocomplete  # @IgnorePep8
import views.save_configuration  # @IgnorePep8
