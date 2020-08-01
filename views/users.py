"""
Users view
"""
from flask import session, request, jsonify
from passlib.handlers.argon2 import argon2

from db import User
from views import application
from views.auth import requires_auth, check_auth
from views.exceptions import PhenopolisException
from views.postgres import postgres_cursor, get_db_session


@application.route("/change_password", methods=["POST"])
@requires_auth
def change_password():
    username = session["user"]
    password = request.form["current_password"]
    new_password_1 = request.form["new_password_1"]
    if username == "demo":
        return (
            jsonify(error="You do not have permission to change the password for username 'demo'."),
            403,
        )
    if not check_auth(username, password):
        application.logger.info("Change password:- Login Failed")
        return (
            jsonify(error="Username and current password incorrect. Please try again."),
            401,
        )
    application.logger.info("Login success, changing password")
    argon_password = argon2.hash(new_password_1)
    c = postgres_cursor()
    c.execute(""" update users set argon_password='%s' where user='%s' """ % (argon_password, session["user"],))
    msg = "Password for username '" + username + "' changed. You are logged in as '" + username + "'."
    return jsonify(success=msg), 200


@application.route("/user", methods=["POST"])
@requires_auth
def create_user():
    if session["user"] != "Admin":
        return jsonify(error="You do not have permission to create new users"), 403

    if not request.is_json:
        return jsonify(success=False, error="Only mimetype application/json is accepted"), 400

    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify(success=False, error="Empty payload or wrong formatting"), 400
    application.logger.debug(payload)

    # parse the JSON data into an individual, non existing fields will trigger a TypeError
    try:
        new_user = User(**payload)
    except TypeError as e:
        application.logger.error(str(e))
        return jsonify(success=False, error=str(e)), 400

    # checks individuals validity
    try:
        _check_user_valid(new_user)
    except PhenopolisException as e:
        application.logger.error(str(e))
        return jsonify(success=False, error=str(e)), 400

    # encode password
    new_user.argon_password = argon2.hash(new_user.argon_password)

    sqlalchemy_session = get_db_session()
    request_ok = True
    message = "User was created"
    user_id = new_user.user
    try:
        # insert user
        sqlalchemy_session.add(new_user)
        sqlalchemy_session.commit()
    except Exception as e:
        sqlalchemy_session.rollback()
        application.logger.exception(e)
        request_ok = False
        message = str(e)
    finally:
        sqlalchemy_session.close()

    if not request_ok:
        return jsonify(success=False, message=message), 500
    else:
        return jsonify(success=True, message=message, id=user_id), 200


def _check_user_valid(new_user: User):
    if new_user is None:
        raise PhenopolisException("Null user")
    if new_user.user is None or new_user.user == "":
        raise PhenopolisException("Missing user name")
    if new_user.argon_password is None or new_user.argon_password == "":
        raise PhenopolisException("Missing password")
