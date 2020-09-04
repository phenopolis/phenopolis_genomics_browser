"""
Pytest plugin to interact with the api at http level
"""

import json
from urllib.parse import urljoin

import pytest
import requests
from views import APP_ENV


@pytest.fixture(scope="function")
def api(api_url):
    api = Api(api_url)
    yield api
    for user in list(api.logged_in):
        api.logout(user)


if APP_ENV == "test":

    @pytest.fixture(scope="session")
    def app_server():
        from process_tests import TestProcess
        from process_tests import wait_for_strings

        with TestProcess("python", "application.py") as app_server:
            wait_for_strings(app_server.read, 10, "Running")
            print(app_server.read())
            yield app_server
            print("\n>>>>Teardown app_service")
            app_server.close()

    @pytest.fixture(scope="function")
    def api(api_url, app_server):
        api = Api(api_url)
        yield api
        for user in list(api.logged_in):
            api.logout(user)


def pytest_addoption(parser):
    parser.addoption(
        "--api-url", help="api url to test [default: %(default)s]", default="http://localhost:5000",
    )


@pytest.fixture(scope="session")
def api_url(request):
    """
    Return the api url configured by --api-url
    """
    return request.config.getoption("--api-url").rstrip("/")


# Users readily available in the test suite
users = {
    "demo": "demo123",
}


class Api:
    def __init__(self, url=None):
        self.url = url
        self.session = requests.Session()
        self.logged_in = set()

    def get(self, user, url, data=None, headers=None):
        return self._request("get", user, url, data=data, headers=headers)

    def put(self, user, url, data=None, headers=None):
        return self._request("put", user, url, data=data, headers=headers)

    def post(self, user, url, data=None, headers=None):
        return self._request("post", user, url, data=data, headers=headers)

    def patch(self, user, url, data=None, headers=None):
        return self._request("patch", user, url, data=data, headers=headers)

    def delete(self, user, url, data=None, headers=None):
        return self._request("delete", user, url, data=data, headers=headers)

    def _request(
        self, method_name, user, url, data=None, headers=None,
    ):
        if user:
            self.login(user)

        url = urljoin(self.url, url)

        hs = {"Content-Type": "application/json"}

        if headers is not None:
            hs.update(headers)

        method = getattr(self.session, method_name)
        if method_name in ("get", "options"):
            rv = method(url, params=data, headers=hs)
        elif method_name == "delete":
            if data:
                raise ValueError("data not supported with delete")
            rv = method(url, headers=hs)
        else:
            if data is not None:
                data = json.dumps(data)
            rv = method(url, data, headers=hs)

        return rv

    def login(self, user, password=None):
        if user in self.logged_in:
            return

        if password is None:
            assert user in users, f"test user {user} not available"
            password = users[user]

        resp = self.post(None, "/login", {"user": user, "password": password})
        assert resp.status_code == 200
        self.logged_in.add(user)

    def logout(self, user):
        if user not in self.logged_in:
            return

        resp = self.post(user, "/logout")
        assert resp.status_code == 200
        self.logged_in.remove(user)
