begin;

alter table phenopolis.individual_gene
    alter column individual_id type int
    using replace(individual_id, 'PH', '')::int;

commit;
