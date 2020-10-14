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
from views.general import check_health, after_request, exceptions
from views.statistics import phenopolis_statistics
from werkzeug.exceptions import BadHost
from views.users import create_user, get_user, get_users, enable_user
from views.user_individuals import create_user_individual, delete_user_individual


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
    resp = gene("fake_gene")
    assert resp[0].status_code == 200
    assert resp[0].data == b'{"message":"Gene not found"}\n'
    res = after_request(resp[0])
    assert res.status_code == 200
    assert res.data == b'{"message":"Gene not found"}\n'
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
    res = variant(query, subset=subset)
    assert isinstance(res, str)
    assert msg in res


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
        ("ENSG00000119685", "all", "tubulin tyrosine ligase-like family, member 5"),
        ("ENSG00000119685", "preview", '{"preview":'),
        ("TTLL5", "all", "tubulin tyrosine ligase-like family, member 5"),
        ("ENSG00000119685", "variants", "variant_id"),
        ("KIAA0998", "all", "tubulin tyrosine ligase-like family, member 5"),
        ("STAMP", "all", "tubulin tyrosine ligase-like family, member 5"),
        ("NOTREAL", "all", "mockup gene for test"),
    ),
)
def test_gene(_demo, query, subset, msg):
    """res -> str"""
    res = gene(query, subset=subset)
    assert msg in res


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
    res = hpo(query, subset=subset)
    assert msg in res


def test_statistics(_demo):
    """res -> dict"""
    res = phenopolis_statistics().json
    assert "total_variants" in res.keys()


def test_create_user(_demo):
    """res -> tuple(flask.wrappers.Response)"""
    res = create_user()
    _check_only_available_to_admin(res)


def test_create_user_individual(_demo):
    """res -> tuple(flask.wrappers.Response)"""
    res = create_user_individual()
    _check_only_available_to_admin(res)


def test_get_user(_demo):
    """res -> tuple(flask.wrappers.Response)"""
    res = get_user("whatever_user")
    _check_only_available_to_admin(res)


def test_get_users(_demo):
    """res -> tuple(flask.wrappers.Response)"""
    res = get_users()
    _check_only_available_to_admin(res)


def test_delete_user_individual(_demo):
    """res -> tuple(flask.wrappers.Response)"""
    res = delete_user_individual()
    _check_only_available_to_admin(res)


def test_enable_user(_demo):
    """res -> tuple(flask.wrappers.Response)"""
    res = enable_user("my_user", "true")
    _check_only_available_to_admin(res)


def _check_only_available_to_admin(res):
    assert res[0].status_code == 200
    assert res[0].data == b'{"error":"Admin permissions required to perform this operation"}\n'
    assert res[1] == 403
