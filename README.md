# Phenopolis Genomics Browser 2.0

> An Online Platform for Genetic & Phenotype Data

[![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/phenopolis_browser/community)
[![check_app_api](https://github.com/phenopolis/phenopolis_browser/actions/workflows/python-app.yml/badge.svg)](https://github.com/phenopolis/phenopolis_browser/actions/workflows/python-app.yml)

Note this is a new version of the code, the old version is [here](https://github.com/phenopolis/phenopolis).

If you use Phenopolis Genomics Browser please cite our [paper](https://academic.oup.com/bioinformatics/article/33/15/2421/3072087).

A description of the code setup is available [here](code_setup.md).

## Setup using docker compose

Set the following environment variable in

* `public.env`:

```bash
...
HG_ASSEMBLY=GRCh37 # or GRCh38

# Set if local path or remote "s3://_bucket_/_folder_/_file_.vcf.gz"
VCF_FILE=schema/small_demo.vcf.gz
```

Where `VCF_FILE` can be either a local file (e.g. `path/file.vcf.gz`) or a remote `S3` file (e.g. `s3://any_remote/file.vcf.gz`)

It's critical that the `VCF_FILE` has along its `tbi` file as well.

* Create `private.env` and add:

```bash
APP_ENV=prod # or debug

# Set bucket name and region
BUCKET=_your_bucket_
REGION=_region_

# Set below if using remote S3 (AWS, Wasabi etc.) or local (MinIO)
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...

# Wasabi example
# S3_ACCESS_KEY_ID=...
# S3_SECRET_ACCESS_KEY=...
# ENDPOINT=https://s3.eu-central-1.wasabisys.com
# REGION=eu-central-1

# MinIO example
# S3_ACCESS_KEY_ID=minio # change it for your own safety
# S3_SECRET_ACCESS_KEY=minio123 # change it for your own safety
# ENDPOINT=http://minio-server:9000

# Set accordingly
MAIL_SUPPRESS_SEND=false # or true
MAIL_PASSWORD=...
```

Note: do not add single or double quotes around the value as they are preserved.

### Build and launch the services

This will set up the database and load the demo database running local S3 file service (by [MinIO](https://min.io/)).

```bash
docker-compose -f docker-compose.yml -f docker-compose.minio1.yml up
```

If one wants to rebuild fresh images, one can do:

```bash
docker compose build --no-cache # rebuild from scratch frontend and api
docker compose build --no-cache frontend # will rebuild just frontend for example
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
docker compose up --build [--no-cache]
```

## Importing other data into the database

Edit [db/import_demo_data.sql](db/import_demo_data.sql) to import the correct CSV files into the database.

If you do not wish to load any data, simply comment out all the lines within this file.

### Connecting to the Postgres Database

It is possible to connect to the postgres shell as follows:

```bash
# Note change the values of the user and database name required
docker compose exec db psql --user phenopolis_api --dbname phenopolis_db
```

> Note: When importing an AWS RDS SQL dump, you will need to create the below user before importing the SQL file:

```bash
docker compose exec db sh -c 'createuser rdsadmin -U phenopolis_api'
```
