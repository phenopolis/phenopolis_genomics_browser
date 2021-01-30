begin;

set local search_path to phenopolis, publc;

alter table individual_feature
    drop constraint individual_feature_individual_id_fkey;

alter table individual_feature
    add foreign key (individual_id) references individual (id)
    on update cascade on delete cascade;

commit;
