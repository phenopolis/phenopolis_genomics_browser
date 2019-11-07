import unittest
from setup_tests import LoggedInTestCase

class GeneTestCase(LoggedInTestCase):

    def test_query_gene_id(self):
        response = self.client.get('gene/ENSG00000119685')
        self.assertTrue(b"tubulin tyrosine ligase-like family, member 5" in response.data)
    
    def test_query_gene_name(self):
        response = self.client.get('gene/TTLL5')
        self.assertTrue(b"tubulin tyrosine ligase-like family, member 5" in response.data)
        
    def test_query_other_names(self):
        other_names = ["KIAA0998","CORD19","STAMP"]
        responses = [self.client.get('gene/%s' % other_name) for other_name in other_names]
        for response in responses:
            self.assertTrue(b"tubulin tyrosine ligase-like family, member 5" in response.data)
    
    def test_no_result(self):
        pass
        # how to test for session timeout??
        # response = self.client.get('gene/nonsensegenethatdoesnotexist')
        # self.assertTrue(b"code:500" in response.data)
    
    def test_variants_appear(self):
        response = self.client.get('gene/ENSG00000119685')
        self.assertTrue(b"variant_id" in response.data)
    

if __name__ == "__main__":
    unittest.main()
