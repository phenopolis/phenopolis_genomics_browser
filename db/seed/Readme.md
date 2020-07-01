# Loading Seed Data

Create the `phenopolis_api` user and `phenopolis_db` table.

After connecting to Postgres (`psql`), run the following:

```postgres
CREATE USER phenopolis_api with encrypted password 'phenopolis_api';
create DATABASE phenopolis_db;
grant all privileges on database phenopolis_db to phenopolis_api
```

Next you can load the data as follows. This needs to be run from the project root folder:

```bash
psql --user phenopolis_api --password phenopolis_db < db/seed/demo_database.sql
```

