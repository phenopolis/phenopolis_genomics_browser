# coding: utf-8

from __future__ import absolute_import

from flask import json
from six import BytesIO

from swagger_server.models.inline_response200 import InlineResponse200  # noqa: E501
from swagger_server.models.variant_filters import VariantFilters  # noqa: E501
from swagger_server.test import BaseTestCase


class TestVariantsController(BaseTestCase):
    """VariantsController integration test stubs"""

    def test_find_variants_by_patient_or_gene_or_range(self):
        """Test case for find_variants_by_patient_or_gene_or_range

        Finds Variants by patient or gene or chrom:range
        """
        variantFilters = VariantFilters()
        response = self.client.open(
            '/v1/variants',
            method='POST',
            data=json.dumps(variantFilters),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    import unittest
    unittest.main()
