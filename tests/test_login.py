import unittest
from setup_tests import BaseTestCase


class LoginTestCase(BaseTestCase):
    def test_successful_login(self):
        response = self.login(name="demo", password="demo123")
        self.assertTrue(b"Authenticated" in response.data)

    def test_unsuccessful_login(self):
        response = self.login(name="demo", password="wrongpassword")
        self.assertTrue(b"Invalid Credentials. Please try again." in response.data)

    def test_logout(self):
        response = self.client.post("/logout")
        self.assertTrue(b"logged out" in response.data)


if __name__ == "__main__":
    unittest.main()
