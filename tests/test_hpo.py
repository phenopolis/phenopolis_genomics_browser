import pytest

from views.hpo import hpo


@pytest.mark.parametrize(
    ("query", "subset", "msg"),
    (
        ("HP:0000001", "all", '{"display":"GAST"}'),
        ("HP:0000478", "all", "Phenotypic abnormality"),
        ("Conductive hearing impairment", "all", "HP:0000405"),
        ("HP:0000478", "preview", '[{"preview":[["Number of Individuals"'),
        ("HP:0000478", "metadata", '"name":"Abnormality of the eye"'),
    ),
)
def test_hpo(_demo, query, subset, msg):
    """res -> str"""
    response = hpo(query, subset=subset)
    assert msg in str(response.data)


def test_duplicated_hpo(_demo_client):
    resp = _demo_client.get("/hpo/HP:0000001")
    assert resp.status_code == 200
    a1 = [x["display"] for x in resp.json[0]["individuals"]["data"][0]["simplified_observed_features_names"]]
    assert len(a1) == len(set(a1)), "Duplicated hpo_ids"


@pytest.mark.parametrize(
    ("query", "subset", "msg"),
    (
        ("HP:0001", "preview", [{"preview": [["Number of Individuals", 0]]}]),  # HP:0001 does not exist in DB
        ("xyw2zkh", "preview", [{"preview": [["Number of Individuals", 0]]}]),  # xyw2zkh does not exist in DB
        ("HP:0000478", "preview", [{"preview": [["Number of Individuals", 1]]}]),
    ),
)
def test_hpo_web(_nondemo_client, query, subset, msg):
    resp = _nondemo_client.get(f"/hpo/{query}/{subset}")
    assert resp.status_code == 200
    assert resp.json == msg


@pytest.mark.parametrize(
    ("query", "subset", "msg"),
    (
        ("HP:0001", "all", "HPO not found"),  # HP:0001 does not exist in DB
        ("xyw2zkh", "all", "HPO not found"),  # xyw2zkh does not exist in DB
    ),
)
def test_hpo_preview(_nondemo_client, query, subset, msg):
    resp = _nondemo_client.get(f"/hpo/{query}/{subset}")
    assert resp.status_code == 404
    assert resp.json.get("message") == msg
