from views import *

@application.route('/<language>/save_configuration/<pageType>/<pagePart>', methods=['POST'])
@application.route('/save_configuration/<pageType>/<pagePart>', methods=['POST'])
@requires_auth
def save_configuration(pageType,pagePart,language='en'):
    c=postgres_cursor()
    c.execute("select config from user_config u where u.user_name='%s' and u.language='%s' and u.page='%s' limit 1" % (session['user'], language, pageType))
    print(pageType)
    print(pagePart)
    if pageType=='my_patients': pageType='hpo'
    x=c.fetchone()[0]
    print(x)
    for col in x[0][pagePart]['colNames']:
        if col['key'] in request.form.getlist('colNames[]'):
            print(col['key'], True)
            col['default']=True
        else:
            print(col['key'], False)
            col['default']=False
    c.execute("UPDATE user_config SET config=%s WHERE user_name=%s AND language=%s AND page=%s",(json.dumps(x),session['user'],language,pageType))
    conn.commit()
    return jsonify(success=''), 200


