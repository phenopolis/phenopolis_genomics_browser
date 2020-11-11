set search_path to phenopolis, public;

alter table individual_variant add status text;

alter table individual_variant add clinvar_id text;
create index on individual_variant (clinvar_id);

alter table individual_variant add pubmed_id text;
create index on individual_variant (pubmed_id);

alter table individual_variant add comment text;

alter table individual_variant add user_id text;
alter table individual_variant add timestamp timestamptz;
update individual_variant set timestamp = now();
alter table individual_variant alter timestamp set not null;

create function individual_variant_timestamp_update() returns trigger
language plpgsql as $$
begin
    new.timestamp = now();
    return new;
end
$$;

create trigger individual_variant_timestamp_update
before insert or update on individual_variant
for each row execute procedure individual_variant_timestamp_update();

reset search_path;
