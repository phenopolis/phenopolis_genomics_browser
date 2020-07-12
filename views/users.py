from views import *
from views.auth import requires_auth, check_auth
from views.postgres import postgres_cursor

@application.route('/change_password', methods=['POST'])
@requires_auth
def change_password():
    username=session['user']
    password = request.form['current_password']
    new_password_1 = request.form['new_password_1']
    if username == 'demo': 
        return jsonify(error='You do not have permission to change the password for username \'demo\'.'), 403
    elif not check_auth(username,password):
        application.logger.info('Change password:- Login Failed')
        return jsonify(error='Username and current password incorrect. Please try again.'), 401
    else:
        application.logger.info('Login success, changing password')
        argon_password = argon2.hash(new_password_1)
        c=postgres_cursor()
        c.execute(""" update users set argon_password='%s' where user='%s' """%(argon_password, session['user'],))
        msg = 'Password for username \''+username+'\' changed. You are logged in as \''+username+'\'.' 
        return jsonify(success=msg), 200


