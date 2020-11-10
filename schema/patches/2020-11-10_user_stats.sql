set search_path to phenopolis, public;

create table user_stats (
    user_id text primary key,
    timestamp timestamptz not null,
    stats jsonb not null
);

reset search_path;
