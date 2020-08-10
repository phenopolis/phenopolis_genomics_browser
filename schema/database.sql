/*
 * Definition of the Phenopolis database
 *
 * This file should be independent from the database name. It should be
 * possible to source the file in a blank database using a superuser to create
 * the schema from scratch.
 *
 *     createdb phenopolis;
 *     psql -1 -f database.sql "dbname=phenopolis"
 */

\i globals.sql

revoke create on schema public from public;

create schema phenopolis;
grant usage on schema phenopolis to phenopolis_api;
alter default privileges in schema phenopolis
    grant select, insert, update, delete on tables to phenopolis_api;
alter default privileges in schema phenopolis
    grant all on sequences to phenopolis_api;

create extension ltree;


create schema hpo;
grant usage on schema hpo to phenopolis_api;
alter default privileges in schema hpo
    grant select, insert, update, delete on tables to phenopolis_api;
alter default privileges in schema hpo
    grant all on sequences to phenopolis_api;

set search_path to hpo, public;
\i hpo.sql
reset search_path;
