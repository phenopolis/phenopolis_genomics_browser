create table annotation_hg19 (
    id bigserial,

    -- not unique
    chrom text not null,
    pos int4 not null,
    ref text not null,
    alt text not null,

    -- chrom needed in the pkey for partitioning
    primary key (chrom, id),

    ac int4,    -- allele count
    af real,    -- allele frequency
    an int4,    -- allele number
    ds text     -- data source
        check (length(ds) > 0)
) partition by list (chrom);


-- Create one partition per chrom value
do $do$
declare
    chrom text;
begin
    for chrom in
        select c::text from generate_series(1,22) c
        union
        values ('X'), ('Y'), ('M')
        order by c
    loop
        execute format($$
            create table annotation_hg19_%1$s
                partition of annotation_hg19
                for values in (%1$L)
        $$, chrom);

        execute format($$
            create index on annotation_hg19_%1$s (pos);
        $$, chrom);

    end loop;
end
$do$ language plpgsql;
