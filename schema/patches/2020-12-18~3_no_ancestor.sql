begin;

set local search_path to phenopolis, public;

alter table individual_feature drop constraint individual_feature_type_check;
delete from individual_feature where type = 'ancestor';
alter table individual_feature add check (type = any('{observed,unobserved,simplified}'));

commit;
