# coding: utf-8

from __future__ import absolute_import

from flask import json
from six import BytesIO

from swagger_server.models.variant import Variant  # noqa: E501
from swagger_server.test import BaseTestCase


class TestVariantController(BaseTestCase):
    """VariantController integration test stubs"""

    def test_get_variant_by_id(self):
        """Test case for get_variant_by_id

        Find variant by ID
        """
        response = self.client.open(
            '/v1/variant/{variantId}'.format(variantId=789),
            method='GET')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    import unittest
    unittest.main()
