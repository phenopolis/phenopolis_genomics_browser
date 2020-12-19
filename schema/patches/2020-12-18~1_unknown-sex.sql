begin;

set local search_path to phenopolis, public;

alter table individual drop constraint individual_sex_check;
alter table individual add check (sex in ('M', 'F', 'N', 'U'));
alter table individual alter sex set not null;

commit;
