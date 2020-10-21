"""
Users view
"""
from flask import session, jsonify
from passlib.handlers.argon2 import argon2
from db.model import User, UserIndividual, UserConfig
from views import application
from views.auth import requires_auth, check_auth, requires_admin, is_demo_user, USER, ADMIN_USER
from views.exceptions import PhenopolisException
from views.general import _parse_boolean_parameter
from views.helpers import _get_json_payload
from views.postgres import session_scope


@application.route("/user/change-password", methods=["POST"])
@requires_auth
def change_password():
    try:
        username = session[USER]
        data = _get_json_payload()
        password = data.get("current_password")
        new_password = data.get("new_password")
        if is_demo_user():
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

        with session_scope() as db_session:
            user = db_session.query(User).filter(User.user == username).first()
            user.argon_password = argon2.hash(new_password)
        msg = "Password for username '" + username + "' changed. You are logged in as '" + username + "'."
    except PhenopolisException as e:
        application.logger.error(str(e))
        return jsonify(success=False, error=str(e)), e.http_status

    return jsonify(success=msg), 200


@application.route("/user/<user_id>/enabled/<status>", methods=["PUT"])
@requires_admin
def enable_user(user_id, status):
    with session_scope() as db_session:
        try:
            if user_id == ADMIN_USER:
                raise PhenopolisException("Cannot change the status of Admin user!", 400)
            user = _get_user_by_id(db_session, user_id)
            user.enabled = _parse_boolean_parameter(status)
            enabled_flag = user.enabled
        except PhenopolisException as e:
            return jsonify(success=False, message=str(e)), e.http_status
    return jsonify(success=True, message="User enabled flag set to {}".format(enabled_flag)), 200


@application.route("/user", methods=["POST"])
@requires_admin
def create_user():
    try:
        new_users = _get_json_payload(User)
        for u in new_users:
            _check_user_valid(u)
    except PhenopolisException as e:
        application.logger.error(str(e))
        return jsonify(success=False, error=str(e)), e.http_status

    # encode password
    for u in new_users:
        u.argon_password = argon2.hash(u.argon_password)

    request_ok = True
    message = "Users were created"
    user_ids = ",".join([u.user for u in new_users])
    try:
        with session_scope() as db_session:
            # insert users
            db_session.add_all(new_users)
            _add_config_from_admin(db_session, new_users)
    except Exception as e:
        application.logger.exception(e)
        request_ok = False
        message = str(e)

    if not request_ok:
        return jsonify(success=False, message=message), 500
    else:
        return jsonify(success=True, message=message, id=user_ids), 200


@application.route("/user/<user_id>")
@requires_admin
def get_user(user_id):
    try:
        with session_scope() as db_session:
            user = _get_user_by_id(db_session, user_id)
            user_individuals = db_session.query(UserIndividual).filter(UserIndividual.user == user.user).all()
            user_dict = user.as_dict()
            # removes the password hash from the endpoint we don't want/need this around
            del user_dict["argon_password"]
            user_dict["individuals"] = [ui.internal_id for ui in user_individuals]
    except PhenopolisException as e:
        return jsonify(success=False, message=str(e)), e.http_status
    return jsonify(user_dict), 200


@application.route("/user")
@requires_admin
def get_users():
    with session_scope() as db_session:
        users = db_session.query(User).all()
        user_names = [u.user for u in users]
    return jsonify(user_names), 200


def _check_user_valid(new_user: User):
    if new_user is None:
        raise PhenopolisException("Null user", 400)
    if new_user.user is None or new_user.user == "":
        raise PhenopolisException("Missing user name", 400)
    if new_user.argon_password is None or new_user.argon_password == "":
        raise PhenopolisException("Missing password", 400)


def _add_config_from_admin(db_session, new_users):
    configs = db_session.query(UserConfig).filter(UserConfig.user_name.match("Admin")).all()
    for u in new_users:
        new_configs = []
        for c in configs:
            new_user_config = UserConfig(**c.as_dict())
            new_user_config.user_name = u.user
            new_configs.append(new_user_config)
        db_session.add_all(new_configs)


def _get_user_by_id(db_session, user_id: str) -> User:
    users = db_session.query(User).filter(User.user == user_id).all()
    if len(users) > 1:
        raise PhenopolisException(message="Unexpected error fetching a user by id", http_status=500)
    if len(users) == 0:
        raise PhenopolisException(message="The user does not exist", http_status=404)
    return users[0]
