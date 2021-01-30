begin;

alter table phenopolis.individual
    add column consanguinity text CHECK (consanguinity in ('yes','no','unknown'));

commit;
