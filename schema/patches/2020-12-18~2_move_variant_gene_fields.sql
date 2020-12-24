begin;

set local search_path to phenopolis, public;

alter table variant_gene add most_severe_consequence text check (length(most_severe_consequence) > 0);
alter table variant_gene add impact text check (impact = any('{modifier,low,moderate,high}'));
alter table variant_gene add hgvs_c text check (length(hgvs_c) > 0);
alter table variant_gene add hgvs_p text check (length(hgvs_p) > 0);
alter table variant_gene add canonical bool;

update variant_gene vg set
    most_severe_consequence = v.most_severe_consequence,
    impact = v.impact,
    hgvs_c = v.hgvsc,
    hgvs_p = v.hgvsp,
    canonical = v.canonical
from variant v
where vg.variant_id = v.id;

alter table variant drop most_severe_consequence;
alter table variant drop hgvsc;
alter table variant drop hgvsp;
alter table variant drop impact;
alter table variant drop canonical;

commit;
