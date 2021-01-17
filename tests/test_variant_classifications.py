from db.model import IndividualVariantClassification
from views.postgres import session_scope
import random


def test_create_classification_with_admin_user(_admin_client):
    classification = IndividualVariantClassification()
    classification.variant_id = 2105
    classification.individual_id = 8258
    classification.classification = "pathogenic"
    classification.notes = "".join(["bla" for _ in range(random.randint(10, 100))])
    classification.pubmed_id = str(random.randint(10, 1000000))
    _assert_variant_classification(_admin_client, classification, "Admin")


def test_create_classification_with_demo_user(_demo_client):
    classification = IndividualVariantClassification()
    classification.variant_id = 2105
    classification.individual_id = 8258
    classification.classification = "pathogenic"
    classification.notes = "".join(["bla" for _ in range(random.randint(10, 100))])
    classification.pubmed_id = str(random.randint(10, 1000000))
    _assert_variant_classification(_demo_client, classification, "demo")


def test_create_classification_with_mismatching_variant_and_individual(_demo_client):
    classification = IndividualVariantClassification()
    classification.variant_id = 2099
    classification.individual_id = 8258
    classification.classification = "pathogenic"
    classification.notes = "".join(["bla" for _ in range(random.randint(10, 100))])
    classification.pubmed_id = str(random.randint(10, 1000000))
    response = _demo_client.post(
        "/variant-classification", json=classification.as_dict(), content_type="application/json"
    )
    assert response.status_code == 500


def test_create_classification_with_non_existing_variant(_demo_client):
    classification = IndividualVariantClassification()
    classification.variant_id = 210500000000000
    classification.individual_id = 8258
    classification.classification = "pathogenic"
    classification.notes = "".join(["bla" for _ in range(random.randint(10, 100))])
    classification.pubmed_id = str(random.randint(10, 1000000))
    response = _demo_client.post(
        "/variant-classification", json=classification.as_dict(), content_type="application/json"
    )
    assert response.status_code == 500


def test_create_classification_with_non_existing_individual(_demo_client):
    classification = IndividualVariantClassification()
    classification.variant_id = 2105
    classification.individual_id = 123456789
    classification.classification = "pathogenic"
    classification.notes = "".join(["bla" for _ in range(random.randint(10, 100))])
    classification.pubmed_id = str(random.randint(10, 1000000))
    response = _demo_client.post(
        "/variant-classification", json=classification.as_dict(), content_type="application/json"
    )
    assert response.status_code == 401


def test_create_classification_with_bad_value(_demo_client):
    classification = IndividualVariantClassification()
    classification.variant_id = 2105
    classification.individual_id = 8258
    classification.classification = "iknownothingofthis"
    classification.notes = "".join(["bla" for _ in range(random.randint(10, 100))])
    classification.pubmed_id = str(random.randint(10, 1000000))
    response = _demo_client.post(
        "/variant-classification", json=classification.as_dict(), content_type="application/json"
    )
    assert response.status_code == 500


def test_create_classification_with_empty_variant(_demo_client):
    classification = IndividualVariantClassification()
    classification.individual_id = 8258
    classification.classification = "pathogenic"
    classification.notes = "".join(["bla" for _ in range(random.randint(10, 100))])
    classification.pubmed_id = str(random.randint(10, 1000000))
    response = _demo_client.post(
        "/variant-classification", json=classification.as_dict(), content_type="application/json"
    )
    assert response.status_code == 500


def test_create_classification_with_empty_individual(_demo_client):
    classification = IndividualVariantClassification()
    classification.variant_id = 2105
    classification.classification = "pathogenic"
    classification.notes = "".join(["bla" for _ in range(random.randint(10, 100))])
    classification.pubmed_id = str(random.randint(10, 1000000))
    response = _demo_client.post(
        "/variant-classification", json=classification.as_dict(), content_type="application/json"
    )
    assert response.status_code == 401


def test_create_classification_with_empty_classification(_demo_client):
    classification = IndividualVariantClassification()
    classification.variant_id = 2105
    classification.individual_id = 8258
    classification.notes = "".join(["bla" for _ in range(random.randint(10, 100))])
    classification.pubmed_id = str(random.randint(10, 1000000))
    response = _demo_client.post(
        "/variant-classification", json=classification.as_dict(), content_type="application/json"
    )
    assert response.status_code == 500


def test_create_classification_unauthorised_variant(_nondemo_client):
    classification = IndividualVariantClassification()
    classification.variant_id = 2105
    classification.individual_id = 8258
    classification.classification = "pathogenic"
    classification.notes = "".join(["bla" for _ in range(random.randint(10, 100))])
    classification.pubmed_id = str(random.randint(10, 1000000))
    response = _nondemo_client.post(
        "/variant-classification", json=classification.as_dict(), content_type="application/json"
    )
    assert response.status_code == 401


def test_get_classifications_by_individual(_admin_client):

    # sets 3 variant classifications for a given individual
    phenopolis_id = "PH00008258"
    individual_id = int(phenopolis_id.replace("PH", ""))
    classification1 = IndividualVariantClassification()
    classification1.variant_id = 2105
    classification1.individual_id = individual_id
    classification1.classification = "pathogenic"
    _assert_variant_classification(_admin_client, classification1, "Admin")
    classification2 = IndividualVariantClassification()
    classification2.variant_id = 2100
    classification2.individual_id = individual_id
    classification2.classification = "pathogenic"
    _assert_variant_classification(_admin_client, classification2, "Admin")
    classification3 = IndividualVariantClassification()
    classification3.variant_id = 2101
    classification3.individual_id = individual_id
    classification3.classification = "pathogenic"
    _assert_variant_classification(_admin_client, classification3, "Admin")
    # creates this one just to check it does not come in the output
    classification4 = IndividualVariantClassification()
    classification4.variant_id = 2099
    classification4.individual_id = 8256
    classification4.classification = "pathogenic"
    _assert_variant_classification(_admin_client, classification4, "Admin")

    response = _admin_client.get(f"/variant-classifications-by-individual/{phenopolis_id}")
    assert response.status_code == 200
    classifications = response.json
    assert len(classifications) >= 3
    observed_variant_ids = [c.get("variant_id") for c in classifications]
    assert 2105 in observed_variant_ids
    assert 2100 in observed_variant_ids
    assert 2101 in observed_variant_ids
    assert 2099 not in observed_variant_ids
    observed_individual_ids = set([c.get("individual_id") for c in classifications])
    assert individual_id in observed_individual_ids
    assert len(observed_individual_ids) == 1


def test_get_classification_unauthorised_individual(_nondemo_client):
    response = _nondemo_client.get("/variant-classifications-by-individual/PH00008258")
    assert response.status_code == 401


def test_get_classification_non_existing_individual(_admin_client):
    response = _admin_client.get("/variant-classifications-by-individual/PH123456789789665541222")
    assert response.status_code == 401


def _assert_variant_classification(client, classification, user_id):
    response = client.post("/variant-classification", json=classification.as_dict(), content_type="application/json")
    assert response.status_code == 200
    with session_scope() as db_session:
        observed_classification = (
            db_session.query(IndividualVariantClassification)
            .filter(IndividualVariantClassification.individual_id == classification.individual_id)
            .order_by(IndividualVariantClassification.classified_on.desc())
            .first()
        )
        assert observed_classification is not None
        assert observed_classification.id is not None
        assert observed_classification.classified_on is not None
        assert observed_classification.classification == classification.classification
        assert observed_classification.variant_id == classification.variant_id
        assert observed_classification.user_id == user_id
        assert observed_classification.notes == classification.notes
        assert observed_classification.pubmed_id == classification.pubmed_id
