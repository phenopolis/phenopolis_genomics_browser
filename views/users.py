from views import *
from lookups import *
from flask import request
import re
from utils import *
import itertools
import csv


@app.route('/register',methods=['POST'])
@requires_auth
def register():
    name=request.form.get('name').replace(' ','')
    affiliation=request.form.get('affiliation')
    email=request.form.get('email')
    groups=request.form.getlist('group[]')
    user=orm.User(user_db=get_db(app.config['DB_NAME_USERS']),user=name,groups=groups,email=email,affiliation=affiliation)
    print(user.json())
    print(user.status)
    return jsonify(message=user.status['message']), user.status['http_code']


# 
@app.route('/change_password', methods=['POST'])
@requires_auth
def change_password():
    username=session['user']
    password = request.form['current_password']
    new_password_1 = request.form['new_password_1']
    if username == 'demo': 
        return jsonify(error='You do not have permission to change the password for username \'demo\'.'), 403
    elif not check_auth(username,password):
        print('Change password:- Login Failed')
        return jsonify(error='Username and current password incorrect. Please try again.'), 401
    else:
        print('LOGIN SUCCESS, CHANGING PASSWORD')
        argon_password = argon2.hash(new_password_1)
        conn,c,=sqlite3_cursor(app.config['PHENOPOLIS_DB'])
        c.execute(""" update users set argon_password=? where user=? """, (argon_password, session['user'],))
        sqlite3_close(conn,c)
        msg = 'Password for username \''+username+'\' changed. You are logged in as \''+username+'\'.' 
        return jsonify(success=msg), 200


