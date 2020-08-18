Phenopolis API schema
=====================

This schema shoud be created automatically in the Docker Phenopolis API db.

Generally, if you have an existing database and superuser, you can create it
using:

    psql -1X -f database.sql


Connecting to the docker-compose database from the host
-------------------------------------------------------

The database port is not exposed. However you can connect to a running
container. The `script/dchost NAME` script can be used to get the container
name, e.g.:

```
psql "host=$(scripts/dchost db) user=phenopolis_api dbname=phenopolis_db"
```

You can avoid to specify the password by adding it to the [`.pgpass` file](https://www.postgresql.org/docs/current/libpq-pgpass.html)

```
# hostname:port:database:username:password
*:*:*:phenopolis_api:phenopolis_api
```


Loading data
------------

In order to load hbo files in the docker db:

```
dc exec app python3 ./scripts/import_hpo.py \
    --dsn "host=db user=postgres dbname=phenopolis_db"
```
