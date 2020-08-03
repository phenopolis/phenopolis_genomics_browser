import pytest
from dotenv import load_dotenv
from views import application

load_dotenv(dotenv_path="./private.env")


@pytest.fixture
def _admin():
    with application.test_request_context(path="/login", method="POST", data={"user": "Admin", "password": "admin123"}):
        yield


@pytest.fixture(scope="module")
def _demo():
    with application.test_request_context(path="/login", method="POST", data={"user": "demo", "password": "demo123"}):
        yield


@pytest.fixture
def _nouser():
    with application.test_request_context(path="/login", method="POST", data={"user": "nodemo", "password": "wrong"}):
        yield
