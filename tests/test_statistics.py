from views.postgres import session_scope
from flask import session
from views.auth import ADMIN_USER, USER
from db.model import Sex, Individual
from views.statistics import count_variants


def test_statistics(_admin_client):
    resp = _admin_client.get("/statistics")
    assert resp.status_code == 200
    data = resp.json
    assert data.get("exomes") == 5
    assert data.get("females") == 2
    assert data.get("males") == 3
    assert data.get("unknowns") == 0
    assert data.get("total_variants") == 8
    assert data.get("observed_features") == 8
    assert data.get("unobserved_features") == 19


def test_statistics_with_demo_user(_demo_client):
    resp = _demo_client.get("/statistics")
    assert resp.status_code == 200
    data = resp.json
    assert data.get("exomes") == 4
    assert data.get("females") == 1
    assert data.get("males") == 3
    assert data.get("unknowns") == 0
    assert data.get("total_variants") == 8
    assert data.get("observed_features") == 7
    assert data.get("unobserved_features") == 18


def test_statistics_with_nondemo_user(_nondemo_client):
    resp = _nondemo_client.get("/statistics")
    assert resp.status_code == 200
    data = resp.json
    assert data.get("exomes") == 1
    assert data.get("females") == 0
    assert data.get("males") == 1
    assert data.get("unknowns") == 0
    assert data.get("total_variants") == 1
    assert data.get("observed_features") == 3
    assert data.get("unobserved_features") == 1


def test_additional_filter(_admin):
    # arg: additional_filter is not actively used so far in statistics
    # it is here for completeness coverage
    session[USER] = ADMIN_USER
    with session_scope() as db_session:
        tcvf = count_variants(db_session, additional_filter=Individual.sex == Sex.F)
    assert tcvf == 16
