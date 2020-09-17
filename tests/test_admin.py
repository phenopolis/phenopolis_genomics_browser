"""
For tests that requires Admin access
Using a mockup one from Demo DB
"""
import ujson as json
from views.users import create_user, get_user, get_users, enable_user


def test_attempt_create_user(_admin):
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
    enable_user("demo", "True")
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
