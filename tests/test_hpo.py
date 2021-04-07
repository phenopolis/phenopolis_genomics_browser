import pytest
from views.hpo import hpo


@pytest.mark.parametrize(
    ("query", "subset", "msg"),
    (
        ("HP:0000001", "all", '{"display":"GAST"},{"display":"TTLL5"}'),
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
        (
            "HP:0001",
            "preview",
            {"type": "IndexError", "message": ["list index out of range"]},
        ),  # HP:0001 does not exist in DB
        (
            "xyw2zkh",
            "all",
            {"type": "IndexError", "message": ["list index out of range"]},
        ),  # xyw2zkh does not exist in DB
    ),
)
def test_hpo_web(_demo_client, query, subset, msg):
    resp = _demo_client.get(f"/hpo/{query}/{subset}")
    assert resp.status_code == 500
    assert resp.json.get("error") == msg
