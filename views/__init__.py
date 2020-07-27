"""
Package to init views
"""
import os
import re
import itertools
import datetime
import traceback
from functools import wraps
from collections import defaultdict, Counter, OrderedDict
import logging
from logging.handlers import SMTPHandler, RotatingFileHandler
from logging.config import dictConfig
from time import strftime
from flask import Flask, session, current_app, g, Response, request, redirect, jsonify
from flask.logging import default_handler
from flask_sessionstore import Session, SqlAlchemySessionInterface
from flask_compress import Compress
from flask_caching import Cache
from flask_mail import Mail, Message
from passlib.hash import argon2
from werkzeug.exceptions import HTTPException
from flask_sqlalchemy import SQLAlchemy
import psycopg2
import ujson as json
import pysam


def _configure_logs():
    dictConfig(
        {
            "version": 1,
            "formatters": {
                "default": {"format": "%(asctime)s-%(levelname)s-%(name)s::%(module)s|%(lineno)s:: %(message)s"}
            },
            "handlers": {
                "wsgi": {
                    "class": "logging.StreamHandler",
                    "stream": "ext://flask.logging.wsgi_errors_stream",
                    "formatter": "default",
                },
                "info_rotating_file_handler": {
                    "level": "INFO",
                    "formatter": "default",
                    "class": "logging.handlers.RotatingFileHandler",
                    "filename": "phenopolis.log",
                    "mode": "a",
                    "maxBytes": 1048576,
                    "backupCount": 10,
                },
            },
            "root": {"level": "INFO", "handlers": ["wsgi"]},
        }
    )
    # add SQLalchemy logs
    logging.getLogger("sqlalchemy").addHandler(default_handler)


def _load_config():
    application.config["SERVED_URL"] = os.getenv("SERVED_URL", "127.0.0.1")
    application.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    application.config["MAIL_PORT"] = os.getenv("MAIL_PORT", "587")
    application.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME", "no-reply@phenopolis.org")
    application.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD", "get_password")
    application.config["MAIL_USE_TLS"] = os.getenv("MAIL_USE_TLS", "true") == "true"
    application.config["MAIL_USE_SSL"] = os.getenv("MAIL_USE_SSL", "false") == "true"
    application.config["MAIL_SUPPRESS_SEND"] = os.getenv("MAIL_SUPPRESS_SEND", "true") == "true"
    application.config["DB_HOST"] = os.getenv("POSTGRES_HOST", "0.0.0.0")
    application.config["DB_DATABASE"] = os.getenv("POSTGRES_DB", "phenopolis_db")
    application.config["DB_USER"] = os.getenv("POSTGRES_USER", "phenopolis_api")
    application.config["DB_PASSWORD"] = os.getenv("POSTGRES_PASSWORD", "phenopolis_api")
    application.config["DB_PORT"] = os.getenv("POSTGRES_PORT", "5432")
    application.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = True
    db_uri = "postgresql+psycopg2://%s:%s@%s/%s" % (
        application.config["DB_USER"],
        application.config["DB_PASSWORD"],
        application.config["DB_HOST"],
        application.config["DB_DATABASE"],
    )
    application.config["SQLALCHEMY_DATABASE_URI"] = db_uri


def _init_sqlalchemy():
    database = SQLAlchemy(application)
    database.init_app(application)
    application.session_interface = SqlAlchemySessionInterface(application, database, "test_sessions", "test_sess_")
    application.permanent_session_lifetime = datetime.timedelta(hours=1)


def cursor2dict(cursor):
    headers = [h[0] for h in cursor.description]
    return [dict(zip(headers, r)) for r in cursor.fetchall()]


_configure_logs()  # NOTE: this needs to happen before starting the application
# Load default config and override config from an environment variable
application = Flask(__name__)
_load_config()
_init_sqlalchemy()

Compress(application)
cache = Cache(application, config={"CACHE_TYPE": "simple"})
mail = Mail(application)

# These imports must be placed at the end of this file
# flake8: noqa E402
import views.general
import views.postgres
import views.auth
import views.statistics
import views.gene
import views.variant
import views.individual
import views.hpo
import views.users
import views.autocomplete
import views.save_configuration
