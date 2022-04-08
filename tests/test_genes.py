import pytest

from views.gene import gene


@pytest.mark.parametrize(
    ("query", "subset", "full_gene_name"),
    (
        ("ENSG00000119685", "all", "tubulin tyrosine ligase-like family, member 5"),
        ("ENSG00000119685", "preview", '{"preview":'),
        ("TTLL5", "all", "tubulin tyrosine ligase-like family, member 5"),
        ("ENSG00000119685", "variants", "variant_id"),
        ("KIAA0998", "all", "tubulin tyrosine ligase-like family, member 5"),
        ("STAMP", "all", "tubulin tyrosine ligase-like family, member 5"),
    ),
)
def test_gene(_demo, query, subset, full_gene_name):
    response = gene(query, subset=subset)
    assert full_gene_name in str(response.data)
    assert response.cache_control.max_age == 300
    assert response.cache_control.public
    assert response.expires is not None


def test_gene_not_found(_demo):
    response = gene("fake_gene")
    assert response.status_code == 404
    assert response.data == b'{"message":"Gene not found"}\n'


def test_gene_not_having_duplicated_keys(_demo):
    response = gene("TTLL5")
    gene_results = response.json
    column_names = [c["key"] for c in gene_results[0]["variants"]["colNames"]]
    assert len(column_names) == len(set(column_names)), "There are duplicated column names in the variants"
    assert "#CHROM" not in column_names


@pytest.mark.parametrize(
    ("query", "subset", "msg"),
    (
        ("ENSG00000119685", "all", "'canonical_peptide': 'ENSP00000450713',"),
        ("TTLL5", "all", "'canonical_transcript': 'ENST00000557636',"),
        ("STAMP", "all", "'uniprot': ['Q6EMB2'],"),
        ("GAST", "all", "'stop': 39872221,"),
        ("DRAM2", "preview", "[{'preview': [['Number of variants', 75], ['CADD > 20', 2]]}]"),
    ),
)
def test_gene_web(_demo_client, query, subset, msg):
    resp = _demo_client.get(f"/gene/{query}/{subset}")
    assert resp.status_code == 200
    assert msg in str(resp.json)
