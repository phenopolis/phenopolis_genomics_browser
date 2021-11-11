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


def test_my_variants(_demo_client):
    resp = _demo_client.get("/my_variants?limit=10000")
    assert len(resp.json) == 4099
    assert "'variant_id': [{'display': '14-95236097-C-A'" in str(resp.json)
    resp = _demo_client.get("/my_variants?limit=100001")
    assert resp.status_code == 400
    assert resp.json == {"message": "The maximum page size for variants is 100000"}


def test_my_genes(_demo_client):
    resp = _demo_client.get("/my_genes")
    assert len(resp.json) == 3
    assert "'percentage_gene_gc_content': 49.73" in str(resp.json)


def test_my_hpos(_demo_client):
    resp = _demo_client.get("/my_hpos")
    assert len(resp.json) == 7
    assert "'Abnormal retinal morphology'" in str(resp.json)
    resp = _demo_client.get("/my_hpos?limit=100001")
    assert resp.status_code == 400
    assert resp.json == {"message": "The maximum page size for variants is 100000"}
