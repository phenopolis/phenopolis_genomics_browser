"""
Test web views api

TODO:
    - How to test for session timeout??
      I think it's a frontend feature
"""

import pytest
from views.variant import variant
from views.gene import gene
from views.autocomplete import autocomplete, best_guess
from views.hpo import hpo
from views.individual import individual, update_patient_data
from views.exceptions import PhenopolisException
from views.auth import is_logged_in, logout, login
from views.general import check_health, after_request, exceptions
from views.statistics import phenopolis_statistics
from werkzeug.exceptions import BadHost
from views.users import create_user


def test_login_logout(_demo):
    """res -> tuple(flask.wrappers.Response)"""
    kv = dict(
        [
            (check_health, b'{"health":"ok"}\n'),
            (login, b'{"success":"Authenticated","username":"demo"}\n'),
            (is_logged_in, b'{"username":"demo"}\n'),
            (logout, b'{"success":"logged out"}\n'),
        ]
    )
    for func, msg in kv.items():
        res = func()[0]
        assert res.status_code == 200
        assert res.data == msg


def test_no_login(_nouser):
    """res -> tuple(flask.wrappers.Response)"""
    kv = dict(
        [
            (login, b'{"error":"Invalid Credentials. Please try again."}\n'),
            (is_logged_in, b'{"error":"Unauthenticated"}\n'),
        ]
    )
    for func, msg in kv.items():
        res = func()[0]
        assert res.status_code == 200
        assert res.data == msg


def test_after_request(_demo):
    """
    Also tests gene_not_found
    resp -> tuple(flask.wrappers.Response)
    res -> flask.wrappers.Response
    """
    resp = gene("fake_gene")
    assert resp[0].status_code == 200
    assert resp[0].data == b'{"message":"Gene not found"}\n'
    res = after_request(resp[0])
    assert res.status_code == 200
    assert res.data == b'{"message":"Gene not found"}\n'
    assert res.headers["Cache-Control"] == "no-cache, no-store, must-revalidate"


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
    res = variant(query, subset=subset)
    assert isinstance(res, str)
    assert msg in res


@pytest.mark.parametrize(
    ("query", "qt", "msg"),
    (
        ("ttll", "", "gene:TTLL5"),
        ("ttll", "gene", "TTLL5"),
        ("kiaa099", "gene", "TTLL5"),
        ("ENSG0000015617", "gene", "DRAM2"),
        ("ENST00000557636", "gene", "TTLL5"),
        ("gallbladder", "phenotype", "Gallbladder dyskinesia"),
        ("HP:0000010", "phenotype", "Recurrent urinary tract infections"),
        ("PH000082", "patient", "PH00008267"),
        ("14-76156", "variant", "14-76156575-A-G"),
        ("14-76156-A-G", "variant", "14-76156575-A-G"),
        ("14-7615-A", "variant", "14-76156575-A-G"),
        ("ENST00000286692.4:c.*242A>G", "variant", "1-111660540-T-C"),
        ("ENSP00000286692.4:p.Arg", "variant", "1-111660805-G-A"),
    ),
)
def test_autocomplete(_demo, query, qt, msg):
    """res -> flask.wrappers.Response"""
    res = autocomplete(query, qt)
    assert res.status_code == 200
    assert msg in res.json


def test_autocomplete_wrong_query_type(_demo):
    with pytest.raises(PhenopolisException) as excinfo:
        autocomplete("ttll", "acme")
    assert "Autocomplete request with unsupported" in str(excinfo)


def test_exceptions(_demo):
    """
    ee = werkzeug.exceptions.BadHost
    res -> werkzeug.wrappers.response.Response
    """
    ee = BadHost()
    res = exceptions(ee)
    assert res.status_code == 400


@pytest.mark.parametrize(
    ("query", "msg"),
    (
        ("gene:ttll5", "/gene/ttll5"),
        ("patient:PH00005862", "/individual/PH00005862"),
        ("phenotype:Atretic gallbladder", "/hpo/Atretic gallbladder"),
        ("variant:22-38212762-A-G", "/variant/22-38212762-A-G"),
        ("22-38212762-A-G", "/variant/22-38212762-A-G"),
    ),
)
def test_best_guess(_demo, query, msg):
    """res -> flask.wrappers.Response"""
    res = best_guess(query)
    assert res.status_code == 200
    assert res.json.get("redirect") == msg


def test_best_guess_not_found(_demo):
    """res -> tuple(flask.wrappers.Response)"""
    res = best_guess("ttll")[0]
    assert res.status_code == 200
    assert res.data == b'{"message":"Could not find search query"}\n'


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
    """res -> str"""
    res = gene(query, subset=subset)
    assert msg in res


@pytest.mark.parametrize(
    ("query", "subset", "msg"),
    (
        ("HP:0000478", "all", "Retinal dystrophy;Abnormal fundus morphology"),
        ("Neurogenic bladder", "all", "HP:0000011"),
        ("HP:0000478", "preview", '[{"preview":[["Number of Individuals"'),
        ("HP:0000478", "metadata", '"name":"Abnormality of the eye"'),
    ),
)
def test_hpo(_demo, query, subset, msg):
    """res -> str"""
    res = hpo(query, subset=subset)
    assert msg in res


@pytest.mark.parametrize(
    ("query", "subset", "msg"),
    (
        ("PH00008267", "all", '"Number of individuals that are wildtype in our dataset"'),
        ("PH00008258", "preview", "impairment;Macular"),
        ("PH00008258", "metadata", "WebsterURMD_Sample_IC16489"),
    ),
)
def test_individual(_demo, query, subset, msg):
    """
    res -> str
    """
    res = individual(query, subset=subset)
    assert msg in res


def test_individual_not(_demo):
    """
    "demo" user has no right to acess PH00000001
    res -> tuple(flask.wrappers.Response)
    """
    res = individual("PH00000001")
    assert res[0].status_code == 200
    assert (
        res[0].data
        == b'{"message":"Sorry, either the patient does not exist or you are not permitted to see this patient"}\n'
    )
    assert res[1] == 404


def test_update_patient_data_demo(_demo):
    """res -> tuple(flask.wrappers.Response)"""
    res = update_patient_data("PH00000001")
    assert res[0].status_code == 200
    assert res[0].data == b'{"error":"Demo user not authorised"}\n'
    assert res[1] == 405


def test_statistics(_demo):
    """res -> dict"""
    res = phenopolis_statistics().json
    assert "total_variants" in res.keys()


def test_create_user(_demo):
    """res -> tuple(flask.wrappers.Response)"""
    res = create_user()
    assert res[0].status_code == 200
    assert res[0].data == b'{"error":"You do not have permission to create new users"}\n'
    assert res[1] == 403
