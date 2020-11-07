import pytest

from views.variant import variant


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