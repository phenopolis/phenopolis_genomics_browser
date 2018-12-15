# coding: utf-8

from __future__ import absolute_import

from flask import json
from six import BytesIO

from swagger_server.models.patient import Patient  # noqa: E501
from swagger_server.test import BaseTestCase


class TestPatientController(BaseTestCase):
    """PatientController integration test stubs"""

    def test_get_patient_by_id(self):
        """Test case for get_patient_by_id

        Returns patient
        """
        response = self.client.open(
            '/v1/patient',
            method='GET')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    import unittest
    unittest.main()
