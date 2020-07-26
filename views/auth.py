from functools import wraps

from flask import session, request, jsonify
from passlib.handlers.argon2 import argon2
from db import User
from views import *
from views.postgres import get_db_session


def check_auth(username, password):
    """
    This function is called to check if a username / password combination is valid.
    """
    data = get_db_session().query(User).filter(User.user == username)
    auser = [p.as_dict() for p in data]
    if not auser:
        return False
    return argon2.verify(password, auser[0]['argon_password'])


def requires_auth(f):
    '''
    Requires autho
    :param f:
    '''
    @wraps(f)
    def decorated(*args, **kwargs):
        if session.get('user'):
            return f(*args, **kwargs)
        if request.method == 'POST':
            username = request.form['user']
            password = request.form['password']
            if check_auth(username, password):
                session['user'] = username
                # session.permanent = True
                return f(*args, **kwargs)
        return jsonify(error='Unauthenticated'), 401

    return decorated


#
@application.route('/<language>/login', methods=['POST'])
@application.route('/login', methods=['POST'])
def login():
    '''
    Login
    '''
    username = request.form['name']
    password = request.form['password']
    if not check_auth(username, password):
        return jsonify(error='Invalid Credentials. Please try again.'), 401
    session['user'] = username
    session.update()
    return jsonify(success="Authenticated", username=username), 200


#
@application.route('/<language>/logout', methods=['POST'])
@application.route('/logout', methods=['POST'])
@requires_auth
def logout():
    '''
    Logout
    '''
    application.logger.info('Delete session')
    session.pop('user', None)
    return jsonify(success='logged out'), 200


@application.route('/is_logged_in')
@requires_auth
def is_logged_in():
    '''
    To log
    '''
    return jsonify(username=session.get('user', '')), 200
