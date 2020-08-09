--
-- Cluster global objects
--

do $$
begin
    perform 1 from pg_user where usename = 'phenopolis_api';
    if not found then
        create user phenopolis_api;
    end if;
end
$$ language plpgsql;

alter user phenopolis_api set search_path to phenopolis, public;
