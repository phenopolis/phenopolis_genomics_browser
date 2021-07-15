import pytest

from views.autocomplete import HPO_REGEX, NUMERIC_REGEX


@pytest.mark.parametrize(
    ("query", "qt", "msg"),
    (
        # gene search
        ("ttll", "", "gene::TTLL5::ENSG00000119685"),
        ("ttll", "gene", "gene::TTLL5::ENSG00000119685"),
        # TODO: populate the genes.csv for testing with a larger dataset
        ("BRC", "gene", None),
        ("kiaa099", "gene", "gene::TTLL5::ENSG00000119685"),
        ("ENSG0000015617", "gene", "gene::DRAM2::ENSG00000156171"),
        ("ENSG0000015617.3", "gene", "gene::DRAM2::ENSG00000156171"),  # version is ignored
        ("15617", "gene", "gene::DRAM2::ENSG00000156171"),
        ("ENST00000557636", "gene", "gene::TTLL5::ENSG00000119685"),
        ("557636", "gene", "gene::TTLL5::ENSG00000119685"),
        ("something_confusing", "gene", None),
        # phenotype search
        ("retinal", "phenotype", "hpo::Retinal dystrophy::HP:0000556"),
        ("HP:0000007", "phenotype", "hpo::Autosomal recessive inheritance::HP:0000007"),
        ("118", "phenotype", "hpo::Phenotypic abnormality::HP:0000118"),
        ("HP:000010", "phenotype", "hpo::Renal cyst::HP:0000107"),
        ("intelligence", "phenotype", None),
        # TODO: when we search over HPO synonyms this search should return dyschromatopsia, red-gree dyschromatopsia,
        # TODO: monochromacy, tritanomaly and protanomaly
        # ("color blindness", "phenotype", "hpo::Blindness::HP:0000618"),
        # ("achromatopsia", "phenotype", "hpo::Achromatopsia::HP:0011516"),
        ("хороший", "phenotype", None),
        # patient search
        ("PH000082", "patient", "individual::PH00008267::PH00008267"),
        ("82", "patient", "individual::PH00008267::PH00008267"),
        ("0082", "patient", "individual::PH00008267::PH00008267"),
        ("PH0082", "patient", None),
        ("PH000083", "patient", None),
        # variant search
        ("14-76156", "variant", "variant::14-76156407-T-C::14-76156407-T-C"),
        ("14-76156-A-G", "variant", "variant::14-76156575-A-G::14-76156575-A-G"),
        ("14-7615-A", "variant", "variant::14-76156575-A-G::14-76156575-A-G"),
        # TODO: still old schema
        # ("ENST00000286692.4:c.*242A>G", "variant", "variant::1-111660540-T-C::1-111660540-T-C"),
        # ("ENST00000286692:c.*242A>G", "variant", "variant::1-111660540-T-C::1-111660540-T-C"),
        # ("DRAM2:c.*242A>G", "variant", "variant::1-111660540-T-C::1-111660540-T-C"),
        # ("ENSG00000156171:c.*242A>G", "variant", "variant::1-111660540-T-C::1-111660540-T-C"),
        # ("ENSP00000286692.4:p.Arg", "variant", "variant::1-111660805-G-A::1-111660805-G-A"),
        # ("ENSP00000286692:p.Arg", "variant", "variant::1-111660805-G-A::1-111660805-G-A"),
        # ("DRAM2:p.Arg", "variant", "variant::1-111660805-G-A::1-111660805-G-A"),
        # ("ENSG00000156171:p.Arg", "variant", "variant::1-111660805-G-A::1-111660805-G-A"),
        ("1-11166", "variant", "variant::1-111660181-G-GA::1-111660181-G-GA"),
        ("25-11166", "variant", None),
        ("something_confusing", "variant", None),
        ("14-76156300-76156500", "variant", "variant::14-76156407-T-C::14-76156407-T-C"),
        ("14:76156300-76156500", "variant", "variant::14-76156407-T-C::14-76156407-T-C"),
        ("14:76156300:76156500", "variant", "variant::14-76156407-T-C::14-76156407-T-C"),
        ("not_a_chromosome:76156300:76156500", "variant", None),
        ("14:-100:-200", "variant", None),
        ("14:76156500:76156300", "variant", None),
    ),
)
def test_autocomplete(_demo_client, query, qt, msg):
    resp = _demo_client.get("/autocomplete/{query}?query_type={qt}".format(query=query, qt=qt))
    assert resp.status_code == 200
    if msg:
        assert msg in resp.json
        if qt == "patient":
            # the results must be sorted by individual.phenopolis_id
            assert resp.json == sorted(resp.json)
        elif qt == "phenotype":
            if HPO_REGEX.match(query) or NUMERIC_REGEX.match(query):
                # HPO query by query id, results sorted by hpo.hpo_id
                phenotypes_ids = [x.split("::")[2] for x in resp.json]
                assert phenotypes_ids == sorted(phenotypes_ids)
            else:
                # HPO query by name, results sorted by query similarity to hpo.hpo_name
                phenotypes_names = [x.split("::")[1] for x in resp.json]
                # NOTE: semantic search simplification for "easy" search, results having an exact match of the query are
                # sorted by length og HPO name, inexact searches are more tricky
                assert phenotypes_names == sorted(
                    phenotypes_names, key=lambda x: len(x) if query.lower() in x.lower() else 100 + len(x)
                )
        elif qt == "variant":
            assert msg == resp.json[0]
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
