import psycopg2
from flask import request, jsonify, session

from views import *
from views.auth import requires_auth
from views.postgres import postgres_cursor, get_db
import db.helpers

import ujson as json


@application.route('/<language>/save_configuration/<pageType>/<pagePart>', methods=['POST'])
@application.route('/save_configuration/<pageType>/<pagePart>', methods=['POST'])
@requires_auth
def save_configuration(pageType, pagePart, language='en'):
    config = db.helpers.query_user_config(language=language, entity=pageType)
    application.logger.debug(pageType)
    application.logger.debug(pagePart)
    if pageType == 'my_patients':
        pageType = 'hpo'
    application.logger.debug(config)
    for col in config[0][pagePart]['colNames']:
        if col['key'] in request.form.getlist('colNames[]'):
            application.logger.debug(col['key'], True)
            col['default'] = True
        else:
            application.logger.debug(col['key'], False)
            col['default'] = False
    c = postgres_cursor()
    try:
        c.execute("UPDATE user_config SET config=%s WHERE user_name=%s AND language=%s AND page=%s",
                  (json.dumps(config), session['user'], language, pageType))
        get_db().commit()
        c.close()
    except (Exception, psycopg2.DatabaseError) as error:
        application.logger.exception(error)
        get_db().rollback()
        return jsonify('save configuration failed'), 500
    finally:
        c.close()
    return jsonify(success=''), 200
