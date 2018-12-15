# coding: utf-8

from __future__ import absolute_import

from flask import json
from six import BytesIO

from swagger_server.models.hpo import HPO  # noqa: E501
from swagger_server.test import BaseTestCase


class TestPhenotypeController(BaseTestCase):
    """PhenotypeController integration test stubs"""

    def test_get_hp_oby_id(self):
        """Test case for get_hp_oby_id

        Returns Human Phenotype Ontology (HPO)
        """
        response = self.client.open(
            '/v1/hpo/',
            method='GET')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    import unittest
    unittest.main()
