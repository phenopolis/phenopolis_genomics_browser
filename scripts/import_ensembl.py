#!/bin/python
from pybiomart import Server
import pandas as pd

TRANSCRIPT_VERSION = "transcript_version"
UNIPROTSPTREMBL = "uniprotsptrembl"
GENE_GC_CONTENT = "percentage_gene_gc_content"
HGNC_SYMBOL = "hgnc_symbol"
HGNC_ID = "hgnc_id"
GENE_BIOTYPE = "gene_biotype"
BAND = "band"
END_POSITION = "end_position"
START_POSITION = "start_position"
DESCRIPTION = "description"
PEPTIDE_VERSION = "peptide_version"
VERSION = "version"
TRANSCRIPT_LENGTH = "transcript_length"
TRANSCRIPTION_START_SITE = "transcription_start_site"
END_PHASE = "end_phase"
PHASE = "phase"
RANK = "rank"
CONSTITUTIVE = "is_constitutive"
EXON_CHROM_END = "exon_chrom_end"
EXON_CHROM_START = "exon_chrom_start"
ENSEMBL_EXON_ID = "ensembl_exon_id"
CANONICAL = "canonical"
ASSEMBLY = "assembly"
UNIPROTSWISSPROT = "uniprotswissprot"
UNIPARC = "uniparc"
TRANSCRIPT_BIOTYPE = "transcript_biotype"
CDS_LENGTH = "cds_length"
TRANSCRIPT_END = "transcript_end"
TRANSCRIPT_START = "transcript_start"
STRAND = "strand"
CHROMOSOME_NAME = "chromosome_name"
ENSEMBL_PEPTIDE_ID = "ensembl_peptide_id"
ENSEMBL_TRANSCRIPT_ID = "ensembl_transcript_id"
ENSEMBL_GENE_ID = "ensembl_gene_id"


class BiomartReader(object):

    BIOMART_SERVER_URL_GRCH38 = "http://www.ensembl.org"  # use GRCh38
    DATASET = "hsapiens_gene_ensembl"
    MART = "ENSEMBL_MART_ENSEMBL"
    BIOMART_SERVER_URL_GRCH37 = "http://grch37.ensembl.org"  # use GRCh37

    def __init__(self, filters):
        self.filters = filters
        server_grch37 = Server(host=self.BIOMART_SERVER_URL_GRCH37)
        self.dataset_grch37 = server_grch37.marts[self.MART].datasets[self.DATASET]
        server_grch38 = Server(host=self.BIOMART_SERVER_URL_GRCH38)
        self.dataset_grch38 = server_grch38.marts[self.MART].datasets[self.DATASET]

    def get_genes(self) -> pd.DataFrame:
        genes_attributes = [
            ENSEMBL_GENE_ID,
            VERSION,
            DESCRIPTION,
            CHROMOSOME_NAME,
            START_POSITION,
            END_POSITION,
            STRAND,
            BAND,
            GENE_BIOTYPE,
            HGNC_ID,
            HGNC_SYMBOL,
            GENE_GC_CONTENT
        ]

        genes_grch37, genes_grch38 = self._get_attributes(genes_attributes)
        return pd.concat([genes_grch37, genes_grch38])

    def get_transcripts(self):
        transcripts_attributes = [
            ENSEMBL_GENE_ID,
            ENSEMBL_TRANSCRIPT_ID,
            TRANSCRIPT_VERSION,
            ENSEMBL_PEPTIDE_ID,
            PEPTIDE_VERSION,
            CHROMOSOME_NAME,
            TRANSCRIPT_START,
            TRANSCRIPT_END,
            TRANSCRIPTION_START_SITE,
            STRAND,
            TRANSCRIPT_LENGTH,
            CDS_LENGTH,
            TRANSCRIPT_BIOTYPE,
            UNIPARC,
            UNIPROTSWISSPROT
        ]

        transcripts_grch37, transcripts_grch38 = self._get_attributes(transcripts_attributes)

        # adds the canonical flag for both assemblies independently
        transcripts_grch37[CANONICAL] = self._add_canonical_transcript_flag(transcripts_grch37)
        transcripts_grch38[CANONICAL] = self._add_canonical_transcript_flag(transcripts_grch38)

        # TODO: add the number of exons

        return pd.concat([transcripts_grch37, transcripts_grch38])

    def get_exons(self):
        exons_attributes = [
            ENSEMBL_GENE_ID,
            ENSEMBL_TRANSCRIPT_ID,
            ENSEMBL_EXON_ID,
            CHROMOSOME_NAME,
            EXON_CHROM_START,
            EXON_CHROM_END,
            CONSTITUTIVE,
            RANK,
            PHASE,
            END_PHASE
        ]

        exons_grch37, exons_grch38 = self._get_attributes(exons_attributes)
        return pd.concat([exons_grch37, exons_grch38])

    @staticmethod
    def _add_canonical_transcript_flag(transcripts: pd.DataFrame) -> pd.Series:
        """
        Adds a column indicating whether the transcript is canonical
        If more than one transcript chooses the one with the longest CDS trying to replicate the
        definition here http://www.ensembl.org/Help/Glossary
        """
        canonical_transcripts = transcripts.groupby(ENSEMBL_GENE_ID)[[ENSEMBL_TRANSCRIPT_ID, CDS_LENGTH]].max()
        canonical_transcripts.reset_index(inplace=True)
        return transcripts[ENSEMBL_TRANSCRIPT_ID].isin(
            canonical_transcripts[ENSEMBL_TRANSCRIPT_ID])

    def _get_attributes(self, transcripts_attributes):
        # reads the transcripts from biomart
        transcripts_grch37 = self.dataset_grch37.query(
            attributes=transcripts_attributes,
            filters=self.filters,
            use_attr_names=True
        )
        transcripts_grch38 = self.dataset_grch38.query(
            attributes=transcripts_attributes,
            filters=self.filters,
            use_attr_names=True
        )
        # sets the assembly for each
        transcripts_grch37[ASSEMBLY] = "GRCh37"
        transcripts_grch38[ASSEMBLY] = "GRCh38"
        return transcripts_grch37, transcripts_grch38


if __name__ == "__main__":
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
        "transcript_biotype": [
            "protein_coding",
            "IG_C_gene",
            "IG_D_gene",
            "IG_J_gene",
            "IG_V_gene",
            "TR_C_gene",
            "TR_D_gene",
            "TR_J_gene",
            "TR_V_gene",
        ],
        "transcript_gencode_basic": "only",
    }
    reader = BiomartReader(filters=filters)
    genes = reader.get_genes()
    genes.to_csv("genes.csv", index=False, header=True)
    transcripts = reader.get_transcripts()
    transcripts.to_csv("transcripts.csv", index=False, header=True)
    exons = reader.get_exons()
    exons.to_csv("exons.csv", index=False, header=True)
