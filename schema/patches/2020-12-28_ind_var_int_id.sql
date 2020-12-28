begin;

alter table phenopolis.individual_variant
    alter column individual_id type int
    using replace(individual_id, 'PH', '')::int;

commit;
