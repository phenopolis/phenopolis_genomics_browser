from db.model import IndividualVariantClassification
from views.postgres import session_scope
import random


def test_create_classification_with_admin_user(_admin_client):
    classification = IndividualVariantClassification()
    classification.variant_id = 2105
    classification.individual_id = "PH00008258"
    classification.classification = "pathogenic"
    classification.notes = "".join(["bla" for _ in range(random.randint(10, 100))])
    classification.pubmed_id = str(random.randint(10, 1000000))
    _assert_variant_classification(_admin_client, classification, "Admin")


def test_create_classification_with_demo_user(_demo_client):
    classification = IndividualVariantClassification()
    classification.variant_id = 2105
    classification.individual_id = "PH00008258"
    classification.classification = "pathogenic"
    classification.notes = "".join(["bla" for _ in range(random.randint(10, 100))])
    classification.pubmed_id = str(random.randint(10, 1000000))
    _assert_variant_classification(_demo_client, classification, "demo")


def test_create_classification_with_mismatching_variant_and_individual(_demo_client):
    classification = IndividualVariantClassification()
    classification.variant_id = 2099
    classification.individual_id = "PH00008258"
    classification.classification = "pathogenic"
    classification.notes = "".join(["bla" for _ in range(random.randint(10, 100))])
    classification.pubmed_id = str(random.randint(10, 1000000))
    response = _demo_client.post(
        "/variant-classification", json=classification.as_dict(), content_type="application/json")
    assert response.status_code == 500


def test_create_classification_with_non_existing_variant(_demo_client):
    classification = IndividualVariantClassification()
    classification.variant_id = 210500000000000
    classification.individual_id = "PH00008258"
    classification.classification = "pathogenic"
    classification.notes = "".join(["bla" for _ in range(random.randint(10, 100))])
    classification.pubmed_id = str(random.randint(10, 1000000))
    response = _demo_client.post(
        "/variant-classification", json=classification.as_dict(), content_type="application/json")
    assert response.status_code == 500


def test_create_classification_with_non_existing_individual(_demo_client):
    classification = IndividualVariantClassification()
    classification.variant_id = 2105
    classification.individual_id = "PH123456789"
    classification.classification = "pathogenic"
    classification.notes = "".join(["bla" for _ in range(random.randint(10, 100))])
    classification.pubmed_id = str(random.randint(10, 1000000))
    response = _demo_client.post(
        "/variant-classification", json=classification.as_dict(), content_type="application/json")
    assert response.status_code == 400


def test_create_classification_with_bad_value(_demo_client):
    classification = IndividualVariantClassification()
    classification.variant_id = 2105
    classification.individual_id = "PH00008258"
    classification.classification = "iknownothingofthis"
    classification.notes = "".join(["bla" for _ in range(random.randint(10, 100))])
    classification.pubmed_id = str(random.randint(10, 1000000))
    response = _demo_client.post(
        "/variant-classification", json=classification.as_dict(), content_type="application/json")
    assert response.status_code == 500


def test_create_classification_with_empty_variant(_demo_client):
    classification = IndividualVariantClassification()
    classification.individual_id = "PH00008258"
    classification.classification = "pathogenic"
    classification.notes = "".join(["bla" for _ in range(random.randint(10, 100))])
    classification.pubmed_id = str(random.randint(10, 1000000))
    response = _demo_client.post(
        "/variant-classification", json=classification.as_dict(), content_type="application/json")
    assert response.status_code == 500


def test_create_classification_with_empty_individual(_demo_client):
    classification = IndividualVariantClassification()
    classification.variant_id = 2105
    classification.classification = "pathogenic"
    classification.notes = "".join(["bla" for _ in range(random.randint(10, 100))])
    classification.pubmed_id = str(random.randint(10, 1000000))
    response = _demo_client.post(
        "/variant-classification", json=classification.as_dict(), content_type="application/json")
    assert response.status_code == 400


def test_create_classification_with_empty_classification(_demo_client):
    classification = IndividualVariantClassification()
    classification.variant_id = 2105
    classification.individual_id = "PH00008258"
    classification.notes = "".join(["bla" for _ in range(random.randint(10, 100))])
    classification.pubmed_id = str(random.randint(10, 1000000))
    response = _demo_client.post(
        "/variant-classification", json=classification.as_dict(), content_type="application/json")
    assert response.status_code == 500


def _assert_variant_classification(client, classification, user_id):
    response = client.post(
        "/variant-classification", json=classification.as_dict(), content_type="application/json")
    assert response.status_code == 200
    with session_scope() as db_session:
        observed_classification = db_session.query(IndividualVariantClassification) \
            .filter(IndividualVariantClassification.individual_id == classification.individual_id) \
            .order_by(IndividualVariantClassification.classified_on.desc()).first()
        assert observed_classification is not None
        assert observed_classification.id is not None
        assert observed_classification.classified_on is not None
        assert observed_classification.classification == classification.classification
        assert observed_classification.variant_id == classification.variant_id
        assert observed_classification.user_id == user_id
        assert observed_classification.notes == classification.notes
        assert observed_classification.pubmed_id == classification.pubmed_id
