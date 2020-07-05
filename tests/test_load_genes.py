from unittest import TestCase

from db.reference_data.load_genes import BiomartGeneAnnotationsReader


class TestBiomartGeneAnnotationsReader(TestCase):

    def test_loading(self):
        filters = {
            'chromosome_name': '22',
            'transcript_biotype': ['protein_coding', 'IG_C_gene', 'IG_D_gene', 'IG_J_gene', 'IG_V_gene', 'TR_C_gene',
                                   'TR_D_gene', 'TR_J_gene', 'TR_V_gene'],
            'transcript_gencode_basic': 'only'
        }

        reader = BiomartGeneAnnotationsReader(filters=filters)
        data = reader.load_data()
        self.assertIsNotNone(data)
        self.assertEqual(data.shape, (495, 17))
        self.assertEqual(data['Gene stable ID'].unique().shape, (495,))    # no repeated genes
        self.assertTrue(len(list(filter(lambda x: "" in x,  list(data['Gene Synonym'])))) == 0)     # no empty synonyms

        phenopolis_data = BiomartGeneAnnotationsReader.transform_data_to_phenopolis_schema(data)
        self.assertIsNotNone(phenopolis_data)
        self.assertEqual(phenopolis_data.shape, (495, 12))     # same number of genes, less columns
