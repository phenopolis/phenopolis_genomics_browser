begin;

drop index hpo.synonym_term_id_idx;
alter table hpo.synonym add unique (term_id, description);

commit;
