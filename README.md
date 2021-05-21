# Phenopolis Browser 2.0

Note this is a new version of the code, the old version is here: https://github.com/phenopolis/phenopolis

If you use Phenopolis Browser please cite our paper: https://academic.oup.com/bioinformatics/article/33/15/2421/3072087

A description of the code setup is available [here](code_setup.md).

## Setup using docker compose

Set the following environment variables in `private.env`:

```bash
AWS_SECRET_ACCESS_KEY=....
AWS_ACCESS_KEY_ID=....

NETLIFY_AUTH_TOKEN=....
```

Note: do not add single or double quotes around the value as they are preserved.

### Build and launch the services

This will set up the database and load the demo database.

```bash
docker-compose up
```

If an image has previously been built this may cause issues with *npm*.
If this doesn't work you many to delete and rebuild your `frontend` docker image:

Remove `frontend` docker images:

```bash
docker rm -f phenopolis_browser_frontend_1 # stop and remove container
docker rmi phenopolis_frontend:latest # remove image
docker-compose build --no-cache frontend # rebuild from scratch
```

and rebuild:

```bash
docker-compose up --build 
```

If you need to install new libraries in the frontend then you may need to run:

```bash
docker-compose up --build 
docker-compose run frontend /bin/bash 
```

The inside the container run:

```bash
npm install 
```

Then quit the container and run:

```bash
docker-compose up
```

Once running, the API server should be available at [http://localhost:5000](http://localhost:5000) and the frontend will be available at [http://localhost:8888](http://localhost:8888)

With the demo data the following exemplar links should work on the frontend:

* My Patient Page: [http://localhost:8888/my_patients](http://localhost:8888/my_patients)
* Individual Page: [http://localhost:8888/individual/PH00008258](http://localhost:8888/individual/PH00008258)
* Variant Page: [http://localhost:8888/variant/22-38212762-A-G](http://localhost:8888/variant/22-38212762-A-G)
* HPO Page: [http://localhost:8888/hpo/HP:0000478](http://localhost:8888/hpo/HP:0000478)
* Gene Page: [http://localhost:8888/gene/ENSG00000119685](http://localhost:8888/gene/ENSG00000119685)

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
