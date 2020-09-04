import pytest
from dotenv import load_dotenv
from views import application, APP_ENV

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
