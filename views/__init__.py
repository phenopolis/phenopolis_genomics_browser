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
from flask import Flask, session, current_app, g, Response, request, redirect, jsonify
from flask_sessionstore import Session, SqlAlchemySessionInterface
from flask_compress import Compress
from flask_caching import Cache
from flask_mail import Mail, Message
from passlib.hash import argon2
from werkzeug.exceptions import HTTPException
from flask_sqlalchemy import SQLAlchemy
import pysam
from db import *

# Load default config and override config from an environment variable
application = Flask(__name__)

logging.getLogger().addHandler(logging.StreamHandler())
logging.getLogger().setLevel(logging.INFO)

db_host = os.getenv('DB_HOST', '0.0.0.0')
db_name = os.getenv('DB_DATABASE', 'phenopolis_db')
db_user = os.getenv('DB_USER', 'phenopolis_api')
db_password = os.getenv('DB_PASSWORD', 'phenopolis_api')
db_port = os.getenv('DB_PORT', 5432)

mail_use_tls = os.getenv('MAIL_USE_TLS', 'true')
mail_use_ssl = os.getenv('MAIL_USE_SSL', 'false')
mail_suppress_send = os.getenv('MAIL_SUPPRESS_SEND', 'true')

application.config['SERVED_URL'] = os.getenv('SERVED_URL', '127.0.0.1')

application.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
application.config['MAIL_PORT'] = os.getenv('MAIL_PORT', '587')
application.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME', 'no-reply@phenopolis.org')
application.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD', 'get_password')
application.config['MAIL_USE_TLS'] = mail_use_tls == 'true'
application.config['MAIL_USE_SSL'] = mail_use_ssl == 'true'
application.config['MAIL_SUPPRESS_SEND'] = mail_suppress_send == 'true'

application.config['DB_HOST'] = os.getenv('POSTGRES_HOST', '0.0.0.0')
application.config['DB_DATABASE'] = os.getenv('POSTGRES_DB', 'phenopolis_db')
application.config['DB_USER'] = os.getenv('POSTGRES_USER', 'phenopolis_api')
application.config['DB_PASSWORD'] = os.getenv('POSTGRES_PASSWORD', 'phenopolis_api')
application.config['DB_PORT'] = os.getenv('POSTGRES_PORT', '5432')

application.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
db_uri = 'postgresql+psycopg2://%s:%s@%s/%s' % (application.config['DB_USER'],
                                                application.config['DB_PASSWORD'],
                                                application.config['DB_HOST'],
                                                application.config['DB_DATABASE'])
application.config['SQLALCHEMY_DATABASE_URI'] = db_uri

SESSION_COOKIE_NAME = 'phenopolis_api'
SESSION_TYPE = 'sqlalchemy'
SESSION_SQLALCHEMY = create_engine(application.config['SQLALCHEMY_DATABASE_URI'], echo = True)

db = SQLAlchemy(application)
db.init_app(application)

application.session_interface = SqlAlchemySessionInterface(application, db, "test_sessions", "test_sess_")
application.permanent_session_lifetime = datetime.timedelta(hours = 1)

Compress(application)
cache = Cache(application, config={'CACHE_TYPE': 'simple'})
mail = Mail(application)

# These imports must be placed at the end of this file
# pylint: disable=wrong-import-position
import views.general  # @IgnorePep8
import views.postgres  # @IgnorePep8
import views.auth  # @IgnorePep8
import views.statistics  # @IgnorePep8
import views.gene  # @IgnorePep8
import views.variant  # @IgnorePep8
import views.individual  # @IgnorePep8
import views.hpo  # @IgnorePep8
import views.users  # @IgnorePep8
import views.autocomplete  # @IgnorePep8
import views.save_configuration  # @IgnorePep8
