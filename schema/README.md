Phenopolis API schema
=====================

This schema shoud be created automatically in the Docker Phenopolis API db.

Generally, if you have an existing database and superuser, you can create it
using:

    psql -1X -f database.sql


Loading data
------------

In order to load hbo files in the docker db:

```
dc exec app python3 ./scripts/import_hpo.py \
    --dsn "host=db user=postgres dbname=phenopolis_db"
```
