#!/bin/python
from pybiomart import Server
import numpy as np
import pandas as pd


class BiomartGeneAnnotationsReader(object):

    BIOMART_SERVER_URL_GRCH38 = 'http://www.ensembl.org'     # use GRCh38
    DATASET = 'hsapiens_gene_ensembl'
    MART = 'ENSEMBL_MART_ENSEMBL'
    BIOMART_SERVER_URL_GRCH37 = 'http://grch37.ensembl.org'    # use GRCh37

    def __init__(self, filters):
        self.filters = filters
        server_grch37 = Server(host=self.BIOMART_SERVER_URL_GRCH37)
        self.dataset_grch37 = (server_grch37.marts[self.MART].datasets[self.DATASET])
        server_grch38 = Server(host=self.BIOMART_SERVER_URL_GRCH38)
        self.dataset_grch38 = (server_grch38.marts[self.MART].datasets[self.DATASET])

    def _get_genes(self):
        return self.dataset_grch37.query(
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

    def _get_gene_symbols_grch38(self):
        return self.dataset_grch38.query(
            attributes=['ensembl_gene_id',
                        'hgnc_symbol'],
            filters=self.filters)

    def _get_canonical_transcripts(self):
        transcripts = self.dataset_grch37.query(
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

    def _get_gene_synonyms(self, dataset):
        gene_synonyms_df = dataset.query(attributes=['ensembl_gene_id', 'external_synonym'], filters=self.filters)
        return gene_synonyms_df.fillna('').groupby(by='Gene stable ID')['Gene Synonym'].apply(list)

    @staticmethod
    def _merge_synonyms(synonyms_grch37, synonyms_grch38):
        return list(set(BiomartGeneAnnotationsReader._filter_empty_values_from_list(synonyms_grch37) +
                        BiomartGeneAnnotationsReader._filter_empty_values_from_list(synonyms_grch38)))

    @staticmethod
    def _filter_empty_values_from_list(list_with_empty_values):
        return list(filter(lambda x: x is not None and x != '', list(list_with_empty_values)))

    @staticmethod
    def _add_gene_symbol_to_synonyms(synonyms, gene_symbol):
        if gene_symbol is not None and gene_symbol != '' and not pd.isna(gene_symbol):
            synonyms.append(gene_symbol)
        return synonyms

    def load_data(self):
        canonical_transcripts = self._get_canonical_transcripts()
        gene_synonyms_grch37 = self._get_gene_synonyms(dataset=self.dataset_grch37)
        gene_synonyms_grch38 = self._get_gene_synonyms(dataset=self.dataset_grch38)
        gene_symbols_grch38 = self._get_gene_symbols_grch38()
        genes = self._get_genes()

        # merges the synonyms from GRCh37 and GRCh38
        gene_synonyms = gene_synonyms_grch37.reset_index().join(
            gene_synonyms_grch38, on=['Gene stable ID'], rsuffix='_grch38').fillna('')
        gene_synonyms['Gene Synonym'] = gene_synonyms[['Gene Synonym', 'Gene Synonym_grch38']].apply(
            lambda x: BiomartGeneAnnotationsReader._merge_synonyms(x[0], x[1]), axis=1)
        del gene_synonyms['Gene Synonym_grch38']

        data = genes.join(
            canonical_transcripts.set_index('Gene stable ID'), on=['Gene stable ID']).join(
            gene_synonyms_grch37, on=['Gene stable ID']).drop_duplicates(subset='Gene stable ID').join(
            gene_symbols_grch38.set_index('Gene stable ID'), on=['Gene stable ID'], rsuffix='_grch38')
        # add gene symbol from GRCh38 into list of synonyms
        data['Gene Synonym'] = data[['Gene Synonym', 'HGNC symbol_grch38']].apply(
            lambda x: self._add_gene_symbol_to_synonyms(synonyms=x[0], gene_symbol=x[1]), axis=1)
        del data['HGNC symbol_grch38']
        # clean empty values from list of synonyms
        data['Gene Synonym'] = data['Gene Synonym'].transform(
            lambda x: BiomartGeneAnnotationsReader._filter_empty_values_from_list(x))
        return data

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
