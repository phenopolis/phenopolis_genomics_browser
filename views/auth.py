"""
Authentication modules
"""

from functools import wraps

from flask import jsonify, request, session
from passlib.handlers.argon2 import argon2
from sqlalchemy import and_

from db.model import User
from views import application
from views.postgres import session_scope

ADMIN_USER = "Admin"
DEMO_USER = "demo"
PASSWORD = "password"
USER = "user"


def is_demo_user():
    return session[USER] == DEMO_USER


def check_auth(username, password):
    """
    This function is called to check if a username / password combination is valid.
    """
    with session_scope() as db_session:
        # only enabled and confirmed users can login
        user = db_session.query(User).filter(and_(User.user == username, User.enabled, User.confirmed)).first()
        if not user:
            return False
        hashed_password = user.argon_password
    return argon2.verify(password, hashed_password)


def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if session.get(USER):
            return f(*args, **kwargs)
        # TODO: eventually we will want to remove this bit for POST endpoints
        if request.method == "POST":
            username = request.form.get(USER, request.headers.get(USER))
            password = request.form.get(PASSWORD, request.headers.get(PASSWORD))
            if check_auth(username, password):
                session[USER] = username
                # session.permanent = True
                return f(*args, **kwargs)
        return jsonify(error="Unauthenticated"), 401

    return decorated


def requires_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if session.get(USER) == ADMIN_USER:
            return f(*args, **kwargs)
        # TODO: eventually we will want to remove this bit for POST endpoints
        username = request.form.get(USER, request.headers.get(USER))
        if request.method in ["POST", "DELETE"] and username == ADMIN_USER:
            password = request.form.get(PASSWORD, request.headers.get(PASSWORD))
            if check_auth(username, password):
                session[USER] = username
                # session.permanent = True
                return f(*args, **kwargs)
        return jsonify(error="Admin permissions required to perform this operation"), 403

    return decorated


def requires_admin_or_user(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user_id = kwargs.get("user_id")
        if session.get(USER) in [ADMIN_USER, user_id]:
            return f(*args, **kwargs)
        return jsonify(error="Only Admin or the own User can perform this operation"), 403

    return decorated


def requires_user(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if session.get(USER) != DEMO_USER:
            return f(*args, **kwargs)

    return decorated


@application.route("/<language>/login", methods=["POST"])
@application.route("/login", methods=["POST"])
def login():
    application.logger.info(f"request.json: {request.json}")
    username = request.json.get(USER)
    password = request.json.get(PASSWORD)
    if not check_auth(username, password):
        return jsonify(error="Invalid Credentials. Please try again."), 401
    session[USER] = username
    session.update()
    return jsonify(success="Authenticated", username=username), 200


@application.route("/<language>/logout", methods=["POST"])
@application.route("/logout", methods=["POST"])
@requires_auth
def logout():
    application.logger.info("Delete session")
    session.pop(USER, None)
    return jsonify(success="logged out"), 200


@application.route("/is_logged_in")
@requires_auth
def is_logged_in():
    return jsonify(username=session.get(USER, "")), 200
