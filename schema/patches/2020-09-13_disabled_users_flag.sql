set search_path to phenopolis, public;

alter table users add column enabled boolean default true;

reset search_path;