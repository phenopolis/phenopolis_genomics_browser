"""
Users view
"""
from flask import session, request, jsonify
from passlib.handlers.argon2 import argon2

from db import User, User_Individual, Individual
from views import application
from views.auth import requires_auth, check_auth
from views.exceptions import PhenopolisException
from views.helpers import _get_json_payload, _parse_payload
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
    c.execute("""update users set argon_password='%s' where user='%s' """ % (argon_password, session["user"],))
    msg = "Password for username '" + username + "' changed. You are logged in as '" + username + "'."
    return jsonify(success=msg), 200


@application.route("/user", methods=["POST"])
@requires_auth
def create_user():
    if session["user"] != "Admin":
        return jsonify(error="You do not have permission to create new users"), 403

    try:
        payload = _get_json_payload()
    except PhenopolisException as e:
        return jsonify(success=False, error=str(e)), 400

    # parse the JSON data into an individual, non existing fields will trigger a TypeError
    try:
        new_users = _parse_payload(payload, User)
    except TypeError as e:
        application.logger.error(str(e))
        return jsonify(success=False, error=str(e)), 400

    # checks individuals validity
    try:
        for u in new_users:
            _check_user_valid(u)
    except PhenopolisException as e:
        application.logger.error(str(e))
        return jsonify(success=False, error=str(e)), 400

    # encode password
    for u in new_users:
        u.argon_password = argon2.hash(u.argon_password)

    sqlalchemy_session = get_db_session()
    request_ok = True
    message = "Users were created"
    user_ids = ",".join([u.user for u in new_users])
    try:
        # insert users
        sqlalchemy_session.add_all(new_users)
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
        return jsonify(success=True, message=message, id=user_ids), 200


@application.route("/user-individual", methods=["POST"])
@requires_auth
def create_user_idividual():
    if session["user"] != "Admin":
        return jsonify(error="You do not have permission to give access to individuals to other users"), 403

    try:
        payload = _get_json_payload()
    except PhenopolisException as e:
        return jsonify(success=False, error=str(e)), 400

    # parse the JSON data into a user_individual, non existing fields will trigger a TypeError
    try:
        new_user_individuals = _parse_payload(payload, User_Individual)
    except TypeError as e:
        application.logger.error(str(e))
        return jsonify(success=False, error=str(e)), 400

    # checks user individuals validity
    try:
        for u in new_user_individuals:
            _check_user_individual_valid(u)
    except PhenopolisException as e:
        application.logger.error(str(e))
        return jsonify(success=False, error=str(e)), 400

    db_session = get_db_session()
    request_ok = True
    message = "User individuals were created"
    try:
        # insert user individuals
        for u in new_user_individuals:
            # TODO: should not all these checks happen at the DB?
            if db_session.query(User.user).filter(User.user.match(u.user)).count() != 1:
                raise PhenopolisException("Trying to add an entry in user_individual to a non existing user")
            if (
                db_session.query(Individual.internal_id).filter(Individual.internal_id.match(u.internal_id)).count()
                != 1
            ):
                raise PhenopolisException("Trying to add an entry in user_individual to a non existing individual")
            if (
                db_session.query(User_Individual)
                .filter(User_Individual.user.match(u.user))
                .filter(User_Individual.internal_id.match(u.internal_id))
                .count()
                > 0
            ):
                raise PhenopolisException("Trying to add an entry in user_individual that already exists")
            db_session.add(u)
        db_session.commit()
    except Exception as e:
        db_session.rollback()
        application.logger.exception(e)
        request_ok = False
        message = str(e)
    finally:
        db_session.close()

    if not request_ok:
        return jsonify(success=False, message=message), 500
    else:
        return jsonify(success=True, message=message), 200


def _check_user_valid(new_user: User):
    if new_user is None:
        raise PhenopolisException("Null user")
    if new_user.user is None or new_user.user == "":
        raise PhenopolisException("Missing user name")
    if new_user.argon_password is None or new_user.argon_password == "":
        raise PhenopolisException("Missing password")


def _check_user_individual_valid(new_user_individual: User_Individual):
    if new_user_individual is None:
        raise PhenopolisException("Null user individual")
    if new_user_individual.user is None or new_user_individual.user == "":
        raise PhenopolisException("Missing user")
    if new_user_individual.internal_id is None or new_user_individual.internal_id == "":
        raise PhenopolisException("Missing individual id")
