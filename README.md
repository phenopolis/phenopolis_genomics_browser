# Phenopolis API

A description of the code setup is available [here](code_setup.md).

## Setup using docker compose:

Set the following environment variables in `private.env`:

```bash
VCF_S3_SECRET=....
VCF_S3_KEY=....
```

Note: do not add single or double quotes around the value as they are preserved.

### Build and launch the services

This will set up the database and load the demo database.

```bash
docker-compose up
```

#### Rebuild if you change dependencies

Rebuild, if you change `Dockerfile` or `requirements.txt`

```bash
docker-compose up --build
```

## Importing other data into the database

Edit [db/import_demo_data.sql](db/import_demo_data.sql) to import the correct CSV files into the database.

If you do not wish to load any data, simply comment out all the lines within this file.

### Connecting to the Postgres Database

It is possible to connect to the postgres shell as follows:

```bash
# Note change the values of the user and database name required
docker-compose exec db psql --user phenopolis_api --dbname phenopolis_db
```

> Note: When importing an AWS RDS SQL dump, you will need to create the below user before importing the SQL file:

```bash
docker-compose exec db sh -c 'createuser rdsadmin -U phenopolis_api'
```

## Setup frontend

In a separate terminal (and directory), clone and follow the setup instructions at: [https://github.com/phenopolis/phenopolis_frontend_react](https://github.com/phenopolis/phenopolis_frontend_react).

> Make sure that you create the local `_redirects` file (instructions at the bottom of the README) which redirects api requests to the FLASK API set up above.

Next, open [http://localhost:8888](http://localhost:8888) in your favourite browser

With the demo data the following exemplar links should work on the frontend:

* My Patient Page: [http://localhost:8888/my_patients](http://localhost:8888/my_patients)
* Individual Page: [http://localhost:8888/individual/PH00008258](http://localhost:8888/individual/PH00008258)
* Variant Page: [http://localhost:8888/variant/22-38212762-A-G](http://localhost:8888/variant/22-38212762-A-G)
* HPO Page: [http://localhost:8888/hpo/HP:0000478](http://localhost:8888/hpo/HP:0000478)
* Gene Page: [http://localhost:8888/gene/ENSG00000119685](http://localhost:8888/gene/ENSG00000119685)
