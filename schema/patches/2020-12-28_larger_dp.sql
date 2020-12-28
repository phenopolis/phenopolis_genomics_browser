begin;

alter table phenopolis.individual_variant
    alter column dp type int;

commit;
