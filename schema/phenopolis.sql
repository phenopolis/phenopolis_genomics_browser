create table variant (
    id bigserial primary key,

    chrom text not null,
    pos int4 not null,
    ref text not null,
    alt text not null,
    constraint variant_key unique (pos, chrom, ref, alt),

    dbsnp text check (length(dbsnp) > 0),
    variant_class text check (length(variant_class) > 0),
    most_severe_consequence text check (length(most_severe_consequence) > 0),
    hgvsc text check (length(hgvsc) > 0),
    hgvsp text check (length(hgvsp) > 0),
    impact text check (impact = any('{modifier,low,moderate,high}')),
    dann float4,
    cadd_phred float4,
    revel float4,
    fathmm_score float4[],
    canonical bool
);

create index on variant (dbsnp);


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


create table individual (
    id serial primary key,
    phenopolis_id text not null unique check (phenopolis_id ~ '^PH\d+$'),
    constraint ids_match check (id = replace(phenopolis_id, 'PH', '')::int),
    external_id text unique,
    sex text not null check (sex in ('M', 'F', 'N', 'U'))
);

create or replace function individual_phenopolis_id_update() returns trigger
language plpgsql as $$
begin
    new.phenopolis_id = 'PH' || to_char(new.id, 'FM00000000');
    return new;
end
$$;

create trigger individual_phenopolis_id_update
before insert or update on individual
for each row execute procedure individual_phenopolis_id_update();

create index on individual (phenopolis_id);
create index on individual (external_id);


create table individual_feature (
    individual_id int references individual (id),
    feature_id int not null references hpo.term (id),
    type text not null
        check (type in ('observed', 'unobserved', 'simplified', 'ancestor')),
    primary key (individual_id, feature_id, type)
);

create index on individual_feature (feature_id);


create table individual_variant (
    individual_id text not null,    -- TODO: fkey to individual after data migration
    variant_id bigint not null references variant (id),
    primary key (variant_id, individual_id),

    chrom text not null,
    pos int4 not null,
    ref text not null,
    alt text not null,

    zygosity text not null check (zygosity in ('HOM', 'HET')),
    status text,
    clinvar_id text,
    pubmed_id text,

    dp smallint,
    fs float4,
    mq float4,
    qd float4,
    filter text check (length(filter) > 0),

    comment text,
    user_id text,
    timestamp timestamptz not null
);

create index on individual_variant (individual_id);
create index on individual_variant (pos);
create index on individual_variant (clinvar_id);
create index on individual_variant (pubmed_id);

-- Update the timestamp both on insert and update
create function timestamp_update() returns trigger
language plpgsql as $$
begin
    new.timestamp = now();
    return new;
end
$$;

create trigger timestamp_update
before insert or update on individual_variant
for each row execute procedure timestamp_update();


create table individual_gene (
    individual_id text not null,
    gene_id bigint not null references ensembl.gene (identifier),
    primary key (gene_id, individual_id),

    status text,
    clinvar_id text,
    pubmed_id text,
    comment text,
    user_id text,
    timestamp timestamptz not null
);

create index on individual_gene (individual_id);
create index on individual_gene (clinvar_id);
create index on individual_gene (pubmed_id);

create trigger timestamp_update
before insert or update on individual_gene
for each row execute procedure timestamp_update();


create table variant_gene (
    gene_id text,
    variant_id bigint,
    primary key (variant_id, gene_id),
    transcript_id text check (length(transcript_id) > 0),
    strand smallint check (strand = any('{-1,1}')),
    exon text
);

create index on variant_gene (gene_id) include (variant_id);
create index on variant_gene (transcript_id);
