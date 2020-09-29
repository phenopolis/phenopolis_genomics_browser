import pytest
import ujson as json
from flask import session

from db.model import Individual
from tests.test_views import _check_only_available_to_admin
from views.auth import USER
from views.individual import get_individual_by_id, delete_individual, get_all_individuals
from views.postgres import get_db_session


@pytest.mark.parametrize(
    ("query", "subset", "msg"),
    (
        ("PH00008267", "all", '"Number of individuals that are wildtype in our dataset"'),
        ("PH00008258", "preview", "impairment;Macular"),
        ("PH00008258", "metadata", "WebsterURMD_Sample_IC16489"),
    ),
)
def test_get_authorised_individual_by_id(_demo, query, subset, msg):
    """
    res -> str
    """
    response, status = get_individual_by_id(query, subset=subset)
    assert status == 200
    assert msg in str(response.data)


def test_get_unauthorised_individual_by_id(_demo):
    """
    "demo" user has no right to access PH00000001
    res -> tuple(flask.wrappers.Response)
    """
    response, status = get_individual_by_id("PH00000001")
    assert status == 404
    assert (
        json.loads(response.data).get("message")
        == "Sorry, either the patient does not exist or you are not permitted to see this patient"
    )


def test_update_individual_with_demo_user_fails(_demo_client):
    # fetch current sex
    individual_id = "PH00008267"
    db_session = get_db_session()
    individual = db_session.query(Individual).filter(Individual.internal_id == individual_id).first()
    sex = individual.sex

    # update sex
    # TODO: make the API more coherent regarding this sex translation
    new_sex, new_sex_for_api = ("F", "female") if sex == "M" else ("M", "male")
    response = _demo_client.post("/update_patient_data/{}".format(individual_id),
                                  data="gender_edit[]={}".format(new_sex_for_api),
                                  content_type='application/x-www-form-urlencoded')
    assert response.status_code == 405

    # fetch new sex
    db_session.refresh(individual)
    observed_sex = individual.sex
    assert observed_sex == sex, "Update did work and it should not!"


def test_update_individual_with_admin_user(_admin_client):

    # fetch current sex
    individual_id = "PH00008267"
    db_session = get_db_session()
    individual = db_session.query(Individual).filter(Individual.internal_id == individual_id).first()
    sex = individual.sex

    # update sex
    # TODO: make the API more coherent regarding this sex translation
    new_sex, new_sex_for_api = ("F", "female") if sex == "M" else ("M", "male")
    response = _admin_client.post("/update_patient_data/{}".format(individual_id),
                      data="gender_edit[]={}".format(new_sex_for_api),
                      content_type='application/x-www-form-urlencoded')
    assert response.status_code == 200

    # fetch new sex
    db_session.refresh(individual)
    observed_sex = individual.sex
    assert observed_sex == new_sex, "Update did not work"


def test_create_individual_with_demo_user_fails(_demo_client):
    individual = Individual()
    individual.internal_id = "PH_TEST000001"
    response = _demo_client.post("/individual", data=json.dumps(individual.as_dict()), content_type='text/json')
    assert response.status_code == 405


def test_create_individual_with_admin_user(_admin_client):
    individual = Individual()
    test_individual_id = "PH_TEST000007"
    individual.external_id = test_individual_id
    individual.pi = "3.1416"
    response = _admin_client.post("/individual", data=json.dumps(individual.as_dict()), content_type='application/json')
    assert response.status_code == 200

    db_session = get_db_session()
    observed_individual = db_session.query(Individual).filter(Individual.external_id == test_individual_id).first()
    assert observed_individual is not None, "Empty newly created individual"
    assert observed_individual.pi == individual.pi, "Field pi from created individual is not what it should"

    # cleans the database
    _clean_test_individuals(db_session, test_individual_id)


def test_create_individual_existing_individual_fails(_admin_client):
    individual = Individual()
    test_individual_id = "PH_TEST000008"
    individual.external_id = test_individual_id
    individual.pi = "3.1416"
    response = _admin_client.post("/individual", data=json.dumps(individual.as_dict()), content_type='application/json')
    assert response.status_code == 200

    db_session = get_db_session()
    observed_individual = db_session.query(Individual).filter(Individual.external_id == test_individual_id).first()
    assert observed_individual is not None, "Empty newly created individual"
    assert observed_individual.pi == individual.pi, "Field pi from created individual is not what it should"

    response = _admin_client.post("/individual", data=json.dumps(individual.as_dict()), content_type='application/json')
    assert response.status_code == 400

    # cleans the database
    _clean_test_individuals(db_session, test_individual_id)


def test_create_multiple_individuals(_admin_client):
    individual = Individual()
    test_individual_id = "PH_TEST000010"
    individual.external_id = test_individual_id
    individual.pi = "3.1416"
    individual2 = Individual()
    test_individual_id2 = "PH_TEST000011"
    individual2.external_id = test_individual_id2
    individual2.pi = "3.141600000001983983"
    response = _admin_client.post("/individual", data=json.dumps([individual.as_dict(), individual2.as_dict()]),
                                  content_type='application/json')
    assert response.status_code == 200

    db_session = get_db_session()
    observed_individual = db_session.query(Individual).filter(Individual.external_id == test_individual_id).first()
    assert observed_individual is not None, "Empty newly created individual"
    assert observed_individual.pi == individual.pi, "Field pi from created individual is not what it should"
    observed_individual2 = db_session.query(Individual).filter(Individual.external_id == test_individual_id2).first()
    assert observed_individual2 is not None, "Empty newly created individual"
    assert observed_individual2.pi == individual2.pi, "Field pi from created individual is not what it should"

    # cleans the database
    _clean_test_individuals(db_session, test_individual_id)
    _clean_test_individuals(db_session, test_individual_id2)


def test_delete_individual_failing_for_non_admin(_demo):
    """res -> tuple(flask.wrappers.Response)"""
    res = delete_individual("whatever_individual")
    _check_only_available_to_admin(res)


# TODO: add a test that deletes an individual. It is required to pass a POST JSON payload


def test_get_all_individuals_default_page(_demo):
    response, status = get_all_individuals()
    assert status == 200
    individuals = json.loads(response.data)
    assert len(individuals) <= 100, "Page is greater than the maximum size of 100"
    assert len(individuals) > 0, "There are no results"
    for i in individuals:
        assert "demo" in i.get("users"), "User demo not in the list of users"
        assert len(i.get("users")) == 1, "Other users than demo are in the list"


def test_get_all_individuals_with_admin_default_page(_admin):
    response, status = get_all_individuals()
    assert status == 200
    individuals = json.loads(response.data)
    assert len(individuals) <= 100, "Page is greater than the maximum size of 100"
    assert len(individuals) > 0, "There are no results"
    found_individual_multiple_users = False
    for i in individuals:
        assert "Admin" in i.get("users"), "User Admin not in the list of users"
        assert len(i.get("users")) >= 1, "Other users than demo are in the list"
        found_individual_multiple_users = found_individual_multiple_users or len(i.get("users")) > 1
    assert found_individual_multiple_users, "Only Admin user reported as users with access to individuals"


def test_get_all_individuals_second_page(_demo):
    # TODO: setting query parameters like this does not work... use fix_api.py
    pass
    # fetch first page
    # request.args["offset"] = "0"
    # request.args["limit"] = "5"
    # response, status = get_all_individuals()
    # assert status == 200
    # first_page = json.loads(response.data)
    # assert len(first_page) == 5, "Page is not of size 5"
    #
    # # fetch second page
    # request.args["offset"] = "5"
    # request.args["limit"] = "5"
    # response, status = get_all_individuals()
    # assert status == 200
    # second_page = json.loads(response.data)
    # assert len(second_page) == 5, "Page is not of size 5"
    #
    # # ensures that pages do not overlap
    # assert (
    #     len(set([i.internal_id for i in first_page]).intersection([i.internal_id for i in second_page])) == 0
    # ), "Successive pages of individuals overlap"


def _clean_test_individuals(db_session, test_individual_id):
    db_session.query(Individual).filter(Individual.external_id == test_individual_id).delete()
    db_session.commit()
