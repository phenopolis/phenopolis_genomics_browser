import pytest
from views.variant import variant, variant_preview


@pytest.mark.parametrize(
    ("query", "msg"), (("14-76156575-A-G", '"end_href":"14-76156575-A-G",')),
)
def test_variant(_demo, query, msg):
    """
    This tests S3 and VCF access via pysam
    tests both for subset and entry not in DB, the real one is 14-76127655-C-T
    res -> str
    """
    response = variant(query)
    assert msg in str(response.data)


def test_missing_variant(_demo):
    response = variant("chr45-1234567890112233-C-G")
    assert response.status_code == 404


def test_wrong_variant(_demo):
    response = variant("something-else")
    assert response.status_code == 400


def test_variant_preview(_demo):
    response = variant_preview("14-76127655-C-G")
    assert response.status_code == 200
    assert "Clinvar" in response.json


def test_wrong_variant_preview(_demo):
    response = variant_preview("something-else")
    assert response.status_code == 400
