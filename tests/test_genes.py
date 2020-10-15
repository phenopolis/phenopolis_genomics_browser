import pytest
import ujson as json

from views.gene import gene


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
    res = gene(query, subset=subset)
    assert msg in res


def test_gene_not_found(_demo):
    resp = gene("fake_gene")
    assert resp[0].status_code == 200
    assert resp[0].data == b'{"message":"Gene not found"}\n'


def test_gene_not_having_duplicated_keys(_demo):
    resp = gene("TTLL5")
    gene_results = json.loads(resp)
    column_names = [c["key"] for c in gene_results[0]["variants"]["colNames"]]
    assert len(column_names) == len(set(column_names)), "There are duplicated column names in the variants"
    assert "#CHROM" not in column_names
