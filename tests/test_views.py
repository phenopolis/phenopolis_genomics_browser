"""
Test web views api

TODO:
    - How to test for session timeout??
      I think it's a frontend feature
"""

import pytest
from views.gene import gene
from views.hpo import hpo
from views.individual import get_all_individuals
from views.general import check_health, after_request, exceptions
from views.statistics import phenopolis_statistics
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


@pytest.mark.parametrize(
    ("query", "subset", "msg"),
    (
        ("HP:0000478", "all", "Phenotypic abnormality"),
        ("Conductive hearing impairment", "all", "HP:0000405"),
        ("HP:0000478", "preview", '[{"preview":[["Number of Individuals"'),
        ("HP:0000478", "metadata", '"name":"Abnormality of the eye"'),
        ("HP:0001", "preview", '"type":"links"}],"data":[]}'),  # HP:0001 does not exist in DB
        ("xyw2zkh", "all", '"type":"links"}],"data":[]}'),  # xyw2zkh does not exist in DB
    ),
)
def test_hpo(_demo, query, subset, msg):
    """res -> str"""
    response = hpo(query, subset=subset)
    assert msg in str(response.data)


def test_statistics(_demo):
    """res -> dict"""
    res = phenopolis_statistics().json
    assert "total_variants" in res.keys()


def _check_only_available_to_admin(res):
    assert res[0].status_code == 200
    assert res[0].data == b'{"error":"Admin permissions required to perform this operation"}\n'
    assert res[1] == 403
