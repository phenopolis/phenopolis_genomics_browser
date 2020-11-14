import sys
from io import StringIO
from views.variant import _get_genotypes  # noqa: F401
from views.variant import variant, variant_preview


def test_get_genotypes_exception():
    # if this happens, something is out of sync between S3 VCF file and variant table in DB
    redirected_error = sys.stderr = StringIO()
    exec('_get_genotypes("443", "10000")')
    err = redirected_error.getvalue()
    assert "no intervals found for" in err


def test_variant(_demo):
    """
    This tests S3 and VCF access via cvycf2
    tests both for subset and entry not in DB, the real one is 14-76127655-C-T
    res -> str
    """
    response = variant("14-76156575-A-G")
    assert '"gene_symbol":"TTLL5","hgvsc":"ENST00000298832.9:c.412A>G"' in str(response.data)


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
