begin;

set local search_path to phenopolis, publc;

alter table individual_gene
    add foreign key (individual_id) references individual (id)
    on update cascade on delete cascade;

commit;
