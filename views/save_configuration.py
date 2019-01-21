from views import *
from lookups import *

@app.route('/save_configuration/<pageType>/<pagePart>', methods=['POST'])
@requires_auth
def save_configuration(pageType,pagePart):
    if pageType=='my_patients': pageType='hpo'
    with open(app.config['USER_CONFIGURATION'].format(session['user'],pageType),'r+') as config_file:
        x=json.loads(config_file.read())
        for col in x[0][pagePart]['colNames']:
            if col['key'] in request.form.getlist('colNames[]'):
                print col['key'], True
                col['default']=True
            else:
                print col['key'], False
                col['default']=False
        config_file.seek(0)
        json.dump(x,config_file)
        config_file.truncate()
    return jsonify(success=''), 200


