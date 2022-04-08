"""
Package views
"""
import datetime
import logging
import os
from logging.config import dictConfig
from subprocess import PIPE, STDOUT, Popen

import psycopg2
from cyvcf2 import VCF
from flask import Flask
from flask.logging import default_handler
from flask_caching import Cache
from flask_compress import Compress
from flask_mail import Mail
from flask_sessionstore import SqlAlchemySessionInterface
from flask_sqlalchemy import SQLAlchemy

# Options are: prod, dev, debug (default)
APP_ENV = os.getenv("APP_ENV", "debug")

HG_ASSEMBLY = os.getenv("HG_ASSEMBLY", "GRCh37")

MAIL_USERNAME = os.getenv("MAIL_USERNAME", "no-reply@phenopolis.com")

MAX_PAGE_SIZE = 100000

VERSION = Popen("git describe --tags --always", shell=True, stderr=STDOUT, stdout=PIPE).communicate()[0][:-1].decode()
if "command not found" in VERSION:
    VERSION = "$Format:%H$"[:7]

ENV_LOG_FLAG = True
if APP_ENV in ["prod"]:
    ENV_LOG_FLAG = False

variant_file = VCF(os.getenv("VCF_FILE", "schema/small_demo.vcf.gz"))


def _configure_logs():
    application_environment = APP_ENV
    log_level = logging.DEBUG if application_environment == "debug" else logging.ERROR
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
                    "level": log_level,
                    "formatter": "default",
                    "class": "logging.handlers.RotatingFileHandler",
                    "filename": "phenopolis.log",
                    "mode": "a",
                    "maxBytes": 1048576,
                    "backupCount": 10,
                },
            },
            "root": {"level": log_level, "handlers": ["wsgi"]},
        }
    )
    # add SQLAlchemy logs
    logging.getLogger("sqlalchemy").addHandler(default_handler)


def _load_config():
    application.config["SERVED_URL"] = os.getenv("SERVED_URL", "127.0.0.1")
    application.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    application.config["MAIL_PORT"] = os.getenv("MAIL_PORT", "587")
    application.config["MAIL_USERNAME"] = MAIL_USERNAME
    application.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD", "get_password")
    application.config["MAIL_USE_TLS"] = os.getenv("MAIL_USE_TLS", "true") == "true"
    application.config["MAIL_USE_SSL"] = os.getenv("MAIL_USE_SSL", "false") == "true"
    application.config["MAIL_SUPPRESS_SEND"] = os.getenv("MAIL_SUPPRESS_SEND", "true") == "true"
    application.config["DB_HOST"] = os.getenv("PH_DB_HOST", "0.0.0.0")
    application.config["DB_DATABASE"] = os.getenv("PH_DB_NAME", "phenopolis_db")
    application.config["DB_USER"] = os.getenv("PH_DB_USER", "phenopolis_api")
    application.config["DB_PASSWORD"] = os.getenv("PH_DB_PASSWORD", "phenopolis_api")
    application.config["DB_PORT"] = os.getenv("PH_DB_PORT", "5432")
    application.config["SECRET_KEY"] = os.getenv("PH_SECRET_KEY", "my_precious")
    application.config["SECURITY_PASSWORD_SALT"] = os.getenv("PH_SECURITY_PASSWORD_SALT", "p4$$w0rd")
    application.config["TOKEN_EXPIRY_SECONDS"] = int(os.getenv("PH_TOKEN_EXPIRY_SECONDS", 172800))
    application.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = True
    db_uri = "postgresql+psycopg2://{}:{}@{}:{}/{}".format(
        application.config["DB_USER"],
        application.config["DB_PASSWORD"],
        application.config["DB_HOST"],
        application.config["DB_PORT"],
        application.config["DB_DATABASE"],
    )
    application.config["SQLALCHEMY_DATABASE_URI"] = db_uri


def _init_sqlalchemy():
    database = SQLAlchemy(application)
    database.init_app(application)
    application.session_interface = SqlAlchemySessionInterface(application, database, "test_sessions", "test_sess_")
    application.permanent_session_lifetime = datetime.timedelta(hours=1)


_configure_logs()  # NOTE: this needs to happen before starting the application
# Load default config and override config from an environment variable
application = Flask(__name__)
_load_config()
_init_sqlalchemy()

Compress(application)
cache = Cache(application, config={"CACHE_TYPE": "simple"})
mail = Mail(application)

try:
    db = psycopg2.connect(
        host=application.config["DB_HOST"],
        database=application.config["DB_DATABASE"],
        user=application.config["DB_USER"],
        password=application.config["DB_PASSWORD"],
        port=application.config["DB_PORT"],
    )
    c = db.cursor()
    c.execute("select external_id, internal_id from individuals")
    headers = [h[0] for h in c.description]

    pheno_ids = [dict(zip(headers, r)) for r in c.fetchall()]
    phenoid_mapping = {ind["external_id"]: ind["internal_id"] for ind in pheno_ids}
except Exception:
    phenoid_mapping = {}

# NOTE: These imports must be placed at the end of this file
# flake8: noqa E402
import views.auth
import views.autocomplete
import views.gene
import views.general
import views.hpo
import views.individual
import views.postgres
import views.save_configuration
import views.statistics
import views.upload
import views.user_individuals
import views.users
import views.variant
import views.variant_classification
