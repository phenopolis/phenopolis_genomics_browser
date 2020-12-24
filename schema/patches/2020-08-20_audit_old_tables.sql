begin;

set local role audit;
set local search_path to audit, public;

create or replace function _field_defs()
returns setof audit_field
language sql immutable
set search_path from current
as $f$
	select * from unnest(array[
		('id', 'default', 'bigserial'),
		('ts', 'now()', 'timestamptz'),
		('clock', 'clock_timestamp()', 'timestamptz'),
		('user', 'session_user', 'name'),
		('user_id', $$current_setting('audit.user_id')$$, 'text'),
		('appname', $$current_setting('application_name')$$, 'text'),
		('action', 'tg_op', 'text'),
		('schema', 'tg_table_schema', 'name'),
		('table', 'tg_table_name', 'name')
	]::audit_field[]);
$f$;

reset search_path;
reset role;

select audit.start('public.users', '{ts,appname,action}');
select audit.start('public.users_individuals', '{ts,appname,action}');
select audit.start('public.individuals', '{ts,appname,action}');

commit;
