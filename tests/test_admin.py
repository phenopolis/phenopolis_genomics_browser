"""
For tests that requires Admin access
Using a mockup one from Demo DB
"""
from views.users import create_user


def test_attempt_create_user(_admin):
    """res -> tuple(flask.wrappers.Response)"""
    res = create_user()
    assert res[0].status_code == 200
    assert res[0].data == b'{"error":"Only mimetype application/json is accepted","success":false}\n'
    assert res[1] == 400
