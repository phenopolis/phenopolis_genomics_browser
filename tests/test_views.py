"""
Test web views api

TODO:
    - How to test for session timeout??
      I think it's a frontend feature
"""

import pytest
from views.variant import variant
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
    response, status = get_all_individuals()
    res = after_request(response)
    assert res.headers["Cache-Control"] == "no-cache, no-store, must-revalidate"


@pytest.mark.parametrize(
    ("query", "subset", "msg"),
    (
        ("14-76156575-A-G", "all", '"end_href":"14-76156575-A-G",'),
        ("14-76127655-C-G", "preview", '[{"preview":[["Clinvar",""]]}]'),
    ),
)
def test_variant(_demo, query, subset, msg):
    """
    This tests S3 and VCF access via pysam
    tests both for subset and entry not in DB, the real one is 14-76127655-C-T
    res -> str
    """
    response = variant(query, subset=subset)
    assert msg in str(response.data)


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
        ("HP:0000478", "all", "Retinal dystrophy;Abnormal fundus morphology"),
        ("Neurogenic bladder", "all", "HP:0000011"),
        ("HP:0000478", "preview", '[{"preview":[["Number of Individuals"'),
        ("HP:0000478", "metadata", '"name":"Abnormality of the eye"'),
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
