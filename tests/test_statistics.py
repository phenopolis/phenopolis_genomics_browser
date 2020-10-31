

def test_statistics(_admin_client):
    resp = _admin_client.get("/statistics")
    assert resp.status_code == 200
    data = resp.json
    assert data.get("exomes") == 5
    assert data.get("females") == 2
    assert data.get("males") == 3
    assert data.get("unknowns") == 0
    assert data.get("exac_variants") == 0
    assert data.get("nonpass_variants") == 4
    assert data.get("pass_variants") == 28
    assert data.get("total_variants") == 32


def test_statistics_with_demo_user(_demo_client):
    resp = _demo_client.get("/statistics")
    assert resp.status_code == 200
    data = resp.json
    assert data.get("exomes") == 4
    assert data.get("females") == 1
    assert data.get("males") == 3
    assert data.get("unknowns") == 0
    assert data.get("exac_variants") == 0
    assert data.get("nonpass_variants") == 4
    assert data.get("pass_variants") == 28
    assert data.get("total_variants") == 32


def test_statistics_with_nondemo_user(_nondemo_client):
    resp = _nondemo_client.get("/statistics")
    assert resp.status_code == 200
    data = resp.json
    assert data.get("exomes") == 1
    assert data.get("females") == 0
    assert data.get("males") == 1
    assert data.get("unknowns") == 0
    assert data.get("exac_variants") == 0
    assert data.get("nonpass_variants") == 0
    assert data.get("pass_variants") == 4
    assert data.get("total_variants") == 4

