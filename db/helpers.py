from flask import session
from sqlalchemy import and_
from sqlalchemy.orm import Session

from db.model import UserConfig
from views.postgres import postgres_cursor


def query_user_config(db_session: Session, language, entity):

    user_config = (
        db_session.query(UserConfig)
        .filter(
            and_(UserConfig.user_name == session["user"], UserConfig.language == language, UserConfig.page == entity)
        )
        .first()
    )
    return user_config.config


# TODO: get rid of this method!
def legacy_query_user_config(language, entity):
    cursor = postgres_cursor()
    cursor.execute(
        "select config from user_config u where u.user_name=%(user)s and u.language=%(language)s and "
        "u.page=%(entity)s limit 1",
        {"user": session["user"], "language": language, "entity": entity},
    )
    config = cursor.fetchone()[0]
    cursor.close()
    return config


def cursor2dict(cursor):
    headers = [h[0] for h in cursor.description]
    return [dict(zip(headers, r)) for r in cursor.fetchall()]
