from db.model import IndividualVariantClassification
from views.postgres import session_scope


def test_create_individual_with_admin_user(_admin_client):
    classification = IndividualVariantClassification()
    classification.variant_id = 2105
    classification.individual_id = "PH00008258"
    classification.classification = "pathogenic"
    classification.notes = "blabla"
    classification.pubmed_id = "12345"

    response = _admin_client.post("/variant-classification",
                                  json=classification.as_dict(), content_type="application/json")
    assert response.status_code == 200

    with session_scope() as db_session:
        observed_classification = db_session.query(IndividualVariantClassification)\
            .filter(IndividualVariantClassification.individual_id == "PH00008258").first()
        assert observed_classification is not None
        assert observed_classification.classification == "pathogenic"
        assert observed_classification.variant_id == 2105
        assert observed_classification.user_id == "Admin"



# def test_create_individual_existing_individual_fails(_admin_client):
#     individual = Individual()
#     test_individual_id = _get_random_individual_id()
#     individual.external_id = test_individual_id
#     individual.pi = "3.1416"
#     response = _admin_client.post("/individual", json=individual.as_dict(), content_type="application/json")
#     assert response.status_code == 200
#
#     with session_scope() as db_session:
#         observed_individual = db_session.query(Individual).filter(Individual.external_id == test_individual_id).first()
#         assert observed_individual is not None, "Empty newly created individual"
#         assert observed_individual.pi == individual.pi, "Field pi from created individual is not what it should"
#
#         response = _admin_client.post("/individual", json=individual.as_dict(), content_type="application/json")
#         assert response.status_code == 400
#
#         # cleans the database
#         _clean_test_individuals(db_session, test_individual_id)
#
#
# def test_create_multiple_individuals(_admin_client):
#     individual = Individual()
#     test_individual_id = _get_random_individual_id()
#     individual.external_id = test_individual_id
#     individual.pi = "3.1416"
#     individual2 = Individual()
#     test_individual_id2 = _get_random_individual_id()
#     individual2.external_id = test_individual_id2
#     individual2.pi = "3.141600000001983983"
#     response = _admin_client.post(
#         "/individual", json=[individual.as_dict(), individual2.as_dict()], content_type="application/json"
#     )
#     assert response.status_code == 200
#
#     with session_scope() as db_session:
#         observed_individual = db_session.query(Individual).filter(Individual.external_id == test_individual_id).first()
#         assert observed_individual is not None, "Empty newly created individual"
#         assert observed_individual.pi == individual.pi, "Field pi from created individual is not what it should"
#         observed_individual2 = (
#             db_session.query(Individual).filter(Individual.external_id == test_individual_id2).first()
#         )
#         assert observed_individual2 is not None, "Empty newly created individual"
#         assert observed_individual2.pi == individual2.pi, "Field pi from created individual is not what it should"
#
#         # cleans the database
#         _clean_test_individuals(db_session, test_individual_id)
#         _clean_test_individuals(db_session, test_individual_id2)
