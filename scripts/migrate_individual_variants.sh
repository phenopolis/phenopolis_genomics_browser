#!/bin/bash

# Migrate variants data from `public.hom_variants` and `public.het_variants` to
# `phenopolis.individual_variant`
#
# Usage:
#
# Pass the script the psql connection params.
#
#    migrate_variants.sh "host=HOST user=USER dbname=DBNAME"

set -euo pipefail
# set -x

# Note: Some dbs have external_id in the variant's individual colummn, some
# have the internal db, so import both the "styles".

psql -e1X "$@" <<HERE
set work_mem = '1GB';

analyze public.hom_variants, public.het_variants, phenopolis.variant, public.individuals ;

insert into phenopolis.individual_variant
    (individual_id, variant_id, chrom, pos, ref, alt, zygosity)
select ind.internal_id, pv.id, pv.chrom, pv.pos, pv.ref, pv.alt, 'HOM'
from public.hom_variants hv
join phenopolis.variant pv
    on (hv."CHROM", hv."POS", hv."REF", hv."ALT") = (pv.chrom, pv.pos, pv.ref, pv.alt)
join public.individuals ind on ind.internal_id = hv.individual;

insert into phenopolis.individual_variant
    (individual_id, variant_id, chrom, pos, ref, alt, zygosity)
select ind.internal_id, pv.id, pv.chrom, pv.pos, pv.ref, pv.alt, 'HOM'
from public.hom_variants hv
join phenopolis.variant pv
    on (hv."CHROM", hv."POS", hv."REF", hv."ALT") = (pv.chrom, pv.pos, pv.ref, pv.alt)
join public.individuals ind on ind.external_id = hv.individual;

insert into phenopolis.individual_variant
    (individual_id, variant_id, chrom, pos, ref, alt, zygosity)
select ind.internal_id, pv.id, pv.chrom, pv.pos, pv.ref, pv.alt, 'HET'
from public.het_variants hv
join phenopolis.variant pv
    on (hv."CHROM", hv."POS", hv."REF", hv."ALT") = (pv.chrom, pv.pos, pv.ref, pv.alt)
join public.individuals ind on ind.internal_id = hv.individual;

insert into phenopolis.individual_variant
    (individual_id, variant_id, chrom, pos, ref, alt, zygosity)
select ind.internal_id, pv.id, pv.chrom, pv.pos, pv.ref, pv.alt, 'HET'
from public.het_variants hv
join phenopolis.variant pv
    on (hv."CHROM", hv."POS", hv."REF", hv."ALT") = (pv.chrom, pv.pos, pv.ref, pv.alt)
join public.individuals ind on ind.external_id = hv.individual;

analyze phenopolis.individual_variant;
HERE
