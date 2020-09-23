#!/usr/bin/env python3
from typing import List, Tuple

from pybiomart import Server
import pandas as pd
import re
import logging
import time

SYNONYM = "external_synonym"
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
            GENE_GC_CONTENT,
        ]

        genes_grch37, genes_grch38 = self._get_attributes(genes_attributes)

        # flags the latest version genes to avoid repetitions
        genes_grch37["latest"] = self._add_latest_flag(df=genes_grch37, id_field=ENSEMBL_GENE_ID, version_field=VERSION)
        genes_grch38["latest"] = self._add_latest_flag(df=genes_grch38, id_field=ENSEMBL_GENE_ID, version_field=VERSION)

        genes = pd.concat([genes_grch37, genes_grch38])
        genes.reset_index(drop=True, inplace=True)

        # filter out non latest genes
        genes = genes[genes.latest]
        genes.drop("latest", axis=1, inplace=True)

        # remove duplicates
        genes.drop_duplicates([ENSEMBL_GENE_ID, ASSEMBLY], inplace=True)

        # edit description to remove information between brackets
        genes[DESCRIPTION] = genes[DESCRIPTION].transform(
            lambda x: re.sub(r"\[.*\]", "", x).strip() if isinstance(x, str) else x
        )

        BiomartReader._genes_sanity_checks(genes)

        return genes

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
        ]

        transcripts_grch37, transcripts_grch38 = self._get_attributes(transcripts_attributes)

        # adds the canonical flag for both assemblies independently
        transcripts_grch37[CANONICAL] = self._add_canonical_transcript_flag(transcripts_grch37)
        transcripts_grch38[CANONICAL] = self._add_canonical_transcript_flag(transcripts_grch38)

        # flags the latest version genes to avoid repetitions
        transcripts_grch37["latest"] = self._add_latest_flag(
            df=transcripts_grch37, id_field=ENSEMBL_TRANSCRIPT_ID, version_field=TRANSCRIPT_VERSION
        )
        transcripts_grch38["latest"] = self._add_latest_flag(
            df=transcripts_grch38, id_field=ENSEMBL_TRANSCRIPT_ID, version_field=TRANSCRIPT_VERSION
        )

        transcripts = pd.concat([transcripts_grch37, transcripts_grch38])
        transcripts.reset_index(drop=True, inplace=True)

        # filter out non latest genes
        transcripts = transcripts[transcripts.latest]
        transcripts.drop("latest", axis=1, inplace=True)

        BiomartReader._transcripts_sanity_checks(transcripts)

        return transcripts

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
            END_PHASE,
        ]

        exons_grch37, exons_grch38 = self._get_attributes(exons_attributes)
        exons = pd.concat([exons_grch37, exons_grch38])
        exons.reset_index(drop=True, inplace=True)

        BiomartReader._exons_sanity_checks(exons)

        return exons

    def get_gene_synonyms(self, genes: pd.DataFrame) -> pd.DataFrame:
        synonym_attributes = [ENSEMBL_GENE_ID, SYNONYM]
        synonyms_grch37, synonyms_grch38 = self._get_attributes(synonym_attributes)
        synonyms = pd.concat([synonyms_grch37, synonyms_grch38])
        # map synonyms to internal gene ids
        synonyms = genes[["identifier", ENSEMBL_GENE_ID, ASSEMBLY]].join(
            synonyms[[SYNONYM, ENSEMBL_GENE_ID, ASSEMBLY]].set_index([ENSEMBL_GENE_ID, ASSEMBLY]),
            on=[ENSEMBL_GENE_ID, ASSEMBLY],
        )[["identifier", SYNONYM]]
        # remove empty synonyms
        synonyms.rename({"identifier": "gene"}, axis=1, inplace=True)
        synonyms.dropna(inplace=True)
        return synonyms

    def get_uniprot(self, trancripts: pd.DataFrame) -> pd.DataFrame:
        uniprot_attributes = [ENSEMBL_TRANSCRIPT_ID, UNIPROTSWISSPROT]
        uniprot_grch37, uniprot_grch38 = self._get_attributes(uniprot_attributes)
        uniprot = pd.concat([uniprot_grch37, uniprot_grch38])
        # map synonyms to internal gene ids
        uniprot = trancripts[["identifier", ENSEMBL_TRANSCRIPT_ID, ASSEMBLY]].join(
            uniprot[[UNIPROTSWISSPROT, ENSEMBL_TRANSCRIPT_ID, ASSEMBLY]].set_index([ENSEMBL_TRANSCRIPT_ID, ASSEMBLY]),
            on=[ENSEMBL_TRANSCRIPT_ID, ASSEMBLY],
        )[["identifier", UNIPROTSWISSPROT]]
        # remove empty synonyms
        uniprot.rename({"identifier": "transcript"}, axis=1, inplace=True)
        uniprot.dropna(inplace=True)
        return uniprot

    @staticmethod
    def _add_canonical_transcript_flag(transcripts: pd.DataFrame) -> pd.Series:
        """
        Adds a column indicating whether the transcript is canonical
        If more than one transcript chooses the one with the longest CDS trying to replicate the
        definition here http://www.ensembl.org/Help/Glossary
        """
        canonical_transcripts = transcripts.groupby(ENSEMBL_GENE_ID)[[ENSEMBL_TRANSCRIPT_ID, CDS_LENGTH]].max()
        canonical_transcripts.reset_index(inplace=True)
        return transcripts[ENSEMBL_TRANSCRIPT_ID].isin(canonical_transcripts[ENSEMBL_TRANSCRIPT_ID])

    @staticmethod
    def _add_latest_flag(df: pd.DataFrame, id_field: str, version_field: str) -> pd.Series:
        """
        Adds a column indicating whether the gene version is the latest in this table
        """
        id_with_version = "id_with_version"
        df[id_with_version] = df[[id_field, version_field]].apply(lambda x: "{}.{}".format(x[0], x[1]), axis=1)
        latest = df.groupby(id_field)[[id_with_version, version_field]].max()
        latest.reset_index(inplace=True)
        is_latest = df[id_with_version].isin(latest[id_with_version])
        df.drop(id_with_version, axis=1, inplace=True)
        return is_latest

    @staticmethod
    def _filter_empty_values_from_list(list_with_empty_values):
        return list(filter(lambda x: x is not None and x != "", list(list_with_empty_values)))

    def _get_attributes(self, attributes: List) -> Tuple[pd.DataFrame, pd.DataFrame]:
        # reads the transcripts from biomart
        transcripts_grch37 = self.dataset_grch37.query(attributes=attributes, filters=self.filters, use_attr_names=True)
        transcripts_grch38 = self.dataset_grch38.query(attributes=attributes, filters=self.filters, use_attr_names=True)
        # sets the assembly for each
        transcripts_grch37[ASSEMBLY] = "GRCh37"
        transcripts_grch38[ASSEMBLY] = "GRCh38"
        return transcripts_grch37, transcripts_grch38

    @staticmethod
    def _genes_sanity_checks(genes: pd.DataFrame) -> None:
        unique_genes = (
            genes[[ENSEMBL_GENE_ID, ASSEMBLY]].apply(lambda x: "{}.{}".format(x[0], x[1]), axis=1).value_counts()
        )
        assert unique_genes[unique_genes > 1].shape[0] == 0, "Found non unique genes: {}".format(
            unique_genes[unique_genes > 1]
        )
        assert genes.ensembl_gene_id.isna().sum() == 0, "Found entry without ensembl id"
        assert genes.assembly.isna().sum() == 0, "Found entry without assembly"
        assert genes.chromosome_name.isna().sum() == 0, "Found entry without chromosome"
        assert genes.start_position.isna().sum() == 0, "Found entry without start"
        assert genes.end_position.isna().sum() == 0, "Found entry without end"
        assert genes[genes.start_position > genes.end_position].shape[0] == 0, "Start and end positions incoherent"

    @staticmethod
    def _transcripts_sanity_checks(transcripts: pd.DataFrame) -> None:
        unique_transcripts = (
            transcripts[[ENSEMBL_TRANSCRIPT_ID, ASSEMBLY]]
            .apply(lambda x: "{}.{}".format(x[0], x[1]), axis=1)
            .value_counts()
        )
        assert unique_transcripts[unique_transcripts > 1].shape[0] == 0, "Found non unique genes: {}".format(
            unique_transcripts[unique_transcripts > 1]
        )
        assert transcripts.ensembl_transcript_id.isna().sum() == 0, "Found entry without ensembl id"
        assert transcripts.ensembl_gene_id.isna().sum() == 0, "Found entry without gene ensembl id"
        assert transcripts.assembly.isna().sum() == 0, "Found entry without assembly"
        assert transcripts.chromosome_name.isna().sum() == 0, "Found entry without chromosome"
        assert transcripts.transcript_start.isna().sum() == 0, "Found entry without start"
        assert transcripts.transcript_end.isna().sum() == 0, "Found entry without end"
        assert (
            transcripts[transcripts.transcript_start > transcripts.transcript_end].shape[0] == 0
        ), "Start and end positions incoherent"

    @staticmethod
    def _exons_sanity_checks(exons: pd.DataFrame) -> None:
        unique_exons = (
            exons[[ENSEMBL_TRANSCRIPT_ID, ENSEMBL_EXON_ID, ASSEMBLY]]
            .apply(lambda x: "{}.{}.{}".format(x[0], x[1], x[2]), axis=1)
            .value_counts()
        )
        assert unique_exons[unique_exons > 1].shape[0] == 0, "Found non unique exons: {}".format(
            unique_exons[unique_exons > 1]
        )
        unique_exons_by_rank = (
            exons[[ENSEMBL_TRANSCRIPT_ID, "rank", ASSEMBLY]]
            .apply(lambda x: "{}.{}.{}".format(x[0], x[1], x[2]), axis=1)
            .value_counts()
        )
        assert (
            unique_exons_by_rank[unique_exons_by_rank > 1].shape[0] == 0
        ), "Found non unique exons by rank: {}".format(unique_exons_by_rank[unique_exons_by_rank > 1])
        assert exons.ensembl_exon_id.isna().sum() == 0, "Found entry without ensembl id"
        assert exons.ensembl_transcript_id.isna().sum() == 0, "Found entry without transcript ensembl id"
        assert exons.ensembl_gene_id.isna().sum() == 0, "Found entry without gene ensembl id"
        assert exons.assembly.isna().sum() == 0, "Found entry without assembly"
        assert exons.chromosome_name.isna().sum() == 0, "Found entry without chromosome"
        assert exons.exon_chrom_start.isna().sum() == 0, "Found entry without start"
        assert exons.exon_chrom_end.isna().sum() == 0, "Found entry without end"
        assert exons[exons.exon_chrom_start > exons.exon_chrom_end].shape[0] == 0, "Start and end positions incoherent"


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
        # "chromosome_name": "22"   # use for testing
    }
    logging.warning("Starting...")
    start_time = time.time()
    reader = BiomartReader(filters=filters)

    genes = reader.get_genes()
    genes.index.rename("identifier", inplace=True)
    genes.index += 1
    genes.to_csv("genes.csv", index=True, header=True)

    transcripts = reader.get_transcripts()
    transcripts.index.rename("identifier", inplace=True)
    transcripts.index += 1
    transcripts.to_csv("transcripts.csv", index=True, header=True)

    exons = reader.get_exons()
    exons.index.rename("identifier", inplace=True)
    exons.index += 1
    exons.to_csv("exons.csv", index=True, header=True)

    genes.reset_index(inplace=True)
    transcripts.reset_index(inplace=True)
    exons.reset_index(inplace=True)

    synonyms = reader.get_gene_synonyms(genes=genes)
    synonyms.to_csv("gene_synonyms.csv", index=False, header=True)

    uniprot = reader.get_uniprot(trancripts=transcripts)
    uniprot.to_csv("transcripts_uniprot.csv", index=False, header=True)

    genes_transcripts = genes[["identifier", ENSEMBL_GENE_ID]].join(
        transcripts[["identifier", ENSEMBL_GENE_ID]].set_index(ENSEMBL_GENE_ID),
        on=ENSEMBL_GENE_ID,
        lsuffix="_gene",
        rsuffix="_transcript",
    )[["identifier_gene", "identifier_transcript"]]
    genes_transcripts.rename({"identifier_gene": "gene", "identifier_transcript": "transcript"}, axis=1, inplace=True)
    genes_transcripts.to_csv("genes_transcripts.csv", index=False, header=True)

    transcripts_exons = transcripts[["identifier", ENSEMBL_TRANSCRIPT_ID]].join(
        exons[["identifier", ENSEMBL_TRANSCRIPT_ID]].set_index(ENSEMBL_TRANSCRIPT_ID),
        on=ENSEMBL_TRANSCRIPT_ID,
        lsuffix="_transcript",
        rsuffix="_exon",
    )[["identifier_transcript", "identifier_exon"]]
    transcripts_exons.rename({"identifier_exon": "exon", "identifier_transcript": "transcript"}, axis=1, inplace=True)
    transcripts_exons.to_csv("transcripts_exons.csv", index=False, header=True)

    end_time = time.time()
    logging.warning("Finished in {} seconds".format(end_time - start_time))
