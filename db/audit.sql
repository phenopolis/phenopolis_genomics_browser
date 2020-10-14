-- Note: this functionality requires installation of the audit functions
-- which are added in the new schema.
select audit.start('public.users', '{ts,appname,action}');
select audit.start('public.users_individuals', '{ts,appname,action}');
select audit.start('public.individuals', '{ts,appname,action}');
