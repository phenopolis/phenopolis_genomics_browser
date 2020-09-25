
create table gene (
    identifier integer primary key,
    ensembl_gene_id text not null,
    version smallint,
    description text,
    chromosome text not null,
    start integer not null,
    "end" integer not null,
    strand smallint not null,
    band text,
    biotype text,
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
    version smallint,
    ensembl_peptide_id text,
    peptide_version smallint,
    chromosome text not null,
    start integer not null,
    "end" integer not null,
    transcription_start_site integer,
    strand smallint not null,
    transcript_length integer,
    cds_length integer,
    biotype text,
    uniparc text,
    assembly text,
    canonical boolean
);

create index ON transcript USING btree (ensembl_gene_id);
create index ON transcript USING btree (ensembl_transcript_id);

create table gene_transcript (
    gene integer,
    transcript integer,
    primary key(gene, transcript)
);

create index ON gene_transcript USING btree (gene);
create index ON gene_transcript USING btree (transcript);

create table gene_synonym (
    gene integer,
    external_synonym text,
    primary key(gene, external_synonym)
);

create index ON gene_synonym USING btree (gene);
create index ON gene_synonym USING btree (external_synonym);

create table transcript_uniprot (
    transcript integer,
    uniprotswissprot text,
    primary key(transcript, uniprotswissprot)
);

create index ON transcript_uniprot USING btree (transcript);
create index ON transcript_uniprot USING btree (uniprotswissprot);

create table exon (
    identifier integer primary key,
    ensembl_gene_id text not null,
    ensembl_transcript_id text not null,
    ensembl_exon_id text not null,
    chromosome text not null,
    start integer not null,
    "end" integer not null,
    is_constitutive boolean,
    rank smallint,
    phase smallint,
    end_phase smallint,
    assembly text not null
);

create table transcript_exon (
    transcript integer,
    exon integer,
    primary key (transcript, exon)
);

create index ON transcript_exon USING btree (transcript);
create index ON transcript_exon USING btree (exon);
