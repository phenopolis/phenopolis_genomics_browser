begin;

set local to phenopolis, public;

alter table users add column enabled boolean default true;

commit;
