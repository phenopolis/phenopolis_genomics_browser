set search_path to phenopolis, public;

create table individual_variant_classification (
    id bigserial primary key,
    individual_id text not null,
    variant_id bigint not null references variant(id),
    user_id text not null,
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

reset search_path;
