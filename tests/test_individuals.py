import pytest
from sqlalchemy.orm import Session

import views.individual as vi  # to allow MAX_PAGE_SIZE redefinition
from db.model import Individual, UserIndividual
from views.auth import USER
from views.individual import MAPPING_SEX_REPRESENTATIONS, get_all_individuals, get_individual_by_id
from views.postgres import session_scope


@pytest.mark.parametrize(
    ("query", "subset", "msg"),
    (
        ("PH00008267", "all", "'Number of individuals that are wildtype in our dataset'"),
        ("PH00008258", "preview", "'Visual impairment', 'Macular dystrophy'"),
        ("PH00008258", "metadata", "_demo_"),
    ),
)
def test_get_authorised_individual_by_id(_demo, query, subset, msg):
    """
    res -> str
    """
    response = get_individual_by_id(query, subset=subset)
    assert response.status_code == 200
    assert msg in str(response.json)
    assert response.cache_control.max_age == 300
    assert response.cache_control.public
    assert response.expires is not None


def test_get_unauthorised_individual_by_id(_demo):
    """
    "demo" user has no right to access PH00000001
    res -> tuple(flask.wrappers.Response)
    """
    response = get_individual_by_id("PH00000001")
    assert response.status_code == 404
    assert response.json.get("message") == "Patient not found"


def test_get_individual_complete_view_by_id(_admin):

    # test individual with homozygous variants
    individual_view = _get_view_individual_by_id(identifier="PH00008256")
    assert len(individual_view.get("rare_homs", {}).get("data")) == 82, "Unexpected number of homozygous variants"
    assert (
        len(individual_view.get("rare_variants", {}).get("data")) == 1324
    ), "Unexpected number of heterozygous variants"
    assert (
        len(individual_view.get("rare_comp_hets", {}).get("data")) == 0
    ), "Unexpected number of compound heterozygous variants"

    # test individual with heterozygous variants
    individual_view = _get_view_individual_by_id(identifier="PH00008267")
    assert len(individual_view.get("rare_homs", {}).get("data")) == 59, "Unexpected number of homozygous variants"
    assert (
        len(individual_view.get("rare_variants", {}).get("data")) == 905
    ), "Unexpected number of heterozygous variants"
    assert (
        len(individual_view.get("rare_comp_hets", {}).get("data")) == 2
    ), "Unexpected number of compound heterozygous variants"


def test_get_individual_preview_by_id(_admin):

    # test individual with homozygous variants
    individual_view = _get_view_individual_by_id(identifier="PH00008256", subset="preview")
    assert individual_view.get("preview")[0][1] == "WebsterURMD_Sample_GV4344"
    assert individual_view.get("preview")[4][0] == "Number of hom variants"
    assert individual_view.get("preview")[4][1] == 82, "Unexpected number of homozygous variants"
    assert individual_view.get("preview")[5][0] == "Number of compound hets"
    assert individual_view.get("preview")[5][1] == 0, "Unexpected number of compound heterozygous variants"
    assert individual_view.get("preview")[6][0] == "Number of het variants"
    assert individual_view.get("preview")[6][1] == 1324, "Unexpected number of heterozygous variants"

    # test individual with heterozygous variants
    individual_view = _get_view_individual_by_id(identifier="PH00008267", subset="preview")
    assert individual_view.get("preview")[4][0] == "Number of hom variants"
    assert individual_view.get("preview")[4][1] == 59, "Unexpected number of homozygous variants"
    assert individual_view.get("preview")[5][0] == "Number of compound hets"
    assert individual_view.get("preview")[5][1] == 2, "Unexpected number of compound heterozygous variants"
    assert individual_view.get("preview")[6][0] == "Number of het variants"
    assert individual_view.get("preview")[6][1] == 905, "Unexpected number of heterozygous variants"


def _get_view_individual_by_id(identifier, subset="all"):
    response = get_individual_by_id(identifier, subset=subset)
    assert response.status_code == 200
    data = response.json
    assert len(data) == 1, "Missing expected data"
    individual_complete_view = data[0]
    return individual_complete_view


def test_update_individual_with_demo_user_fails(_demo_client):
    # fetch current sex
    individual_id = "PH00008267"
    with session_scope() as db_session:
        individual = db_session.query(Individual).filter(Individual.phenopolis_id == individual_id).first()
        sex = individual.sex

        # update sex
        new_sex_for_api = MAPPING_SEX_REPRESENTATIONS.inverse.get(sex)
        response = _demo_client.post(
            f"/update_patient_data/{individual_id}",
            data=f"gender_edit[]={new_sex_for_api}",
            content_type="application/x-www-form-urlencoded",
        )
        assert response.status_code == 405

        # fetch new sex
        db_session.refresh(individual)
        observed_sex = individual.sex
        assert observed_sex == sex, "Update did work and it should not!"


def test_update_individual_with_admin_user(_admin_client):

    # fetch current sex
    individual_id = "PH00008267"
    with session_scope() as db_session:
        individual = db_session.query(Individual).filter(Individual.phenopolis_id == individual_id).first()
        sex1 = individual.sex

        # update sex
        new_sex_for_api = "unknown"
        response = _admin_client.post(
            f"/update_patient_data/{individual_id}",
            data=f"gender_edit[]={new_sex_for_api}&feature[]=Abnormality of body height"
            "&feature[]=Multicystic kidney dysplasia"
            "&feature[]=Mode of inheritance&genes[]=TTLL5&genes[]=GAST",
            content_type="application/x-www-form-urlencoded",
        )
        assert response.status_code == 200

        # confirm observed data
        db_session.refresh(individual)
        observed_sex = individual.sex
        assert observed_sex == MAPPING_SEX_REPRESENTATIONS.get(new_sex_for_api), "Update sex did not work"
        observed_hpo_names = [x[1] for x in vi._get_feature_for_individual(individual, atype="observed")]
        assert len(observed_hpo_names) == 3, "Update HPOs did not work"
        unobserved_hpo_names = [x[1] for x in vi._get_feature_for_individual(individual, atype="unobserved")]
        assert len(unobserved_hpo_names) == 17, "Do not touch unobserved"
        assert "Abnormality of body height" in observed_hpo_names, "Update HPOs did not work"
        assert "Multicystic kidney dysplasia" in observed_hpo_names, "Update HPOs did not work"
        assert "Mode of inheritance" in observed_hpo_names, "Update HPOs did not work"
        observed_hpos = [x[0] for x in vi._get_feature_for_individual(individual, atype="observed")]
        assert len(observed_hpos) == 3, "Update HPOs did not work"
        assert "HP:0000002" in observed_hpos, "Update HPOs did not work"
        assert "HP:0000003" in observed_hpos, "Update HPOs did not work"
        assert "HP:0000005" in observed_hpos, "Update HPOs did not work"

        sex_org = MAPPING_SEX_REPRESENTATIONS.inverse.get(sex1)
        response = _admin_client.post(
            f"/update_patient_data/{individual_id}",
            data=f"gender_edit[]={sex_org}&feature[]=Abnormality of body height"
            "&feature[]=Multicystic kidney dysplasia"
            "&feature[]=Mode of inheritance&genes[]=TTLL5&genes[]=GAST",
            content_type="application/x-www-form-urlencoded",
        )
        assert response.status_code == 200
        db_session.refresh(individual)
        observed_sex = individual.sex
        assert observed_sex == sex1, "Update sex did not work"

        individual_id = "PH00009999"
        response = _admin_client.post(
            f"/update_patient_data/{individual_id}",
            data="genes[]=DRAM2",
            content_type="application/x-www-form-urlencoded",
        )
        assert response.status_code == 404, "Patient does not exist"


def test_create_individual_with_demo_user_fails(_demo_client):
    individual = Individual()
    individual.phenopolis_id = "PH00000000"
    response = _demo_client.post("/individual", json=individual.as_dict(), content_type="text/json")
    assert response.status_code == 405


@pytest.mark.parametrize(("sample", "sex"), (("for_test_Sample1", "U"), ("for_test_Sample2", "F")))
def test_create_individual_with_admin_user(_admin_client, sample, sex):
    individual = Individual()
    test_external_id = sample
    individual.external_id = test_external_id
    response = _admin_client.post("/individual", json=[individual.as_dict()], content_type="application/json")
    assert response.status_code == 400
    assert response.json == {"error": "Null individual", "success": False}, "Sex cannot be null"
    individual.sex = sex
    individual.consanguinity = "unknown"
    individual.genes = "DRAM2"
    individual.observed_features = "HP:0000001"
    response = _admin_client.post("/individual", json=[Individual().as_dict()], content_type="application/json")
    assert response.status_code == 400
    assert response.json == {"error": "Null individual", "success": False}, "Empty individual"
    response = _admin_client.post("/individual", json={}, content_type="application/json")
    assert response.status_code == 400
    assert response.json == {"error": "Empty payload or wrong formatting", "success": False}
    response = _admin_client.post("/individual", json="not_dict_nor_list", content_type="application/json")
    assert response.status_code == 400
    assert response.json == {"error": "Payload of unexpected type: <class 'str'>", "success": False}
    response = _admin_client.post("/individual", json=[individual.as_dict()], content_type="application/json")
    assert response.status_code == 200

    with session_scope() as db_session:
        observed_individual = db_session.query(Individual).filter(Individual.external_id == test_external_id).first()
        phenopolis_id = observed_individual.phenopolis_id
        assert observed_individual is not None, "Empty newly created individual"
        assert observed_individual.external_id == test_external_id
        assert observed_individual.sex.name == individual.sex
        assert observed_individual.consanguinity == individual.consanguinity

        response = _admin_client.post(
            f"/update_patient_data/{phenopolis_id}",
            data="genes[]=TTLL5",
            content_type="application/x-www-form-urlencoded",
        )

        assert response.status_code == 200, "Test empty features"

        # cleans the database
        _clean_test_individuals(_admin_client, db_session, test_external_id)


def test_create_individual_existing_individual_fails(_admin_client):
    individual = Individual()
    test_external_id = "for_test_Sample"
    individual.external_id = test_external_id
    individual.sex = "M"
    individual.genes = "DRAM2,TTLL5"
    individual.observed_features = "HP:0000001,HP:0000618"
    response = _admin_client.post("/individual", json=[individual.as_dict()], content_type="application/json")
    assert response.status_code == 200

    with session_scope() as db_session:
        observed_individual = db_session.query(Individual).filter(Individual.external_id == test_external_id).first()
        assert observed_individual is not None, "Empty newly created individual"

        # try to create the same individual again
        response = _admin_client.post("/individual", json=[individual.as_dict()], content_type="application/json")
        assert response.status_code == 400

        # cleans the database
        _clean_test_individuals(_admin_client, db_session, test_external_id)


def test_create_multiple_individuals(_admin_client):
    individual = Individual()
    test_external_id = "for_test_Sample"
    individual.external_id = test_external_id
    individual.sex = "M"
    individual.genes = "DRAM2"
    individual.observed_features = "HP:0000001"
    individual2 = Individual()
    test_external_id2 = "for_test_Sample2"
    individual2.external_id = test_external_id2
    individual2.sex = "F"
    response = _admin_client.post(
        "/individual", json=[individual.as_dict(), individual2.as_dict()], content_type="application/json"
    )
    assert response.status_code == 200

    with session_scope() as db_session:
        observed_individual = db_session.query(Individual).filter(Individual.external_id == test_external_id).first()
        assert observed_individual is not None, "Empty newly created individual"
        assert observed_individual.sex.name == individual.sex
        observed_individual2 = db_session.query(Individual).filter(Individual.external_id == test_external_id2).first()
        assert observed_individual2 is not None, "Empty newly created individual"
        assert observed_individual2.sex.name == individual2.sex

        # cleans the database
        _clean_test_individuals(_admin_client, db_session, test_external_id)
        _clean_test_individuals(_admin_client, db_session, test_external_id2)


def test_delete_individual(_admin_client):
    # creates an individual
    individual = Individual()
    test_external_id = "for_test_Sample"
    individual.external_id = test_external_id
    individual.sex = "M"
    response = _admin_client.post("/individual", json=[individual.as_dict()], content_type="application/json")
    assert response.status_code == 200

    # confirms existence of new individual
    with session_scope() as db_session:
        observed_individual = db_session.query(Individual).filter(Individual.external_id == test_external_id).first()
        assert observed_individual is not None, "Empty newly created individual"

        # deletes individual
        response = _admin_client.delete(
            f"/individual/{observed_individual.phenopolis_id}", content_type="application/json"
        )
        assert response.status_code == 200

        # confirms it does not exist
        observed_individual = db_session.query(Individual).filter(Individual.external_id == test_external_id).first()
        assert observed_individual is None, "Deletion was not successful"

        # try to delete non-existent individual
        response = _admin_client.delete("/individual/PH00000000", content_type="application/json")
        assert response.status_code == 404


def test_delete_individual_for_user(_nondemo_client):
    # creates an individual
    individual = Individual()
    test_external_id = "for_test_Sample"
    individual.external_id = test_external_id
    individual.sex = "M"
    response = _nondemo_client.post("/individual", json=[individual.as_dict()], content_type="application/json")
    assert response.status_code == 200

    # confirms existence of new individual
    with session_scope() as db_session:
        observed_individual = db_session.query(Individual).filter(Individual.external_id == test_external_id).first()
        assert observed_individual is not None, "Empty newly created individual"

        # deletes individual
        response = _nondemo_client.delete(
            f"/individual/{observed_individual.phenopolis_id}", content_type="application/json"
        )
        assert response.status_code == 200

        # confirms it does not exist
        observed_individual = db_session.query(Individual).filter(Individual.external_id == test_external_id).first()
        assert observed_individual is None, "Deletion was not successful"

        # try to delete non-existent individual
        response = _nondemo_client.delete("/individual/PH00000000", content_type="application/json")
        assert response.status_code == 404

        # try to delete a non-authorised patient for a given user
        response = _nondemo_client.delete("/individual/PH00008258", content_type="application/json")
        assert response.status_code == 404, "PH00008258 exists but access not authorised"


def test_get_all_individuals_default_page(_demo):
    response, status = get_all_individuals()
    assert status == 200
    individuals = response.json
    assert len(individuals) <= 100, "Page is greater than the maximum size of 100"
    assert len(individuals) > 0, "There are no results"
    for i in individuals:
        assert "demo" in i.get("users"), "User demo not in the list of users"
        assert len(i.get("users")) == 1, "Other users than demo are in the list"


def test_get_all_individuals_with_admin_default_page(_admin):
    vi.MAX_PAGE_SIZE = 5
    response, status = get_all_individuals()
    assert status == 400
    assert response.json == {"message": "The maximum page size for individuals is 5"}
    vi.MAX_PAGE_SIZE = 100000
    response, status = get_all_individuals()
    individuals = response.json
    assert len(individuals) <= 100, "Page is greater than the maximum size of 100"
    assert len(individuals) > 0, "There are no results"
    found_individual_multiple_users = False
    for i in individuals:
        assert "Admin" in i.get("users"), "User Admin not in the list of users"
        assert len(i.get("users")) >= 1, "Other users than demo are in the list"
        found_individual_multiple_users = found_individual_multiple_users or len(i.get("users")) > 1
    assert found_individual_multiple_users, "Only Admin user reported as users with access to individuals"


def test_get_all_individuals_with_pagination(_admin_client):

    response = _admin_client.get("/individual?limit=2&offset=0")
    assert response.status_code == 200
    first_page = response.json
    assert len(first_page) == 2

    response = _admin_client.get("/individual?limit=2&offset=2")
    assert response.status_code == 200
    second_page = response.json
    assert len(second_page) == 2

    # the third page
    response = _admin_client.get("/individual?limit=2&offset=4")
    assert response.status_code == 200
    third_page = response.json
    assert len(third_page) == 0

    # check elements between the pages are different
    internal_ids = [i.get("id") for i in first_page + second_page + third_page]
    assert len(set(internal_ids)) == 4


def test_get_individual_not_having_duplicated_keys(_admin):

    # test individual with homozygous variants
    individual_view = _get_view_individual_by_id(identifier="PH00008256")
    column_names = [c["key"] for c in individual_view.get("rare_homs").get("colNames")]
    assert len(column_names) == len(set(column_names)), "There are duplicated column names in the rare_homs"
    assert "#CHROM" not in column_names

    # test individuals with heterozygous and compound heterozygous
    individual_view = _get_view_individual_by_id(identifier="PH00008267")
    column_names = [c["key"] for c in individual_view.get("rare_comp_hets").get("colNames")]
    assert len(column_names) == len(set(column_names)), "There are duplicated column names in the rare_comp_hets"
    assert "#CHROM" not in column_names
    column_names = [c["key"] for c in individual_view.get("rare_variants").get("colNames")]
    assert len(column_names) == len(set(column_names)), "There are duplicated column names in the rare_variants"
    assert "#CHROM" not in column_names
    assert "'key': 'variant_id', 'name': 'Variant Id'," in str(individual_view), "Critical, must be present"


def _clean_test_individuals(client, db_session: Session, test_external_id):
    i = db_session.query(Individual).filter(Individual.external_id == test_external_id).first()
    db_session.query(Individual).filter(Individual.external_id == test_external_id).delete()
    with client.session_transaction() as session:
        db_session.query(UserIndividual).filter(UserIndividual.user == session[USER]).filter(
            UserIndividual.internal_id == i.phenopolis_id
        ).delete()
