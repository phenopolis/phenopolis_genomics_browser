set search_path to phenopolis, public;

-- alters main users table
alter table users alter column "user" set not null;
alter table users add constraint users_unique_user unique("user");
alter table users alter column enabled set default false;
alter table users drop column password;
alter table users add column registered_on timestamp with time zone;
alter table users add column confirmed boolean default false;
alter table users add column confirmed_on timestamp with time zone;
alter table users add column email text;
alter table users add constraint users_unique_email unique(email);
alter table users add column full_name text;

-- drops unused table
drop table users2;

-- alter audit table
alter table audit."public.users" alter column "user" set not null;
alter table audit."public.users" alter column enabled set default false;
alter table audit."public.users" drop column password;
alter table audit."public.users" add column registered_on timestamp with time zone;
alter table audit."public.users" add column confirmed boolean default false;
alter table audit."public.users" add column confirmed_on timestamp with time zone;
alter table audit."public.users" add column email text;
alter table audit."public.users" add column full_name text;

reset search_path;