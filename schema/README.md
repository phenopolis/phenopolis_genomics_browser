# Phenopolis API schema

Use [yEd](https://www.yworks.com/products/yed) to visualise and edit `schema/phenopolis_db.graphml`

This schema should be created automatically in the Docker Phenopolis API db.

Generally, if you have an existing database and superuser, you can create it
using:

```bash
    psql -1X -f database.sql
```

## Connecting to the docker-compose database from the host

The database port is not exposed. However you can connect to a running
container. The `script/dchost NAME` script can be used to get the container
name, e.g.:

```bash
psql "host=$(scripts/dchost db) user=phenopolis_api dbname=phenopolis_db"
```

You can avoid to specify the password by adding it to the [.pgpass file](https://www.postgresql.org/docs/current/libpq-pgpass.html)

```bash
# hostname:port:database:username:password
*:*:*:phenopolis_api:phenopolis_api
```

## Upgrading database schema

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

## Importing individual variants

Individual variants ( `VAR.tsv` ) files can be loaded from a local file or from
AWS. In the latter case you should export aws credentials as env var.

```bash
export AWS_SECRET_ACCESS_KEY=bT...7z
export AWS_ACCESS_KEY_ID=QB...4B
./scripts/import_individual_variants.py \
    --dsn "host=$(scripts/dchost db) user=phenopolis_api dbname=phenopolis_db" \
    s3://phenopolis-individuals/PH00009704/VAR.tsv
```

## CADD import

CADD annotations are in a format pretty much compatible with PostgreSQL COPY
command so importing it is straightforward, as long as the first two lines of
comments are dropped:

```bash

curl -s https://krishna.gs.washington.edu/download/CADD/v1.6/GRCh37/gnomad.genomes.r2.1.1.snv.tsv.gz
    | gzip -cd | egrep -v '^#' \
    | psql -c "copy cadd.annotation from stdin"
        "host=$(scripts/dchost db) user=phenopolis_api dbname=phenopolis_db"
```

You can use `\dt+ cadd.annotation*` in psql to monitor the import status
(check the growing partition size).

## gnomAD import

gnomAD annotations can be imported either from a local file or from an URL
using the `scripts/import_gnomad.py` script. The script only converts the file
into COPY format in order to leave the import destination flexible. For
instance:

```bash
import_gnomad.py -v https://example.com/gnomad.genomes.r3.0.sites.chr22.vcf.bgz \
    | psql -c "copy gnomad.annotation_v3 from stdin" \
        "host=$(scripts/dchost db) user=phenopolis_api dbname=phenopolis_db"
```

You can import all the chromosome files using:

```bash
for i in $(seq 1 22) X Y; do
    ./scripts/import_gnomad.py -v \
        https://storage.googleapis.com/gnomad-public/release/3.0/vcf/genomes/gnomad.genomes.r3.0.sites.chr$i.vcf.bgz
    | psql -c "copy gnomad.annotation_v3 from stdin" \
        "host=$(scripts/dchost db) user=phenopolis_api dbname=phenopolis_db"
done
```

## HBO import

In order to load hbo files in the docker db:

```bash
dc exec app python3 ./scripts/import_hpo.py \
    --dsn "host=db user=postgres dbname=phenopolis_db"
```

## Kaviar import

Kaviar annotations can be imported using the `script/import_kaviar.py` script.
The import input can be a local file or an url to downlaod. Note that (chrom, pos, ref, alt) is nit unique, so the table has an auto-increment `id` field
too.

The script prints on stdout data compatible with the `COPY` command. It can be
used as:

```bash
./scripts/import_kaviar.py -v \
    http://s3-us-west-2.amazonaws.com/kaviar-160204-public/Kaviar-160204-Public-hg19.vcf.tar \
    | psql -c "copy kaviar.annotation_hg19 (chrom, pos, ref, alt, ac, af, an, ds) from stdin" \
        "host=$(dchost db) dbname=phenopolis_db user=postgres"
```

You can monitor the import status using the `\dt+ kaviar.annotation_hg19_*`

psql command. Using `-v` , the script will print periodically on stdout the number of lines
parsed: full import of hg19 version will read > 207M lines.

## Variants import

You can update variants from a csv file using `scripts/import_variants.py` .
Currently it will only add new records to the table `phenopolis.variant` and
`phenopolis.transcript_consequence` and will make no change to existing
records.

In order to import data from an existing `public.variants` table into the new
tables use `scripts/migrate_variants.sh` .

## Ensembl import

You can import gene, transcript and exon annotations from Ensembl running
`scripts/import_ensembl.py` .

Load the data as follows:

```sql
\copy ensembl.gene FROM 'genes.csv' delimiter ',' CSV HEADER;
\copy ensembl.transcript FROM 'transcripts.csv' delimiter ',' CSV HEADER;
\copy ensembl.exon FROM 'exons.csv' delimiter ',' CSV HEADER;
\copy ensembl.gene_transcript FROM 'genes_transcripts.csv' delimiter ',' CSV HEADER;
\copy ensembl.transcript_exon FROM 'transcripts_exons.csv' delimiter ',' CSV HEADER;
\copy ensembl.gene_synonym FROM 'gene_synonyms.csv' delimiter ',' CSV HEADER;
\copy ensembl.transcript_uniprot FROM 'transcripts_uniprot.csv' delimiter ',' CSV HEADER;
```

## How to query

### How to query HPO

> Q: I want to query it to obtain all child descendants of  HP:0000478 |
> Abnormality of the eye

The HPO terms are in the `hpo.term` table:

```sql
phenopolis_dev_db=> select id, hpo_id, name, description from hpo.term where hpo_id = 'HP:0000478';
 id  |   hpo_id   |          name          |                                       description
-----+------------+------------------------+-----------------------------------------------------------------------------------------
 478 | HP:0000478 | Abnormality of the eye | Any abnormality of the eye, including location, spacing, and intraocular abnormalities.
(1 row)
```

HPO terms are in a graph. The edges of the graph are in the `hpo.is_a` table:

```sql
phenopolis_dev_db=> select * from hpo.is_a limit 3;
 term_id | is_a_id
---------+---------
       2 |    1507
       3 |     107
       5 |       1
(3 rows)
```

The `hpo.is_a_path` is a materialised view which has all the paths from the
root to any term expanded, for instance these are all the paths _leading to_
term 478:

```sql
phenopolis_dev_db=> select * from hpo.is_a_path where term_id = 478;
 term_id |   path
---------+-----------
     478 | 1.118.478
(1 row)
```

The `path` field of this table is an
[ltree](https://www.postgresql.org/docs/current/ltree.html), which is a data
type holding a path of labels. It allows for efficient querying of all the
paths containing an element: if we are looking for `478` in any position we can
query:

```sql
phenopolis_dev_db=> select * from hpo.is_a_path where path ~ '*.478.*' limit 3;
 term_id |                 path
---------+--------------------------------------
   11496 | 1.118.478.12372.4328.481.11496
   12155 | 1.118.478.12372.4328.481.12155
   25349 | 1.118.478.12372.4328.481.25348.25349
(3 rows)
```

Put together, the original question can be answered with:

```sql
select t.hpo_id, t.name
from hpo.term t
where exists (
    select 1 from hpo.is_a_path p
    where p.term_id = t.id
    and p.path ~ (
        select ('*.' || id || '.*')::lquery
        from hpo.term t2
        where t2.hpo_id = 'HP:0000478'
    )
)
limit 10;
   hpo_id   |                     name
------------+----------------------------------------------
 HP:0001489 | Posterior vitreous detachment
 HP:0031766 | Convergence excess esotropia
 HP:0009914 | Cyclopia
 HP:0031789 | Against the rule astigmatism
 HP:0000539 | Abnormality of refraction
 HP:0008034 | Abnormal iris pigmentation
 HP:0007970 | Congenital ptosis
 HP:0007958 | Optic atrophy from cranial nerve compression
 HP:0010545 | Downbeat nystagmus
 HP:0031788 | With the rule astigmatism
(10 rows)
```

(after removing the limit there are 1125 terms).

## Manual fixes applied to Dev_DB (to reproduce in Prod_DB)

1. **CRITICAL**: apply this fix before doing `scripts/migrate_individuals.sh`.

    Fix `PH00002126` in `public.individuals` as it misses `hpo_id`:

    ```sql
    update public.individuals set observed_features = (
        select string_agg(DISTINCT t.hpo_id , ',' ORDER BY t.hpo_id) AS hpo_ids from hpo.term t 
        where t."name" = any(string_to_array((select observed_features_names from public.individuals i where i.internal_id = 'PH00002126'),';'))
    ),
    simplified_observed_features = (
        select string_agg(DISTINCT t.hpo_id , ',' ORDER BY t.hpo_id) AS hpo_ids from hpo.term t 
        where t."name" = any(string_to_array((select observed_features_names from public.individuals i where i.internal_id = 'PH00002126'),';'))
    )
    where internal_id = 'PH00002126'
    ;
    ```

    Fix applied on 02/04/21. **Present in Prod_DB**.

2. `Admin` must co-own `patients` with `user`:

    ```sql
    insert into public.users_individuals ("user", internal_id)
    select 'Admin', phenopolis_id from (
        select i.phenopolis_id from phenopolis.individual i
        except
        select ui.internal_id from public.users_individuals ui
    ) as foo
    ;
    ```

    Fix applied on 02/04/21, 120 rows added. Likely not an issue in Prod_DB.

3. Patients created with broken code had `simplified` HPO_IDs missing, related to (2):

    ```sql
    insert into phenopolis.individual_feature (individual_id,feature_id,"type")
    select individual_id, feature_id, 'simplified' 
    from phenopolis.individual_feature where individual_id in (
        select if2.individual_id from phenopolis.individual_feature if2 where if2."type" = 'observed'
        except
        select if2.individual_id from phenopolis.individual_feature if2 where if2."type" = 'simplified'
    ) and "type" = 'observed'
    ;
    ```

    Fix applied on 06/04/21, 648 rows added. Likely not an issue in Prod_DB.

4. Fix patients entries with an empty `user`:

    Check for the ofending rows:

    ```sql
    select count(ui.internal_id) from public.users_individuals ui where ui."user" = '';
    ```

    4980 rows reported.

    Check if for a given `internal_id` there is at least one real user:

    ```sql
    select ui.internal_id from public.users_individuals ui where ui."user" = ''
    except
    select ui.internal_id from public.users_individuals ui where ui."user" <> '';

    ```

    It must return Zero rows.

    Apply fix:

    ```sql
    delete from public.users_individuals where "user" = '';
    ```

    Fix applied on 06/04/21, 4980 rows removed. **Present in Prod_DB**.
