create table term (
    id integer primary key,
    hpo_id text not null unique check (hpo_id ~ '^HP:\d+$'),
    constraint ids_match check (id = replace(hpo_id, 'HP:', '')::int),
    name text not null check (length(name) <= 150 and name !~ '^\s|\s$|^$'),
    description text check (length(description) <= 5000 and trim(description) != ''),
    comment text check (length(comment) <= 5000 and trim(comment) != ''));


create table is_a (
    term_id integer references term (id),
    is_a_id integer references term (id),
    primary key (term_id, is_a_id));

create index on is_a (is_a_id);


create table xref (
    term_id integer references term (id),
    xref text not null check (length(xref) <= 50 and xref !~ '^\s|\s$|^$'),
    description text
    check (length(description) <= 1000 and trim(description) != ''),
    primary key (term_id, xref));

create index on xref (xref);


create table synonym (
    id serial primary key,
    term_id integer references term (id),
    description text
        check (length(description) <= 1000 and trim(description) != ''));

create index on synonym (term_id);


create table alt (
    id integer primary key,
    alt_id text not null unique check (alt_id ~ '^HP:\d+$'),
    constraint ids_match check (id = replace(alt_id, 'HP:', '')::int),
    term_id integer references term (id));

create index on alt (term_id);


-- Matrialized view to look for ancestors/descendants of terms
create materialized view is_a_path as
with recursive rterm as (
    select id as term_id, id::text::ltree as path
    from term t
    where not exists (select 1 from is_a where t.id = is_a.term_id)
    union all
    select a.term_id, r.path || a.term_id::text::ltree
    from is_a a join rterm r on a.is_a_id = r.term_id
)
select * from rterm;

create index on is_a_path using btree (term_id);
create unique index on is_a_path using btree (path);
create index on is_a_path using gist (path);


-- TODO: full-text search
