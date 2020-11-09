import pytest
from dotenv import load_dotenv
from views import application, APP_ENV
from views.auth import ADMIN_USER, USER, DEMO_USER

NONDEMO_USER = "nondemo"
load_dotenv(dotenv_path="./private.env")
pytest_plugins = ("tests.fix_api",)


def pytest_report_header(config):
    return ">>> APP_ENV: " + APP_ENV


@pytest.fixture
def _admin():
    with application.test_request_context(path="/login", method="POST", data={"user": "Admin", "password": "admin123"}):
        yield


@pytest.fixture(scope="module")
def _demo():
    with application.test_request_context(path="/login", method="POST", data={"user": "demo", "password": "demo123"}):
        yield


@pytest.fixture
def _admin_client():
    with application.test_client() as client:
        with client.session_transaction() as session:
            session[USER] = ADMIN_USER
        yield client


@pytest.fixture
def _demo_client():
    with application.test_client() as client:
        with client.session_transaction() as session:
            session[USER] = DEMO_USER
        yield client


@pytest.fixture
def _nondemo_client():
    with application.test_client() as client:
        with client.session_transaction() as session:
            session[USER] = NONDEMO_USER
        yield client


@pytest.fixture
def _not_logged_in_client():
    with application.test_client() as client:
        yield client
