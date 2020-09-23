
create table gene (
    identifier integer primary key,
    ensembl_gene_id text not null,
    version smallint,
    description text,
    chromosome_name text not null,
    start_position integer not null,
    end_position integer not null,
    strand smallint not null,
    band text,
    gene_biotype text,
    hgnc_id text,
    hgnc_symbol text,
    percentage_gene_gc_content real,
    assembly text
    );

create index ON gene USING btree (hgnc_symbol);
create index ON gene USING btree (hgnc_id);
create index ON gene USING btree (ensembl_gene_id);

create table transcript (
    identifier integer primary key,
    ensembl_gene_id text not null,
    ensembl_transcript_id text not null,
    transcript_version smallint,
    ensembl_peptide_id text,
    peptide_version smallint,
    chromosome_name text not null,
    transcript_start integer not null,
    transcript_end integer not null,
    transcription_start_site integer,
    strand smallint not null,
    transcript_length integer,
    cds_length integer,
    transcript_biotype text,
    uniparc text,
    assembly text,
    canonical boolean
);

create index ON transcript USING btree (ensembl_gene_id);
create index ON transcript USING btree (ensembl_transcript_id);

create table gene_transcript (
    identifier_gene integer,
    identifier_transcript integer,
    primary key(identifier_gene, identifier_transcript)
);

create table gene_synonym (
    identifier integer,
    external_synonym text,
    primary key(identifier, external_synonym)
);

create index ON gene_synonym USING btree (external_synonym);

create table transcript_uniprot (
    identifier integer,
    uniprotswissprot text,
    primary key(identifier, uniprotswissprot)
);

create index ON transcript_uniprot USING btree (uniprotswissprot);

create table exon (
    identifier integer primary key,
    ensembl_gene_id text not null,
    ensembl_transcript_id text not null,
    ensembl_exon_id text not null,
    chromosome_name text not null,
    exon_chrom_start integer not null,
    exon_chrom_end integer not null,
    is_constitutive boolean,
    rank smallint,
    phase smallint,
    end_phase smallint,
    assembly text not null
);

create table transcript_exon (
    identifier_transcript integer,
    identifier_exon integer,
    primary key (identifier_transcript, identifier_exon)
);
