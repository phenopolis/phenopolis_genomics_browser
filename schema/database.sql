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

create extension ltree;


-- The audit user must be able to create/manipulate tables here.
-- Other users may be interested to access some functions or tables
create schema audit;
grant all on schema audit to audit;
grant usage on schema audit to public;
alter default privileges in schema audit
    grant select on tables to phenopolis_api;

-- The following objects are created with the audit user owner.
set local role audit;
set search_path to audit, public;
\i audit.sql
reset search_path;
reset role;


create schema phenopolis;
grant usage on schema phenopolis to phenopolis_api;
alter default privileges in schema phenopolis
    grant select, insert, update, delete on tables to phenopolis_api;
alter default privileges in schema phenopolis
    grant all on sequences to phenopolis_api;

set search_path to phenopolis, public;
\i phenopolis.sql
reset search_path;


create schema hpo;
grant usage on schema hpo to phenopolis_api;
alter default privileges in schema hpo
    grant select, insert, update, delete on tables to phenopolis_api;
alter default privileges in schema hpo
    grant all on sequences to phenopolis_api;

set search_path to hpo, public;
\i hpo.sql
reset search_path;


create schema gnomad;
grant usage on schema gnomad to phenopolis_api;
alter default privileges in schema gnomad
    grant select, insert, update, delete on tables to phenopolis_api;
alter default privileges in schema gnomad
    grant all on sequences to phenopolis_api;

set search_path to gnomad, public;
\i gnomad.sql
reset search_path;


create schema kaviar;
grant usage on schema kaviar to phenopolis_api;
alter default privileges in schema kaviar
    grant select, insert, update, delete on tables to phenopolis_api;
alter default privileges in schema kaviar
    grant all on sequences to phenopolis_api;

set search_path to kaviar, public;
\i kaviar.sql
reset search_path;


create schema cadd;
grant usage on schema cadd to phenopolis_api;
alter default privileges in schema cadd
    grant select, insert, update, delete on tables to phenopolis_api;
alter default privileges in schema cadd
    grant all on sequences to phenopolis_api;

set search_path to cadd, public;
\i cadd.sql
reset search_path;

create schema ensembl;
grant usage on schema ensembl to phenopolis_api;
alter default privileges in schema ensembl
    grant select, insert, update, delete on tables to phenopolis_api;
alter default privileges in schema ensembl
    grant all on sequences to phenopolis_api;

set search_path to ensembl, public;
\i ensembl.sql
reset search_path;
