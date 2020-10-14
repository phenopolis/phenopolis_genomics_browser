create table annotation_v3 (
    chrom text not null,
    pos int4 not null,
    ref text not null,
    alt text not null,
    primary key (pos, chrom, ref, alt),

    ac int4,    -- allele count
    af real     -- allele frequency
) partition by list (chrom);


-- Create one partition per chrom value
do $do$
declare
    chrom text;
begin
    for chrom in
        select c::text from generate_series(1,22) c
        union
        values ('X'), ('Y')
        order by c
    loop
        execute format($$
            create table annotation_v3_%1$s
                partition of annotation_v3
                for values in (%1$L)
        $$, chrom);
    end loop;
end
$do$ language plpgsql;
