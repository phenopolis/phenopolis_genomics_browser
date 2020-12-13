begin;

set local search_path to phenopolis, public;

alter table variant add dbsnp text check (length(dbsnp) > 0);
alter table variant add variant_class text check (length(variant_class) > 0);
alter table variant add most_severe_consequence text check (length(most_severe_consequence) > 0);
alter table variant add hgvsc text check (length(hgvsc) > 0);
alter table variant add hgvsp text check (length(hgvsp) > 0);
alter table variant add impact text check (impact = any('{modifier,low,moderate,high}'));
alter table variant add dann float4;
alter table variant add cadd_phred float4;
alter table variant add revel float4;
alter table variant add fathmm_score float4[];
alter table variant add canonical bool;

create index on variant (dbsnp);

alter table individual_variant add dp smallint;
alter table individual_variant add fs float4;
alter table individual_variant add mq float4;
alter table individual_variant add qd float4;
alter table individual_variant add filter text check (length(filter) > 0);


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


commit;
