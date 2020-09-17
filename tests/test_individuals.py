import pytest
import ujson as json
from flask import request

from tests.test_views import _check_only_available_to_admin
from views.individual import get_individual_by_id, update_patient_data, delete_individual, get_all_individuals


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
    assert msg in response.data


def test_get_unauthorised_individual_by_id(_demo):
    """
    "demo" user has no right to acess PH00000001
    res -> tuple(flask.wrappers.Response)
    """
    response, status = get_individual_by_id("PH00000001")
    assert status == 404
    assert (
        json.load(response.data).get("message")
        == "Sorry, either the patient does not exist or you are not permitted to see this patient"
    )


def test_update_patient_data_demo(_demo):
    """res -> tuple(flask.wrappers.Response)"""
    response, status = update_patient_data("PH00000001")
    assert json.load(response.data).get("message") == "Demo user not authorised"
    assert status == 405


# TODO: add a test that updates a individual. It is required to pass a POST JSON payload


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
    # fetch first page
    request.args["offset"] = "0"
    request.args["limit"] = "5"
    response, status = get_all_individuals()
    assert status == 200
    first_page = json.loads(response.data)
    assert len(first_page) == 5, "Page is not of size 5"

    # fetch second page
    request.args["offset"] = "5"
    request.args["limit"] = "5"
    response, status = get_all_individuals()
    assert status == 200
    second_page = json.loads(response.data)
    assert len(second_page) == 5, "Page is not of size 5"

    # ensures that pages do not overlap
    assert (
        len(set([i.internal_id for i in first_page]).intersection([i.internal_id for i in second_page])) == 0
    ), "Successive pages of individuals overlap"
