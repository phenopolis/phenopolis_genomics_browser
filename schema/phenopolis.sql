create table variant (
    id bigserial primary key,
    chrom text not null,
    pos int4 not null,
    ref text not null,
    alt text not null,
    constraint variant_key unique (pos, chrom, ref, alt)
);


create table transcript_consequence (
    id bigserial primary key,
    chrom text not null,
    pos int4 not null,
    ref text not null,
    alt text not null,
    hgvs_c text,
    hgvs_p text,
    consequence text,
    gene_id text
);

create index on transcript_consequence (pos, chrom);
create index on transcript_consequence (hgvs_c);
create index on transcript_consequence (hgvs_p);
create index on transcript_consequence (gene_id);


create table individual_variant (
    individual_id text not null,
    variant_id bigint not null references variant (id),
    primary key (variant_id, individual_id),

    chrom text not null,
    pos int4 not null,
    ref text not null,
    alt text not null,

    zygosity text not null check (zygosity in ('HOM', 'HET'))
);

create index on individual_variant (individual_id);
create index on individual_variant (pos);

create table individual_variant_classification (
    id bigserial primary key,
    individual_id text not null,
    variant_id bigint not null references variant(id),
    user_id  text not null,
    classified_on timestamp with time zone,
    -- this represents the ACMG classification
    classification text not null check (classification in ('pathogenic', 'likely_pathogenic', 'benign', 'likely_benign', 'unknown_significance')),
    pubmed_id text,
    notes text
);

create index on individual_variant_classification(user_id);
create index on individual_variant_classification(individual_id, variant_id);
create index on individual_variant_classification(variant_id);
create index on individual_variant_classification(pubmed_id);
