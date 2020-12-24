begin;
set local search_path to phenopolis, public;

create table individual (
    id serial primary key,
    phenopolis_id text not null unique check (phenopolis_id ~ '^PH\d+$'),
    constraint ids_match check (id = replace(phenopolis_id, 'PH', '')::int),
    external_id text unique,
    sex text check (sex in ('M', 'F', 'N'))
);

create or replace function individual_phenopolis_id_update() returns trigger
language plpgsql as $$
begin
    new.phenopolis_id = 'PH' || to_char(new.id, 'FM00000000');
    return new;
end
$$;

create trigger individual_phenopolis_id_update
before insert or update on individual
for each row execute procedure individual_phenopolis_id_update();


create index on individual (phenopolis_id);
create index on individual (external_id);


create table individual_feature (
    individual_id int references individual (id),
    feature_id int not null references hpo.term (id),
    type text not null
        check (type in ('observed', 'unobserved', 'simplified', 'ancestor')),
    primary key (individual_id, feature_id, type)
);

create index on individual_feature (feature_id);

commit;
