from flask import session
from views.postgres import postgres_cursor


def query_user_config(language, entity):
    cursor = postgres_cursor()
    cursor.execute(
        "select config from user_config u where u.user_name='%s' and u.language='%s' and u.page='%s' limit 1" % (
            session['user'], language, entity))
    config = cursor.fetchone()[0]
    cursor.close()
    return config


def cursor2dict(cursor):
    headers = [h[0] for h in cursor.description]
    return [dict(zip(headers, r)) for r in cursor.fetchall()]


def cursor2one_dict(cursor):
    headers = [h[0] for h in cursor.description]
    return dict(zip(headers, cursor.fetchone()))
