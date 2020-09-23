Phenopolis API schema
=====================

This schema should be created automatically in the Docker Phenopolis API db.

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


Upgrading database schema
-------------------------

The database has a `schema_patch` table used to record the patches applied so
far to the database:

- If you want to add a table or change the database otherwise you should add
  a patch into the `schema/patches` directory.

- In order to apply the new patches available you can run the script
  `script/patch_db.py`. This should happen in production bot if you are a dev
  with a persistent database you may want to run it against your database when
  you pull new code.

- The wrapper `script/patch_docker_db.sh` can be run to apply new patches to
  the database in docker-compose.

- The wrappers `script/patch_dev_db.sh` and `script/patch_prod_db.sh` can be
  run to apply new patches to the dev and prod database (to run on the
  `phenopolis_api` host).


CADD import
-----------

CADD annotations are in a format pretty much compatible with PostgreSQL COPY
command so importing it is straightforward, as long as the first two lines of
comments are dropped:

```
curl -s https://krishna.gs.washington.edu/download/CADD/v1.6/GRCh37/gnomad.genomes.r2.1.1.snv.tsv.gz
    | gzip -cd | egrep -v '^#' \
    | psql -c "copy cadd.annotation from stdin"
        "host=$(scripts/dchost db) user=phenopolis_api dbname=phenopolis_db"
```

You can use `\dt+ cadd.annotation*` in psql to monitor the import status
(check the growing partition size).


gnomAD import
-------------

gnomAD annotations can be imported either from a local file or from an URL
using the `scripts/import_gnomad.py` script. The script only converts the file
into COPY format in order to leave the import destination flexible. For
instance:

```
import_gnomad.py -v https://example.com/gnomad.genomes.r3.0.sites.chr22.vcf.bgz \
    | psql -c "copy gnomad.annotation_v3 from stdin" \
        "host=$(scripts/dchost db) user=phenopolis_api dbname=phenopolis_db"
```

You can import all the chromosome files using:

```
for i in $(seq 1 22) X Y; do
    ./scripts/import_gnomad.py -v \
        https://storage.googleapis.com/gnomad-public/release/3.0/vcf/genomes/gnomad.genomes.r3.0.sites.chr$i.vcf.bgz
    | psql -c "copy gnomad.annotation_v3 from stdin" \
        "host=$(scripts/dchost db) user=phenopolis_api dbname=phenopolis_db"
done
```


HBO import
----------

In order to load hbo files in the docker db:

```
dc exec app python3 ./scripts/import_hpo.py \
    --dsn "host=db user=postgres dbname=phenopolis_db"
```


Kaviar import
-------------

Kaviar annotations can be imported using the `script/import_kaviar.py` script.
The import input can be a local file or an url to downlaod. Note that (chrom,
pos, ref, alt) is nit unique, so the table has an auto-increment `id` field
too.

The script prints on stdout data compatible with the `COPY` command. It can be
used as:

```
./scripts/import_kaviar.py -v \
    http://s3-us-west-2.amazonaws.com/kaviar-160204-public/Kaviar-160204-Public-hg19.vcf.tar \
    | psql -c "copy kaviar.annotation_hg19 (chrom, pos, ref, alt, ac, af, an, ds) from stdin" \
        "host=$(dchost db) dbname=phenopolis_db user=postgres"
```

You can monitor the import status using the `\dt+ kaviar.annotation_hg19_*`
psql command. Using `-v`, the script will print periodically on stdout the number of lines
parsed: full import of hg19 version will read > 207M lines.


Variants import
---------------

You can update variants from a csv file using `scripts/import_variants.py`.
Currently it will only add new records to the table `phenopolis.variant` and
`phenopolis.transcript_consequence` and will make no change to existing
records.

In order to import data from an existing `public.variants` table into the new
tables use `scripts/migrate_variants.sh`.


Ensembl import
--------------

You can import gene, transcript and exon annotations from Ensembl running 
`scripts/import_ensembl.py.

Load the data as follows:
```
\copy ensembl.gene FROM 'genes.csv' delimiter ',' CSV HEADER;
\copy ensembl.transcript FROM 'transcripts.csv' delimiter ',' CSV HEADER;
\copy ensembl.exon FROM 'exons.csv' delimiter ',' CSV HEADER;
\copy ensembl.gene_transcript FROM 'genes_transcripts.csv' delimiter ',' CSV HEADER;
\copy ensembl.transcript_exon FROM 'transcripts_exons.csv' delimiter ',' CSV HEADER;
\copy ensembl.gene_synonym FROM 'gene_synonyms.csv' delimiter ',' CSV HEADER;
\copy ensembl.transcript_uniprot FROM 'transcripts_uniprot.csv' delimiter ',' CSV HEADER;
```

`