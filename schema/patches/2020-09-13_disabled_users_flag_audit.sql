begin;

set local search_path to phenopolis, public;

alter table audit."public.users" add column enabled boolean;

commit;
