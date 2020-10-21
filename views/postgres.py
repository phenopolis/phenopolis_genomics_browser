"""
Postgres module
"""
import psycopg2
from flask import g
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker, Session
from views import application, ENV_LOG_FLAG
from contextlib import contextmanager


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


def close_db():
    adb = g.pop("db", None)
    if adb is not None:
        adb.close()


def postgres_cursor():
    cursor = get_db().cursor()
    return cursor


def get_db_engine() -> Engine:
    """
    Opens a new database connection if there is none yet for the
    current application context.
    """
    if not hasattr(g, "dbengine"):
        engine = create_engine(application.config["SQLALCHEMY_DATABASE_URI"], echo=ENV_LOG_FLAG)
        engine.connect()
        g.dbengine = engine
    return g.dbengine


@contextmanager
def session_scope() -> Session:
    """Provide a transactional scope around a series of operations."""
    engine = get_db_engine()
    # TODO: do we want to tweak the session pool config here?
    DbSession = sessionmaker(bind=engine)
    DbSession.configure(bind=engine)
    session = DbSession()
    try:
        yield session
        session.commit()
    except BaseException as e:
        session.rollback()
        raise e
    finally:
        session.close()
