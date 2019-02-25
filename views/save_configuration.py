from views import *
from lookups import *

@app.route('/<language>/save_configuration/<pageType>/<pagePart>', methods=['POST'])
@app.route('/save_configuration/<pageType>/<pagePart>', methods=['POST'])
@requires_auth
def save_configuration(pageType,pagePart,language='en'):
    print(pageType)
    print(pagePart)
    print(app.config['USER_CONFIGURATION'].format(session['user'],language,pageType))
    if pageType=='my_patients': pageType='hpo'
    with open(app.config['USER_CONFIGURATION'].format(session['user'],language,pageType),'r+') as config_file:
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


