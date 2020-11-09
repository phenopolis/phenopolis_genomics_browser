"""
Users view
"""
from flask import session, jsonify
from flask_mail import Message
from passlib.handlers.argon2 import argon2
from sqlalchemy import func
from db.model import User, UserIndividual, UserConfig
from views import application, mail
from views.auth import requires_auth, check_auth, requires_admin, is_demo_user, USER, ADMIN_USER
from views.exceptions import PhenopolisException
from views.general import _parse_boolean_parameter
from views.helpers import _get_json_payload
from views.postgres import session_scope
from views.token import generate_confirmation_token, confirm_token


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
def create_user():
    try:
        new_users = _get_json_payload(User)
        if len(new_users) != 1:
            # this is to simplify the code and to avoid misuses of the API
            raise PhenopolisException("It is only allowed to register one user at a time", 400)

        new_user = new_users[0]
        _check_user_valid(new_user)
        # encode password
        new_user.argon_password = argon2.hash(new_user.argon_password)
        # this is the default, but to avoid a misuse of the API that circumvents user registration it forces these
        # two flags to False
        new_user.confirmed = False
        new_user.enabled = False

        try:
            # persist users
            user_id = new_user.user
            with session_scope() as db_session:
                db_session.add(new_user)
                _add_config_from_admin(db_session, new_user)
                # sends confirmation email
                _send_confirmation_email(new_user)
            response = jsonify(success=True, message="User was created", id=user_id)
        except Exception as e:
            application.logger.exception(e)
            response = jsonify(success=False, message=str(e))
            response.status_code = 500
    except PhenopolisException as e:
        application.logger.error(str(e))
        response = jsonify(success=False, error=str(e))
        response.status_code = e.http_status
    return response


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


@application.route("/user/confirm/<token>")
def confirm_user(token):
    email = confirm_token(token, application.config["TOKEN_EXPIRY_SECONDS"])
    with session_scope() as db_session:
        try:
            user = db_session.query(User).filter(User.email == email).first()
            if user is None:
                raise PhenopolisException("Invalid token or non existing user", 404)
            if user.confirmed:
                raise PhenopolisException("User has already been confirmed. Please, go to login", 400)
            user.confirmed = True
            user.confirmed_on = func.now()
            user.enabled = True
            response = jsonify(success=True, message="User confirmation successful")
        except PhenopolisException as e:
            response = jsonify(success=False, message=str(e))
            response.status_code = e.http_status
    return response


def _check_user_valid(new_user: User):
    if new_user is None:
        raise PhenopolisException("Null user", 400)
    if new_user.user is None or new_user.user == "":
        raise PhenopolisException("Missing user name", 400)
    if new_user.argon_password is None or new_user.argon_password == "":
        raise PhenopolisException("Missing password", 400)
    if new_user.email is None or new_user.email == "":
        raise PhenopolisException("Missing email", 400)


def _add_config_from_admin(db_session, new_user):
    configs = db_session.query(UserConfig).filter(UserConfig.user_name.match("Admin")).all()
    new_configs = []
    for c in configs:
        new_user_config = UserConfig(**c.as_dict())
        new_user_config.user_name = new_user.user
        new_configs.append(new_user_config)
    db_session.add_all(new_configs)


def _get_user_by_id(db_session, user_id: str) -> User:
    users = db_session.query(User).filter(User.user == user_id).all()
    if len(users) > 1:
        raise PhenopolisException(message="Unexpected error fetching a user by id", http_status=500)
    if len(users) == 0:
        raise PhenopolisException(message="The user does not exist", http_status=404)
    return users[0]


def _send_confirmation_email(user: User):
    confirmation_token = generate_confirmation_token(user.email)
    msg = Message(
        "Confirm your registration into Phenopolis", sender="no-reply@phenopolis.org", recipients=[user.email],
    )
    msg.body = "Welcome to Phenopolis {}, confirm your registration with the token {}".format(
        user.email, confirmation_token
    )
    mail.send(msg)
