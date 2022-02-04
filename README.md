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
HG_ASSEMBLY=GRCh37

# Uploaded files are local (0) or remote (1)?
# Local uses MinIO, remote uses AWS S3, see private.env for further setup
REMOTE_FILES=0

# Set if local path or remote "s3://_bucket_/_folder_/_file_.vcf.gz" (see private.env for more)
# It's possible to use local uploaded files with remote VCF_FILE
VCF_FILE=_my_folder_/_my_file_.vcf.gz

# Set bucket name and region
BUCKET=_my_bucket_name_
REGION=eu-west-2
```

Where `VCF_FILE` can be either a local file (e.g. `path/file.vcf.gz`) or a remote `S3` file (e.g. `s3://any_remote/file.vcf.gz`)

It's critical that the `VCF_FILE` has along its `tbi` file as well.

* Create `private.env` and add:

```bash
APP_ENV=prod # or debug

# Set public.env REMOTE_FILES accordingly

# Set below if using AWS S3 for uploaded files and/or remote VCF_FILE in public.env
AWS_SECRET_ACCESS_KEY=... # ignore it if not using AWS S3
AWS_ACCESS_KEY_ID=... # ignore it if not using AWS S3

# Set below if using local uploaded files otherwise ignore them
MINIO_ROOT_USER=minio # change it for your own safety
MINIO_ROOT_PASSWORD=minio123 # change it for your own safety
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
