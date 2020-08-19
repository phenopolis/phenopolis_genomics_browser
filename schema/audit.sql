--
-- Audit trail for PostgreSQL
--

-- Synthetic info about the audit status of a table
-- Returned by the status() function.
create type audit_status as enum (
	'audited', 'paused', 'unaudited', 'inconsistent');


-- Detailed info about the audit status of a table
-- Returned by the info() function.
create type audit_info as (
	"table" regclass,
	fields text[],
	has_function boolean,
	has_trigger boolean,
	trigger_enabled boolean);


-- Create an audit table and install the audit trigger
create or replace function start(
	tgt regclass,
	audit_fields text[] default array['ts', 'action'])
returns audit_status
language plpgsql
set search_path from current
as $$
declare
	info audit_info;
	status audit_status;
	stmt text;
begin
	begin -- this is a transaction in PL/pgSQL
		info := info(tgt);
		status := _status(info);

		-- If the table is already audited and the fields are the same
		-- don't do anything.
		if status = 'audited' and audit_fields = info.fields then
			null;

		-- If the status is paused and we are asking for the same audit fields
		-- then just unpause it.
		elsif status = 'paused' and audit_fields = info.fields then
			return restart(tgt);

		-- Otherwise an existing audit table and start with a new one
		else
			foreach stmt
				in array _start_stmts(tgt, audit_fields)
			loop
				execute stmt;
			end loop;
			perform _grant_seqs(tgt);
		end if;

		return status(tgt);

	exception
		-- you can't have this clause empty
		when division_by_zero then raise 'wat?';
	end;
end
$$;

-- Remove audit trigger from a table and rename the audit table away
create or replace function stop(tgt regclass)
returns audit_status
language plpgsql
set search_path from current
as $$
declare
	stmts text[];
	stmt text;
begin
	begin -- this is a transaction in PL/pgSQL
		stmts = _stop_stmts(tgt);
		foreach stmt in array stmts loop
			execute stmt;
		end loop;
		return status(tgt);
	exception
		-- you can't have this clause empty
		when division_by_zero then raise 'wat?';
	end;
end
$$;

-- Rename the current log table away and start a new one keeping its definition
create or replace function rotate(tgt regclass)
returns audit_status
language plpgsql
set search_path from current
as $$
declare
	info audit_info;
	status audit_status;
begin
	begin -- this is a transaction in PL/pgSQL
		info := info(tgt);
		status := _status(info);

		if status = 'unaudited' then
			-- we don't know the columns so we cannot start
			return status;
		end if;

		perform stop(tgt);
		perform start(tgt, info.fields);

		return status(tgt);

	exception
		-- you can't have this clause empty
		when division_by_zero then raise 'wat?';
	end;
end
$$;

-- Temporarily suspend a table audit
create or replace function pause(tgt regclass)
returns audit_status
language plpgsql
set search_path from current
as $$
begin
	begin -- this is a transaction in PL/pgSQL
		if status(tgt) = 'audited' then
			execute format('alter table %s disable trigger %I',
				_full_table_name(tgt),
				_trg_name(tgt));
		end if;
		return status(tgt);
	exception
		-- you can't have this clause empty
		when division_by_zero then raise 'wat?';
	end;
end
$$;

-- Restart a previously paused audit
create or replace function restart(tgt regclass)
returns audit_status
language plpgsql
set search_path from current
as $$
begin
	begin -- this is a transaction in PL/pgSQL
		if status(tgt) = 'paused' then
			execute format('alter table %s enable trigger %I',
				_full_table_name(tgt),
				_trg_name(tgt));
		end if;
		return status(tgt);
	exception
		-- you can't have this clause empty
		when division_by_zero then raise 'wat?';
	end;
end
$$;


-- Return detailed informations about the status of the audit pieces
create or replace function info(tgt regclass)
returns audit_info
language plpgsql stable
set search_path from current
as $$
declare
	rv audit_info;
begin
	select r.oid
	into rv.table
	from pg_class r
	join pg_namespace ns on ns.oid = relnamespace
    -- TODO: would be nice to avoid mentioning the schema name
	where nspname = 'audit'
	and relname = _audit_table_name(tgt);

	select exists (
		select 1
		from pg_proc f
		join pg_namespace ns on ns.oid = pronamespace
		where nspname = 'audit'
		and proname = _fn_name(tgt)
		and prorettype = 'trigger'::regtype)
	into rv.has_function;

	select tgenabled <> 'D'
	into rv.trigger_enabled
	from pg_trigger
	where tgrelid = tgt
	and tgname = _trg_name(tgt);

	rv.has_trigger := rv.trigger_enabled is not null;

	select array_agg(name) into rv.fields from _field_defs(tgt);

	return rv;
end
$$;


-- Internal function to get the status from an info structure
create or replace function _status(info audit_info)
returns audit_status
language sql immutable strict
set search_path from current
as $$
select case
	when $1.table is not null and $1.has_function and $1.has_trigger
			and $1.trigger_enabled then
		'audited'::audit_status
	when $1.table is not null and $1.has_function and $1.has_trigger
			and not $1.trigger_enabled then
		'paused'
	when not ($1.table is not null or $1.has_function or $1.has_trigger) then
		'unaudited'
	else
		'inconsistent'
	end;
$$;

-- Return a string with the audit status of a table
create or replace function status(tgt regclass)
returns audit_status
language sql stable strict
set search_path from current
as $$
	select _status(info($1));
$$;


-- Create an index on an audit table
-- Create a simple btree index on a single field with a trivial but unique name
-- If the audit table is partitioned create the index on all the partitions.
create or replace function create_index(tgt regclass, field name)
returns void
language plpgsql
set search_path from current
as $$
begin
	perform _create_table_index((info(tgt))."table", field);
end
$$;

-- Create an index on a table, recurse to subclasses
create or replace function _create_table_index(tbl regclass, field name)
returns void
language plpgsql
set search_path from current
as $$
declare
	sql text;
	inh regclass;
begin
	sql := format('create index %I on %s (%I)',
		_table_name(tbl) || '_' || field || '_idx',
		tbl, field);
	raise notice 'creating index with definition: %', sql;
	execute sql;

	for inh in select inhrelid from pg_inherits where inhparent = tbl loop
		perform _create_table_index(inh, field);
	end loop;
end
$$;


--
-- Definitions of the fields available for audit
--

create type audit_field as (
	name name,
	expression text,
	def text);

-- Return info about all the fields available
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
		('action', 'tg_op', 'text'),
		('schema', 'tg_table_schema', 'name'),
		('table', 'tg_table_name', 'name')
	]::audit_field[]);
$f$;

-- Return info about a selection of audit fields
create or replace function _field_defs(names name[])
returns setof audit_field
language plpgsql immutable
set search_path from current
as $$
declare
	fname name;
	field audit_field;
begin
	foreach fname in array names loop
		select * into field from _field_defs() where name = fname;
		if not found then
			raise 'unknown audit field: %', fname;
		end if;
		return next field;
	end loop;
end
$$;

-- Return info about the audit fields on a table
create or replace function _field_defs(tgt regclass)
returns setof audit_field
language plpgsql stable
set search_path from current
as $$
declare
	colname name;
	fields name[] := array[]::name[];
begin
	for colname in
	select attname
	from pg_attribute a
	join pg_class r on r.oid = attrelid
	join pg_namespace n on n.oid = relnamespace
	where nspname = 'audit'
	and relname = _full_table_name(tgt)
	and attnum > 0 and not attisdropped
	order by attnum loop
		if colname ~ '^audit_' then
			fields := fields || regexp_replace(colname, '^audit_', '')::name;
		else
			exit;
		end if;
	end loop;

	return query select * from _field_defs(fields);
end
$$;


--
-- Sequence of statements to implement the various commands
--

create or replace function _start_stmts(
	tgt regclass,
	audit_fields text[] default array['ts', 'action'])
returns text[]
language plpgsql stable strict
set search_path from current
as $f$
declare
	rv text[] := array[]::text[];
	info audit_info;
	def1 text[];
	def2 text[];
	seq name;
begin
	if array_length(audit_fields, 1) < 1
	or array_length(audit_fields, 1) is null -- meh, empty arrays
	then
		raise 'at least one audit field required';
	end if;

	info := info(tgt);

	if info.has_trigger then
		rv := rv || format('drop trigger %I on %s',
			_trg_name(tgt),
			_full_table_name(tgt));
	end if;

	-- If the table exists, rotate it away
	rv := rv || _rename_stmts(tgt, info);

	-- Create an empty table with the audit fields followed by the table ones
	select array_agg(format('audit_%s %s', name, def))
	into strict def1
	from _field_defs(audit_fields);

	select array_agg(t)
	into strict def2
	from (
		select format('%I %s', a.attname,
			pg_catalog.format_type(a.atttypid, a.atttypmod)) t
		from pg_attribute a
		where attrelid = tgt
		and attnum > 0 and not attisdropped
		order by attnum) x;

	rv := rv || format(
		'create table audit.%I (%s)',
		_audit_table_name(tgt),
		array_to_string(def1 || def2, ', '));

	rv := rv || format('grant insert on table audit.%I to audit',
		_audit_table_name(tgt));

	-- Create the trigger function
	select array_agg(expression)
	into strict def1
	from _field_defs(audit_fields);

	rv := rv || format($f2$
		create or replace function audit.%I() returns trigger
		security definer language plpgsql as $$
begin
	if tg_op <> 'DELETE' then
		insert into audit.%I values (%s, new.*);
		return null;
	else
		insert into audit.%I values (%s, old.*);
		return null;
	end if;
end
$$
		$f2$,
		_fn_name(tgt),
		_audit_table_name(tgt),
		array_to_string(def1, ', '),
		_audit_table_name(tgt),
		array_to_string(def1, ', '));

	rv := rv || format('alter function audit.%I() owner to audit',
		_fn_name(tgt));

	-- Create the trigger
	rv := rv || format($$
		create trigger %I
			after insert or update or delete on %s
			for each row execute procedure audit.%I()
		$$,
		_trg_name(tgt),
		_full_table_name(tgt),
		_fn_name(tgt));

	return rv;
end
$f$;

create or replace function _rename_stmts(
	tgt regclass,
	info audit_info)
returns text[]
language plpgsql stable
set search_path from current
as $$
declare
	rv text[] := array[]::text[];
	rotname name;
begin
	if info.table is not null then
		rotname := (_audit_table_name(tgt)
			|| '_'
			|| to_char(clock_timestamp(), 'YYYYMMDD_HH24MISS'))::name;
		raise notice 'existing audit table for % will be renamed to %',
			_audit_table_name(tgt),
			format('audit.%I', rotname);
		rv := rv || format(
			'alter table audit.%I rename to %I',
			_audit_table_name(tgt), rotname);
	end if;
	return rv;
end
$$;

create or replace function _stop_stmts(tgt regclass)
returns text[]
language plpgsql stable strict
set search_path from current
as $f$
declare
	rv text[] := array[]::text[];
	info audit_info;
begin
	info := info(tgt);

	if info.has_trigger then
		rv := rv || format('drop trigger %I on %s',
			_trg_name(tgt),
			_full_table_name(tgt));
	end if;

	if info.has_function then
		rv := rv || format('drop function audit.%I()',
			_fn_name(tgt));
	end if;

	rv := rv || _rename_stmts(tgt, info);

	return rv;
end
$f$;

-- Grant usage to any audit table sequence to the audit user
-- this cannot be done in _start_stmts because we don't know the name
-- of the sequences until the table is created.
create or replace function _grant_seqs(tgt regclass)
returns void
language plpgsql
set search_path from current
as $$
declare
	seq name;
begin
	-- If audit created any sequence, grant their usage
	for seq in
		select s.relname
		from pg_class s
		join pg_depend d on s.oid = d.objid
		join pg_class r on d.refobjid = r.oid
		join pg_namespace n on r.relnamespace = n.oid
		where n.nspname = 'audit'
		and r.relname = _audit_table_name(tgt)
		and s.relkind = 'S'
	loop
		execute format(
			'grant usage on sequence audit.%I to audit', seq);
	end loop;
end
$$;


--
-- Functions to mess up with names
--

-- Return the name of a table, without schema name.
create or replace function _table_name(tgt regclass)
returns name
language sql stable
as $$
	select relname from pg_class where oid = $1;
$$;


-- Return the namespace-qualified name of a table, possibly adding it a suffix
create or replace function _mangle_name(
	tgt regclass, suffix text default '')
returns name
language sql stable
as $$
	select format('%I.%I', nspname, relname || $2)::name
	from pg_class r
	join pg_namespace n on relnamespace = n.oid
	where r.oid = $1;
$$;


-- Return the full name of the table being audited
-- The name is fully qualified to avoid search_path troubles,
-- so it shouldn't be added to queries using %I, otherwise extra
-- quotes would be added. Just use %s: the function adds the quotes itself
-- when required.
create or replace function _full_table_name(tgt regclass)
returns name
language sql stable
set search_path from current
as $$
	select _mangle_name($1);
$$;


-- Return the name of the audit table for a table
-- The function name can (and will) contain special chars and
-- doesn't contain the namespace name. So it can be used as it is
-- e.g. to query pg_class, but should be used with a placeholder
-- like 'audit.%I' in format().
create or replace function _audit_table_name(
	tgt regclass, suffix text default '')
returns name
language sql stable
set search_path from current
as $$
	select _mangle_name($1, $2);
$$;


-- Return the name of the audit trigger function for a table
create or replace function _fn_name(tgt regclass)
returns name
language sql stable
set search_path from current
as $$
	select _mangle_name($1, '_fn');
$$;


-- Return the name of the audit trigger for a table
create or replace function _trg_name(tgt regclass)
returns name
language sql stable
set search_path from current
as $$
	select _mangle_name($1, '_audit_trg');
$$;
