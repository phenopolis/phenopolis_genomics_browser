#!/bin/python
from pybiomart import Server


class BiomartGeneAnnotationsReader(object):

    # BIOMART_SERVER_URL = 'http://www.ensembl.org'     # use GRCh38
    DATASET = 'hsapiens_gene_ensembl'
    MART = 'ENSEMBL_MART_ENSEMBL'
    BIOMART_SERVER_URL = 'http://grch37.ensembl.org'    # use GRCh37

    def __init__(self, filters):
        self.filters = filters
        server = Server(host=self.BIOMART_SERVER_URL)
        self.dataset = (server.marts[self.MART].datasets[self.DATASET])

    def get_genes(self):
        return self.dataset.query(
            attributes=['ensembl_gene_id',
                        'ensembl_gene_id_version',
                        'ensembl_peptide_id',
                        'ensembl_peptide_id_version',
                        'description',
                        'chromosome_name',
                        'start_position',
                        'end_position',
                        'strand',
                        #'band',
                        #'gene_biotype',
                        'hgnc_id',
                        'hgnc_symbol'],
            filters=self.filters)

    def get_canonical_transcripts(self):
        transcripts = self.dataset.query(
            attributes=['ensembl_gene_id',
                        'ensembl_transcript_id',
                        'ensembl_transcript_id_version',
                        'transcript_start',
                        'transcript_end',
                        'cds_length'],
            filters=self.filters)
        # if more than one transcript chooses the one with the longest CDS trying to replicate the
        # definition here http://www.ensembl.org/Help/Glossary
        canonical_transcripts = transcripts.groupby('Gene stable ID')[['Transcript stable ID', 'CDS Length']].max()
        canonical_transcripts.reset_index(inplace=True)
        return transcripts[transcripts['Transcript stable ID'].isin(canonical_transcripts['Transcript stable ID'])]

    def get_gene_synonyms(self):
        gene_synonyms_df = self.dataset.query(attributes=['ensembl_gene_id', 'external_synonym'], filters=self.filters)
        return gene_synonyms_df.fillna('').groupby(by='Gene stable ID')['Gene Synonym'].apply(list)

    def load_data(self):
        canonical_transcripts = self.get_canonical_transcripts()
        gene_synonyms = self.get_gene_synonyms()
        genes = self.get_genes()
        return genes.join(
            canonical_transcripts.set_index('Gene stable ID'), on=['Gene stable ID']).join(
            gene_synonyms, on=['Gene stable ID']).drop_duplicates(subset='Gene stable ID')

    @staticmethod
    def transform_data_to_phenopolis_schema(data):
        # stop,gene_id,chrom,strand,full_gene_name,gene_name_upper,other_names,canonical_transcript,start,xstop,
        # xstart,gene_name
        # 111682839,ENSG00000156171,1,-,DNA-damage regulated autophagy modulator 2,DRAM2,
        # "[""PRO180"",""RP5-1180E21.1"",""CORD21"",""WWFQ154"",""MGC54289"",""TMEM77""]",ENST00000286692,111659956,
        # 1111682839,1111659956,DRAM2
        columns_renaming = {
            'Gene stable ID': 'gene_id',
            'Gene description': 'full_gene_name',
            'Chromosome/scaffold name': 'chrom',
            'Gene start (bp)': 'start',
            'Gene end (bp)': 'stop',
            'Strand': 'strand',
            'HGNC symbol': 'gene_name',
            'Transcript stable ID': 'canonical_transcript',
            'Transcript start (bp)': 'xstart',
            'Transcript end (bp)': 'xstop',
            'Gene Synonym': 'other_names'
        }
        phenopolis_df = data[list(columns_renaming.keys())].rename(columns=columns_renaming)
        phenopolis_df['gene_name_upper'] = phenopolis_df['gene_name'].transform(lambda x: str(x).upper())
        phenopolis_df['other_names'] = phenopolis_df['other_names'].transform(lambda x: [y.upper() for y in x])
        return phenopolis_df


if __name__ == '__main__':
    # possible transcript biotypes
    # "[3prime_overlapping_ncRNA,antisense_RNA,bidirectional_promoter_lncRNA,IG_C_gene,IG_C_pseudogene,
    # IG_D_gene,IG_J_gene,IG_J_pseudogene,IG_pseudogene,IG_V_gene,IG_V_pseudogene,lincRNA,macro_lncRNA,
    # miRNA,misc_RNA,Mt_rRNA,Mt_tRNA,non_coding,polymorphic_pseudogene,processed_pseudogene,processed_transcript,
    # protein_coding,pseudogene,ribozyme,rRNA,scaRNA,scRNA,sense_intronic,sense_overlapping,snoRNA,snRNA,sRNA,
    # TEC,transcribed_processed_pseudogene,transcribed_unitary_pseudogene,transcribed_unprocessed_pseudogene,
    # translated_processed_pseudogene,TR_C_gene,TR_D_gene,TR_J_gene,TR_J_pseudogene,TR_V_gene,TR_V_pseudogene,
    # unitary_pseudogene,unprocessed_pseudogene,vaultRNA]"
    # from http://www.ensembl.org/info/genome/genebuild/biotypes.html
    # GENCODE basic: "A subset of the GENCODE transcript set, containing only 5' and 3' complete transcripts."
    # from http://www.ensembl.org/Help/Glossary
    filters = {
        'transcript_biotype': ['protein_coding', 'IG_C_gene', 'IG_D_gene', 'IG_J_gene', 'IG_V_gene', 'TR_C_gene',
                               'TR_D_gene', 'TR_J_gene', 'TR_V_gene'],
        'transcript_gencode_basic': 'only'
    }
    reader = BiomartGeneAnnotationsReader(filters=filters)
    data = reader.load_data()
    phenopolis_data = reader.transform_data_to_phenopolis_schema(data)
    phenopolis_data.to_csv('genes.csv', index=False, header=True)
