import pytest


@pytest.mark.parametrize("user", [None, "demo"])
def test_statistics(user, api):
    resp = api.get(user, "/statistics")
    assert resp.status_code == 200
    data = resp.json()
    assert "exomes" in data
