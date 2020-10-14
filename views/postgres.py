"""
Postgres module
"""
import psycopg2
from flask import g
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from views import application, ENV_LOG_FLAG


def get_db():
    if "db" not in g:
        g.db = psycopg2.connect(
            host=application.config["DB_HOST"],
            database=application.config["DB_DATABASE"],
            user=application.config["DB_USER"],
            password=application.config["DB_PASSWORD"],
            port=application.config["DB_PORT"],
        )
    return g.db


def get_db_session() -> Session:
    """
    Opens a new database connection if there is none yet for the
    current application context.
    """
    if not hasattr(g, "dbsession"):
        engine = create_engine(application.config["SQLALCHEMY_DATABASE_URI"], echo=ENV_LOG_FLAG)
        engine.connect()
        DbSession = sessionmaker(bind=engine)
        DbSession.configure(bind=engine)
        g.dbsession = DbSession()
    return g.dbsession


def close_db():
    adb = g.pop("db", None)
    if adb is not None:
        adb.close()


def postgres_cursor():
    cursor = get_db().cursor()
    return cursor
