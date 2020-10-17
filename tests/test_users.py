import json

from passlib.handlers.argon2 import argon2

from db.model import User
from tests.test_views import _check_only_available_to_admin
from views.auth import NONDEMO_USER
from views.postgres import get_db_session
from views.user_individuals import delete_user_individual, create_user_individual
from views.users import enable_user, get_users, get_user, create_user


def test_create_user_without_permissions(_demo):
    """res -> tuple(flask.wrappers.Response)"""
    res = create_user()
    _check_only_available_to_admin(res)


def test_create_user_individual_without_permissions(_demo):
    """res -> tuple(flask.wrappers.Response)"""
    res = create_user_individual()
    _check_only_available_to_admin(res)


def test_get_user_without_permissions(_demo):
    """res -> tuple(flask.wrappers.Response)"""
    res = get_user("whatever_user")
    _check_only_available_to_admin(res)


def test_get_users_without_permissions(_demo):
    """res -> tuple(flask.wrappers.Response)"""
    res = get_users()
    _check_only_available_to_admin(res)


def test_delete_user_individual_without_permissions(_demo):
    """res -> tuple(flask.wrappers.Response)"""
    res = delete_user_individual()
    _check_only_available_to_admin(res)


def test_enable_user_without_permissions(_demo):
    """res -> tuple(flask.wrappers.Response)"""
    res = enable_user("my_user", "true")
    _check_only_available_to_admin(res)


def test_attempt_create_user_with_wrong_mimetype(_admin):
    """res -> tuple(flask.wrappers.Response)"""
    response, status = create_user()
    assert response.data == b'{"error":"Only mimetype application/json is accepted","success":false}\n'
    assert status == 400


def test_get_user(_admin):
    """res -> tuple(flask.wrappers.Response)"""
    response, status = get_user("Admin")
    assert status == 200
    user_dict = json.loads(response.data)
    assert isinstance(user_dict, dict)
    assert user_dict.get("user") == "Admin", "user_dict={}".format(user_dict)
    assert user_dict.get("argon_password") is None, "user_dict={}".format(user_dict)
    individual_ids = user_dict.get("individuals")
    assert isinstance(individual_ids, list), "user_dict={}".format(user_dict)
    assert len(individual_ids) > 0, "user_dict={}".format(user_dict)


def test_get_non_existing_user(_admin):
    """res -> tuple(flask.wrappers.Response)"""
    _, status = get_user("JuanSinMiedo")
    assert status == 404


def test_get_users(_admin):
    """res -> tuple(flask.wrappers.Response)"""
    response, status = get_users()
    assert status == 200
    users = json.loads(response.data)
    assert isinstance(users, list), "users={}".format(users)
    assert len(users) >= 2, "users={}".format(users)
    assert "Admin" in users
    assert "demo" in users


def test_enable_user(_admin):
    response, _ = get_user("demo")
    user = json.loads(response.data)
    assert user.get("enabled"), "Demo user is not enabled from the beginning"
    response, status = enable_user("demo", "False")
    assert json.loads(response.data).get("success")
    assert status == 200
    response, _ = get_user("demo")
    user = json.loads(response.data)
    assert not user.get("enabled"), "Demo user should be disabled"
    response, status = enable_user("demo", "True")
    assert json.loads(response.data).get("success")
    assert status == 200
    response, _ = get_user("demo")
    user = json.loads(response.data)
    assert user.get("enabled"), "Demo user should be enabled"


def test_bad_attempt_to_disable_user(_admin):
    response, _ = get_user("demo")
    user = json.loads(response.data)
    assert user.get("enabled"), "Demo user is not enabled from the beginning"
    _, status = enable_user("demo", "Falsch")
    assert status == 400


def test_create_user(_admin_client):
    user_name = "test_user2"
    try:
        user = User()
        user.user = user_name
        user.argon_password = "blabla"
        _assert_create_user(_admin_client, user, expected_enabled=True)
    finally:
        # cleans the database
        _clean_test_users(user_name)


def test_create_user_with_explicit_enabled_flag(_admin_client):
    user_name = "test_user2"
    try:
        user = User()
        user.user = user_name
        user.argon_password = "blabla"
        user.enabled = True
        _assert_create_user(_admin_client, user, expected_enabled=True)
    finally:
        # cleans the database
        _clean_test_users(user_name)


def test_create_user_with_explicit_disabled_flag(_admin_client):
    user_name = "test_user2"
    try:
        user = User()
        user.user = user_name
        user.argon_password = "blabla"
        user.enabled = False
        _assert_create_user(_admin_client, user, expected_enabled=False)
    finally:
        # cleans the database
        _clean_test_users(user_name)


def test_change_password(_nondemo_client):
    new_password = "p4$$w0rd"
    old_password = "password"

    # verifies old password is what it should
    db_session = get_db_session()
    observed_user = db_session.query(User).filter(User.user == NONDEMO_USER).first()
    assert argon2.verify(old_password, observed_user.argon_password)

    # changes the password
    response = _nondemo_client.post(
        "/user/change-password", json={"current_password": old_password, "new_password": new_password},
        content_type="application/json")
    assert response.status_code == 200

    # checks that the password is changed
    observed_user = db_session.query(User).filter(User.user == NONDEMO_USER).first()
    assert argon2.verify(new_password, observed_user.argon_password)


def _assert_create_user(_admin_client, user, expected_enabled):
    response = _admin_client.post("/user", json=user.as_dict(), content_type="application/json")
    assert response.status_code == 200
    db_session = get_db_session()
    observed_user = db_session.query(User).filter(User.user == user.user).first()
    assert observed_user is not None, "Empty newly created user"
    assert observed_user.user is not None and observed_user.user != "", "Field user is empty"
    assert observed_user.argon_password is not None and observed_user.argon_password != "", "Field password is empty"
    assert observed_user.enabled == expected_enabled, "Enabled field is not the expected value"


def _clean_test_users(user_name):
    db_session = get_db_session()
    db_session.query(User).filter(User.user == user_name).delete()
    db_session.commit()
