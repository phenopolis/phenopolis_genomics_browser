#!/bin/bash

# Migrate variants data from `public.individuals` to `phenopolis.individual`,
# `phenopolis.individual_feature` and phenopolis.individual_gene.
#
# Usage:
#
# Pass the script the psql connection params.
#
#    migrate_individuals.sh "host=HOST user=USER dbname=DBNAME"

set -euo pipefail
# set -x

psql -e1X "$@" <<HERE
set work_mem = '1GB';

insert into phenopolis.individual (id, sex, external_id, consanguinity)
select replace(internal_id, 'PH', '')::int, sex, external_id, lower(consanguinity)
from public.individuals
on conflict on constraint individual_phenopolis_id_key do nothing;

select setval('phenopolis.individual_id_seq',
    (select max(id) from phenopolis.individual));

insert into phenopolis.individual_feature (individual_id, feature_id, type)
select i.id, f.id, 'observed'
from phenopolis.individual i
join (
    select internal_id, unnest(string_to_array(observed_features, ',')) as hpo_id
    from public.individuals
) as j on j.internal_id = i.phenopolis_id
join hpo.term f on f.hpo_id = j.hpo_id
on conflict on constraint individual_feature_pkey do nothing;

insert into phenopolis.individual_feature (individual_id, feature_id, type)
select i.id, f.id, 'unobserved'
from phenopolis.individual i
join (
    select internal_id, unnest(string_to_array(unobserved_features, ',')) as hpo_id
    from public.individuals
) as j on j.internal_id = i.phenopolis_id
join hpo.term f on f.hpo_id = j.hpo_id
on conflict on constraint individual_feature_pkey do nothing;

insert into phenopolis.individual_feature (individual_id, feature_id, type)
select i.id, f.id, 'simplified'
from phenopolis.individual i
join (
    select internal_id, unnest(string_to_array(simplified_observed_features, ',')) as hpo_id
    from public.individuals
) as j on j.internal_id = i.phenopolis_id
join hpo.term f on f.hpo_id = j.hpo_id
on conflict on constraint individual_feature_pkey do nothing;

insert into phenopolis.individual_gene (individual_id, gene_id)
select i2.id, g.identifier
from public.individuals i
join ensembl.gene g on g.hgnc_symbol = any(string_to_array(i.genes , ','))
join phenopolis.individual i2 on i2.phenopolis_id = i.internal_id
where g.assembly = 'GRCh37'
on conflict on constraint individual_gene_pkey do nothing
;

analyze phenopolis.individual, phenopolis.individual_feature, phenopolis.individual_gene;
HERE
