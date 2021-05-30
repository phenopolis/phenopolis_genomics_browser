"""
Test web views api

TODO:
    - How to test for session timeout??
      I think it's a frontend feature
"""

from views.gene import gene
from views.individual import get_all_individuals
from views.general import check_health, after_request, exceptions
from werkzeug.exceptions import BadHost


def test_check_health(_demo):
    """res -> tuple(flask.wrappers.Response)"""
    kv = dict([(check_health, b'{"health":"ok"}\n')])
    for func, msg in kv.items():
        res = func()[0]
        assert res.status_code == 200
        assert res.data == msg


def test_after_request(_demo):
    """
    Also tests gene_not_found
    resp -> tuple(flask.wrappers.Response)
    res -> flask.wrappers.Response
    """
    # tries an endpoint that allows caching
    response = gene("fake_gene")
    assert response.status_code == 404
    assert response.data == b'{"message":"Gene not found"}\n'
    res = after_request(response)
    assert res.status_code == 404
    assert res.data == b'{"message":"Gene not found"}\n'
    assert res.headers["Cache-Control"] == "public,max-age=300"

    # tries an endpoint that does not allow caching
    response, _status = get_all_individuals()
    res = after_request(response)
    assert res.headers["Cache-Control"] == "no-cache, no-store, must-revalidate"


def test_exceptions(_demo):
    """
    ee = werkzeug.exceptions.BadHost
    res -> werkzeug.wrappers.response.Response
    """
    ee = BadHost()
    res = exceptions(ee)
    assert res.status_code == 400


def test_version(_not_logged_in_client):
    res = _not_logged_in_client.get("/version")
    assert res.status_code == 200
    assert res.json.get("version")


def _check_only_available_to_admin(res):
    assert res[0].status_code == 200
    assert res[0].data == b'{"error":"Admin permissions required to perform this operation"}\n'
    assert res[1] == 403
