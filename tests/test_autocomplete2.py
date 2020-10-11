import pytest

from views.autocomplete import HPO_REGEX


@pytest.mark.parametrize(
    ("query", "qt", "msg"),
    (
        ("ttll", "", "gene::TTLL5::ENSG00000119685"),
        ("ttll", "gene", "gene::TTLL5::ENSG00000119685"),
        ("kiaa099", "gene", "gene::TTLL5::ENSG00000119685"),
        ("ENSG0000015617", "gene", "gene::DRAM2::ENSG00000156171"),
        ("ENST00000557636", "gene", "gene::TTLL5::ENSG00000119685"),
        # phenotype search
        ("gallbladder", "phenotype", "hpo::Gallbladder dyskinesia::HP:0012442"),
        ("HP:0000010", "phenotype", "hpo::Recurrent urinary tract infections::HP:0000010"),
        ("HP:000001", "phenotype", "hpo::Recurrent urinary tract infections::HP:0000010"),
        ("intellect", "phenotype", "hpo::Intellectual disability::HP:0001249"),
        ("intelligence", "phenotype", None),
        ("cognitive", "phenotype", "hpo::Cognitive impairment::HP:0100543"),
        # TODO: when we search over HPO synonyms this search should return dyschromatopsia, red-gree dyschromatopsia,
        # TODO: monochromacy, tritanomaly and protanomaly
        ("color blindness", "phenotype", "hpo::Blindness::HP:0000618"),
        ("achromatopsia", "phenotype", "hpo::Achromatopsia::HP:0011516"),
        # patient search
        ("PH000082", "patient", "individual::PH00008267::PH00008267"),
        ("82", "patient", "individual::PH00008267::PH00008267"),
        ("0082", "patient", "individual::PH00008267::PH00008267"),
        ("PH0082", "patient", None),
        ("PH000083", "patient", None),
        # variant search
        ("14-76156", "variant", "variant::14-76156575-A-G::14-76156575-A-G"),
        ("14-76156-A-G", "variant", "variant::14-76156575-A-G::14-76156575-A-G"),
        ("14-7615-A", "variant", "variant::14-76156575-A-G::14-76156575-A-G"),
        ("ENST00000286692.4:c.*242A>G", "variant", "variant::1-111660540-T-C::1-111660540-T-C"),
        ("ENSP00000286692.4:p.Arg", "variant", "variant::1-111660805-G-A::1-111660805-G-A"),
    ),
)
def test_autocomplete(_demo_client, query, qt, msg):
    resp = _demo_client.get("/autocomplete/{query}?query_type={qt}".format(query=query, qt=qt))
    assert resp.status_code == 200
    if msg:
        assert msg in resp.json
        if qt == "patient":
            # the results must be sorted by individual.internal_id
            assert resp.json == sorted(resp.json)
        elif qt == "phenotype":
            if HPO_REGEX.match(query):
                # HPO query by query id, results sorted by hpo.hpo_id
                phenotypes_ids = [x.split("::")[2] for x in resp.json]
                assert phenotypes_ids == sorted(phenotypes_ids)
            else:
                # HPO query by name, results sorted by query similarity to hpo.hpo_name
                phenotypes_names = [x.split("::")[1] for x in resp.json]
                # NOTE: semantic search simplification for "easy" search, results having an exact match of the query are
                # sorted by length og HPO name, inexact searches are more tricky
                assert phenotypes_names == sorted(phenotypes_names,
                                                  key=lambda x: len(x) if query.lower() in x.lower() else 100 + len(x))
    else:
        assert len(resp.json) == 0


@pytest.mark.parametrize(
    ("limit", "msg"),
    (
        ("acme", {"message": "Please, specify a numeric limit value, acme", "success": False}),
        ("2000", {"message": "Please, specify a limit lower than 1000", "success": False}),
    ),
)
def test_autocomplete_limit(_demo_client, limit, msg):
    resp = _demo_client.get("/autocomplete/ttll?limit={limit}".format(limit=limit))
    assert resp.status_code == 400
    assert resp.json == msg

# TODO: add tests for limit

def test_autocomplete_wrong_query_type(_demo_client):
    resp = _demo_client.get("/autocomplete/ttll?query_type=acme")
    assert resp.status_code == 400
    assert resp.json == {"message": "Autocomplete request with unsupported query type 'acme'", "success": False}
