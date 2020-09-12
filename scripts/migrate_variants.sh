#!/bin/bash

# Migrate variants data from `public.variants` to `phenopolis.variant` and
# `phenopolis.transcript_consequence`
#
# Usage:
#
# Pass the script the psql connection params.
#
#    migrate_variants.sh "host=HOST user=USER dbname=DBNAME"

set -euo pipefail
# set -x

psql -e1X "$@" <<HERE
set work_mem = '1GB';

insert into phenopolis.variant (chrom, pos, ref, alt)
select "CHROM", "POS", "REF", "ALT"
from public.variants
where (hgvsc, hgvsp) != ('', '')
on conflict on constraint variant_pkey do nothing;

insert into phenopolis.transcript_consequence
    (chrom, pos, ref, alt, hgvs_c, hgvs_p, consequence, gene_id)
select * from (
    select
        "CHROM" as chrom, "POS" as pos, "REF" as ref, "ALT" as alt,
        nullif(hgvsc, '') as hgvs_c,
        nullif(hgvsp, '') as hgvs_p,
        nullif(most_severe_consequence, '') as consequence,
        nullif(gene_id, '') as gene_id
    from public.variants
    where (hgvsc, hgvsp) != ('', '')
) s
where not exists (
    select 1 from phenopolis.transcript_consequence t
    where (t.chrom, t.pos, t.ref, t.alt) = (s.chrom, s.pos, s.ref, s.alt)
    and (t.hgvs_c, t.hgvs_p, t.consequence)
        is not distinct from (s.hgvs_c, s.hgvs_p, s.consequence)
);

analyze phenopolis.variant, phenopolis.transcript_consequence;
HERE
