import unittest 
from varnorm.varcharkey import *

class TestVarCharKey(unittest.TestCase):
    
    def test_int2VarChar(self):
        i = 517248
        s = int2VarChar(i)
        self.assertEqual(varChar2Int(s), 517248)
        s = int2VarChar(i, strLength=32)
        self.assertEqual(varChar2Int(s), 517248)

    def test_seq2VarChar(self):
        seq = 'ATCGACG'
        varChar = seq2VarChar(seq)
        self.assertEqual(varChar2Seq(varChar), 'ATCGACG')

    def test_VarCharKey_equal(self):
        vck = VarCharKey('1', 11611, 11611, 'T', 'C')
        vck2 = VarCharKey('1', 11611, 11611, 'T', 'C')
        vck3 = VarCharKey('1', 11611, 11611, 'T', 'A')
        vck4 = VarCharKey('1', 11612, 11612, 'T', 'G')
        vck5 = VarCharKey('1', 11611, 11611, 'C', 'A', version="hg18")
        self.assertTrue(vck == vck2)
        self.assertTrue(vck != vck3)
        self.assertTrue(vck != vck4)
        self.assertTrue(vck != vck5)

    def test_v2k(self):
        vck = VarCharKey('1', 11611, 11611, 'T', 'C')
        self.assertEqual(VarCharKey.k2v(vck.key),('1', 11611, 11611, 'T', 'C'))
        vck2 = VarCharKey('1', 106574232, 106574236, 'CGTGT', 'C')
        self.assertEqual(VarCharKey.k2v(vck2.key),('1', 106574232, 106574236, 'CGTGT', 'C'))
        
        vck3 = VarCharKey('1', 11094757, 11094757, 'G', 'GA')
        self.assertEqual(VarCharKey.k2v(vck3.key),('1', 11094757, 11094757, 'G', 'GA'))
        

if __name__ == '__main__':
    testSuite = unittest.TestLoader().loadTestsFromTestCase(TestVarCharKey)
    unittest.TestVarCharKey(verbosity=2).run(testSuite)
