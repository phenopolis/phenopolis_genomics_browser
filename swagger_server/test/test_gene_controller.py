# coding: utf-8

from __future__ import absolute_import

from flask import json
from six import BytesIO

from swagger_server.models.gene import Gene  # noqa: E501
from swagger_server.test import BaseTestCase


class TestGeneController(BaseTestCase):
    """GeneController integration test stubs"""

    def test_get_gene_by_id(self):
        """Test case for get_gene_by_id

        
        """
        query_string = [('id', 'id_example')]
        response = self.client.open(
            '/v1/gene',
            method='GET',
            query_string=query_string)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    import unittest
    unittest.main()
