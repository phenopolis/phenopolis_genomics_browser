from views.statistics import phenopolis_statistics


def test_statistics_api(_demo):
    """res -> dict"""
    res = phenopolis_statistics().json
    assert "total_variants" in res.keys()


def test_statistics(_admin_client):
    resp = _admin_client.get("/statistics")
    assert resp.status_code == 200
    data = resp.json
    assert data.get("exomes") == 4
    assert data.get("females") == 1
    assert data.get("males") == 2
    assert data.get("unknowns") == 1
    assert data.get("total_variants") == 4099
    assert data.get("observed_features") == 7
    assert data.get("unobserved_features") == 17
    assert data.get("total_genes") == 3


def test_statistics_with_demo_user(_demo_client):
    resp = _demo_client.get("/statistics")
    assert resp.status_code == 200
    data = resp.json
    assert data.get("exomes") == 4
    assert data.get("females") == 1
    assert data.get("males") == 2
    assert data.get("unknowns") == 1
    assert data.get("total_variants") == 4099
    assert data.get("observed_features") == 7
    assert data.get("unobserved_features") == 17
    assert data.get("total_genes") == 3


def test_statistics_with_nondemo_user(_nondemo_client):
    resp = _nondemo_client.get("/statistics")
    assert resp.status_code == 200
    data = resp.json
    assert data.get("exomes") == 1
    assert data.get("females") == 0
    assert data.get("males") == 1
    assert data.get("unknowns") == 0
    assert data.get("total_variants") == 1406
    assert data.get("observed_features") == 3
    assert data.get("unobserved_features") == 0
    assert data.get("total_genes") == 1
