import unittest
from setup_tests import BaseTestCase

class LoginRequiredForQuery(BaseTestCase):
    def test_gene_query(self):
        response = self.client.get('gene/ENSG00000119685')
        self.assertTrue(b"Unauthenticated" in response.data)

    def test_variant_query(self):
        response = self.client.get('variant/22-38212762-A-G')
        self.assertTrue(b"Unauthenticated" in response.data)

    def test_individual_query(self):
        response = self.client.get('individual/PH00008258')
        self.assertTrue(b"Unauthenticated" in response.data)

    def test_hpo_query(self):
        response = self.client.get('hpo/HP:0000478')
        self.assertTrue(b"Unauthenticated" in response.data)

if __name__ == "__main__":
    unittest.main()



    