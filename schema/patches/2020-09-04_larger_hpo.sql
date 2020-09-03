set search_path to hpo, public;

alter table synonym drop constraint synonym_description_check;
alter table synonym add check (length(description) <= 1000 and trim(description) != '');

alter table xref drop constraint xref_description_check;
alter table xref add check (length(description) <= 1000 and trim(description) != '');
