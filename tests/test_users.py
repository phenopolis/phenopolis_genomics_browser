from passlib.handlers.argon2 import argon2
from sqlalchemy.orm import Session

from db.model import User, UserConfig
from tests.conftest import NONDEMO_USER
from tests.test_views import _check_only_available_to_admin
from views.postgres import session_scope
from views.token import generate_confirmation_token
from views.user_individuals import delete_user_individual, create_user_individual
from views.users import enable_user, get_users, get_user, create_user


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
    response = create_user()
    assert response.data == b'{"error":"Only mimetype application/json is accepted","success":false}\n'
    assert response.status_code == 400


def test_get_user(_admin):
    """res -> tuple(flask.wrappers.Response)"""
    response, status = get_user("Admin")
    assert status == 200
    user_dict = response.json
    assert isinstance(user_dict, dict)
    assert user_dict.get("user") == "Admin", f"user_dict={user_dict}"
    assert user_dict.get("argon_password") is None, f"user_dict={user_dict}"
    individual_ids = user_dict.get("individuals")
    assert isinstance(individual_ids, list), f"user_dict={user_dict}"
    assert len(individual_ids) > 0, f"user_dict={user_dict}"


def test_get_non_existing_user(_admin):
    """res -> tuple(flask.wrappers.Response)"""
    _, status = get_user("JuanSinMiedo")
    assert status == 404


def test_get_users(_admin):
    """res -> tuple(flask.wrappers.Response)"""
    response, status = get_users()
    assert status == 200
    users = response.json
    assert isinstance(users, list), f"users={users}"
    assert len(users) >= 2, f"users={users}"
    assert "Admin" in users
    assert "demo" in users


def test_enable_user(_admin):
    response, _ = get_user("demo")
    user = response.json
    assert user.get("enabled"), "Demo user is not enabled from the beginning"
    response, status = enable_user("demo", "False")
    assert response.json.get("success")
    assert status == 200
    response, _ = get_user("demo")
    user = response.json
    assert not user.get("enabled"), "Demo user should be disabled"
    response, status = enable_user("demo", "True")
    assert response.json.get("success")
    assert status == 200
    response, _ = get_user("demo")
    user = response.json
    assert user.get("enabled"), "Demo user should be enabled"
    response, status = enable_user("Admin", "False")
    assert status == 400
    assert not response.json.get("success")
    assert response.json.get("message") == "Cannot change the status of Admin user!"


def test_bad_attempt_to_disable_user(_admin):
    response, _ = get_user("demo")
    user = response.json
    assert user.get("enabled"), "Demo user is not enabled from the beginning"
    _, status = enable_user("demo", "Falsch")
    assert status == 400


def test_create_user(_not_logged_in_client):
    payload = {"confirmation_url": "http://phenopolis.org/confirm/"}
    response = _not_logged_in_client.post("/user", json=payload, content_type="application/json")
    assert response.status_code == 400
    assert response.json.get("error") == "Missing user name"
    payload["user"] = "a_tester"
    response = _not_logged_in_client.post("/user", json=payload, content_type="application/json")
    assert response.status_code == 400
    assert response.json.get("error") == "Missing password"
    payload["argon_password"] = "blablabla"
    response = _not_logged_in_client.post("/user", json=payload, content_type="application/json")
    assert response.status_code == 400
    assert response.json.get("error") == "Missing email"

    user_name = "test_register1"
    with session_scope() as db_session:
        try:
            user = User()
            user.user = user_name
            user.argon_password = "blabla"
            user.email = "test_register@phenopolis.org"
            _assert_create_user(db_session, _not_logged_in_client, user)
        finally:
            # cleans the database
            _clean_test_users(db_session, user_name)


def test_create_and_confirm_user(_not_logged_in_client):
    user_name = "test_register2"
    email = "test_register@phenopolis.org"
    with session_scope() as db_session:
        try:
            # creates a user
            user = User()
            user.user = user_name
            user.argon_password = "blabla"
            user.email = email
            _assert_create_user(db_session, _not_logged_in_client, user)
            # confirms the user
            confirmation_token = generate_confirmation_token(user.email)
            response = _not_logged_in_client.get(f"/user/confirm/{confirmation_token}")
            assert response.status_code == 200
            observed_user = db_session.query(User).filter(User.user == user.user).first()
            assert observed_user.user == user.user
            assert observed_user.enabled, "Enabled field is not true"
            assert observed_user.confirmed, "Confirmed field is not true"
            assert observed_user.confirmed_on is not None
        finally:
            # cleans the database
            _clean_test_users(db_session, user_name)


def test_confirm_user_with_token_with_unexisting_email(_not_logged_in_client):
    # tries to confirm an email not in the database
    confirmation_token = generate_confirmation_token("nottherightemail@phenopolis.org")
    response = _not_logged_in_client.get(f"/user/confirm/{confirmation_token}")
    assert response.status_code == 404


def test_confirm_user_with_bad_token(_not_logged_in_client):
    response = _not_logged_in_client.get("/user/confirm/a-bad-token")
    assert response.status_code == 404


def test_confirm_user_already_confirmed(_not_logged_in_client):
    # tries to confirm an email not in the database
    confirmation_token = generate_confirmation_token("demo@phenopolis.org")
    response = _not_logged_in_client.get(f"/user/confirm/{confirmation_token}")
    assert response.status_code == 200


def test_create_user_with_explicit_enabled_and_confirmed_flags(_not_logged_in_client):
    user_name = "test_register3"
    with session_scope() as db_session:
        try:
            user = User()
            user.user = user_name
            user.argon_password = "blabla"
            user.email = "test_register@phenopolis.org"
            user.enabled = True
            user.confirmed = True
            _assert_create_user(db_session, _not_logged_in_client, user)
        finally:
            # cleans the database
            _clean_test_users(db_session, user_name)


def test_create_user_without_email(_not_logged_in_client):
    user_name = "test_register4"
    with session_scope() as db_session:
        try:
            user = User()
            user.user = user_name
            user.argon_password = "blabla"
            response = _not_logged_in_client.post("/user", json=user.as_dict(), content_type="application/json")
            assert response.status_code == 400
        finally:
            # cleans the database
            _clean_test_users(db_session, user_name)


def test_create_user_with_used_email(_not_logged_in_client):
    user_name = "test_register5"
    with session_scope() as db_session:
        try:
            user = User()
            user.user = user_name
            user.argon_password = "blabla"
            user.email = "admin@phenopolis.org"
            payload = user.as_dict()
            payload["confirmation_url"] = "http://phenopolis.org/confirm/"
            response = _not_logged_in_client.post("/user", json=payload, content_type="application/json")
            assert response.status_code == 500
        finally:
            # cleans the database
            _clean_test_users(db_session, user_name)


def test_create_user_with_used_username(_not_logged_in_client):
    user_name = "demo"
    user = User()
    user.user = user_name
    user.argon_password = "blabla"
    user.email = "test_register@phenopolis.org"
    payload = user.as_dict()
    payload["confirmation_url"] = "http://phenopolis.org/confirm/"
    response = _not_logged_in_client.post("/user", json=payload, content_type="application/json")
    assert response.status_code == 500


def test_create_user_without_callbackurl(_not_logged_in_client):
    user_name = "demo"
    user = User()
    user.user = user_name
    user.argon_password = "blabla"
    user.email = "test_register@phenopolis.org"
    payload = user.as_dict()
    response = _not_logged_in_client.post("/user", json=payload, content_type="application/json")
    assert response.status_code == 400


def test_change_password_demo(_demo_client):
    response = _demo_client.post(
        "/user/change-password",
        json={"current_password": "abc", "new_password": "def"},
        content_type="application/json",
    )
    assert response.status_code == 403
    assert response.json.get("error") == "You do not have permission to change the password for username 'demo'."


def test_change_password(_nondemo_client):
    new_password = "p4$$w0rd"
    old_password = "password"

    response = _nondemo_client.post(
        "/user/change-password",
        json={"current_password": "wrong_pass", "new_password": new_password},
        content_type="application/json",
    )
    assert response.status_code == 401
    assert response.json.get("error") == "Username and current password incorrect. Please try again."

    # verifies old password is what it should
    with session_scope() as db_session:
        observed_user = db_session.query(User).filter(User.user == NONDEMO_USER).first()
        assert argon2.verify(old_password, observed_user.argon_password)

    # changes the password
    response = _nondemo_client.post(
        "/user/change-password",
        json={"current_password": old_password, "new_password": new_password},
        content_type="application/json",
    )
    assert response.status_code == 200

    with session_scope() as db_session:
        # checks that the password is changed
        observed_user = db_session.query(User).filter(User.user == NONDEMO_USER).first()
        assert argon2.verify(new_password, observed_user.argon_password)

    # revert passward for future tests
    response = _nondemo_client.post(
        "/user/change-password",
        json={"current_password": new_password, "new_password": old_password},
        content_type="application/json",
    )
    assert response.status_code == 200
    with session_scope() as db_session:
        # checks that the old_password is back
        observed_user = db_session.query(User).filter(User.user == NONDEMO_USER).first()
        assert argon2.verify(old_password, observed_user.argon_password)


def test_delete_user(_admin_client):
    user_name = "test_register6"
    with session_scope() as db_session:
        user = User()
        user.user = user_name
        user.argon_password = "blabla"
        user.email = "test_register6@phenopolis.org"
        _assert_create_user(db_session, _admin_client, user)

        # deletes user
        response = _admin_client.delete(f"/user/{user_name}", content_type="application/json")
        assert response.status_code == 200

        # confirms it does not exist
        o_user = db_session.query(User).filter(User.user == user_name).first()
        assert o_user is None, "Deletion was not successful"

        # try to delete non-existent user
        response = _admin_client.delete("/user/not_me", content_type="application/json")
        assert response.status_code == 404


def test_delete_user_itself(_not_logged_in_client):
    user_name = "temp_user"
    with session_scope() as db_session:
        user = User()
        user.user = user_name
        user.argon_password = "blabla"
        user.email = "temp_user@phenopolis.org"
        _assert_create_user(db_session, _not_logged_in_client, user)
        confirmation_token = generate_confirmation_token(user.email)
        response = _not_logged_in_client.get(f"/user/confirm/{confirmation_token}")
        assert response.status_code == 200

        # login with new user
        resp = _not_logged_in_client.post("/login", json={"user": f"{user.user}", "password": f"{user.argon_password}"})
        assert resp.status_code == 200
        assert resp.json == {"success": "Authenticated", "username": f"{user.user}"}

        # # try to delete another user
        response = _not_logged_in_client.delete("/user/demo", content_type="application/json")
        assert response.status_code == 403

        # user deletes itself
        response = _not_logged_in_client.delete(f"/user/{user_name}", content_type="application/json")
        assert response.status_code == 200


def _assert_create_user(db_session: Session, _client, user):
    payload = user.as_dict()
    payload["confirmation_url"] = "http://phenopolis.org/confirm/"
    response = _client.post("/user", json=payload, content_type="application/json")
    assert response.status_code == 200
    observed_user = db_session.query(User).filter(User.user == user.user).first()
    assert observed_user is not None, "Empty newly created user"
    assert observed_user.user is not None and observed_user.user != "", "Field user is empty"
    assert observed_user.argon_password is not None and observed_user.argon_password != "", "Field password is empty"
    assert not observed_user.enabled, "Enabled field is not false"
    assert not observed_user.confirmed, "Confirmed field is not false"


def _clean_test_users(db_session, user_name):
    try:
        # deletion in public.users should cascade to public.user_config
        db_session.query(User).filter(User.user == user_name).delete()
        db_session.query(UserConfig).filter(UserConfig.user_name == user_name).delete()
    except Exception:
        # could not remove users
        pass
