from views import *
from views.auth import requires_auth
from views.postgres import postgres_cursor, get_db

@application.route('/<language>/save_configuration/<pageType>/<pagePart>', methods=['POST'])
@application.route('/save_configuration/<pageType>/<pagePart>', methods=['POST'])
@requires_auth
def save_configuration(pageType,pagePart,language='en'):
    c=postgres_cursor()
    c.execute("select config from user_config u where u.user_name='%s' and u.language='%s' and u.page='%s' limit 1" % (session['user'], language, pageType))
    application.logger.debug(pageType)
    application.logger.debug(pagePart)
    if pageType=='my_patients': pageType='hpo'
    x=c.fetchone()[0]
    application.logger.debug(x)
    for col in x[0][pagePart]['colNames']:
        if col['key'] in request.form.getlist('colNames[]'):
            application.logger.debug(col['key'], True)
            col['default']=True
        else:
            application.logger.debug(col['key'], False)
            col['default']=False
    try:
        c.execute("UPDATE user_config SET config=%s WHERE user_name=%s AND language=%s AND page=%s",(json.dumps(x),session['user'],language,pageType))
        get_db().commit()
        c.close()
    except (Exception, psycopg2.DatabaseError) as error:
        application.logger.exception(error)
        get_db().rollback()
        return jsonify('save configuration failed'), 500
    finally:
        c.close()
    return jsonify(success=''), 200


