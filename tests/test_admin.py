"""
For tests that requires Admin access
Using a mockup one from Demo DB
"""
import ujson as json
from views.users import create_user, get_user


def test_attempt_create_user(_admin):
    """res -> tuple(flask.wrappers.Response)"""
    res = create_user()
    assert res[0].status_code == 200
    assert res[0].data == b'{"error":"Only mimetype application/json is accepted","success":false}\n'
    assert res[1] == 400


def test_get_user(_admin):
    """res -> tuple(flask.wrappers.Response)"""
    res = get_user("Admin")
    assert res[0].data is not None
    user_dict = json.loads(res[0].data)
    assert isinstance(user_dict, dict)
    assert user_dict.get("user") == "Admin", "user_dict={}".format(user_dict)
    assert user_dict.get("argon_password") is None, "user_dict={}".format(user_dict)
    individual_ids = user_dict.get("individuals"), "user_dict={}".format(user_dict)
    assert isinstance(individual_ids, list), "user_dict={}".format(user_dict)
    assert len(individual_ids) > 0, "user_dict={}".format(user_dict)


def test_get_non_existing_user(_admin):
    """res -> tuple(flask.wrappers.Response)"""
    res = get_user("JuanSinMiedo")
    assert res[0].status_code == 200
    assert res[1] == 404
