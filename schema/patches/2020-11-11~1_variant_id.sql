begin;

set local search_path to phenopolis, public;
set local work_mem = '1GB';

alter table variant add id bigserial;

alter table variant add constraint variant_key unique (pos, chrom, ref, alt);
alter table variant drop constraint variant_pkey;
alter table variant add primary key (id);

commit;
