begin;

set local search_path to phenopolis, public;

create table individual_variant (
    individual_id int not null,
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

commit;
