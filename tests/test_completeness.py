# Tests here are using function or methods that should be never called unless something is *really* flawed
import sys
from io import StringIO
from views.variant import _get_genotypes  # noqa: F401


def test_get_genotypes_exception():
    # if this happens, something is out of sync between S3 VCF file and variant table in DB
    redirected_error = sys.stderr = StringIO()
    exec('_get_genotypes("443", "10000")')
    err = redirected_error.getvalue()
    assert "no intervals found for" in err
