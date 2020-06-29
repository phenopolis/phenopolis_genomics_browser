# Phenopolis API

The Phenopolis API provides endpoints (see `views/` dir) which query the postgres database and return JSON (see `exemplar_data` for examples of responses).
The templates for the JSON response are stored under `response_templates/`.
These are language specific as they are prefixed with en, cn and jp.
These JSON files provide the headers which map to table headers on the [phenopolis_frontend](https://github.com/phenopolis/phenopolis_frontend).
The actual data fields in the JSON gets populated by the endpoints as explained later in the [endpoints](#enpoints) section.

Endpoints are called by [phenopolis_frontend](https://github.com/phenopolis/phenopolis_frontend]) which also takes care of the rendering.


##  How to start the API server


First create the postgres `phenopolis_db_demo` db owned by the `demo` user with password `demo123`:

Then load data into postgres db:

```
psql -U demo -W phenopolis_db_demo < demo/phenopolis_db_demo.sql
```

Then source the `demo_env.sh` file to set the env variables:

```
source demo_env.sh
```

Then you can start the server:

```
python application.py
```

## Docker version for development

First, build the image:

```
docker build -t phenopolis_api .
```
Then, run it, but note that ENV variables must be defined in your shell, e.g. `.bashrc`:

```
docker run -dp 5432:5432 -p 5000:5000 \
-e DB_HOST=host.docker.internal \
-e DB_DATABASE=$DB_DATABASE \
-e DB_USER=$DB_USER \
-e DB_PASSWORD=$DB_PASSWORD \
-e DB_PORT=$DB_PORT \
-e MAIL_USERNAME=no-reply@phenopolis.org \
-e MAIL_PASSWORD="$MAIL_USERNAME" \
-e MAIL_SERVER=$MAIL_SERVER \
-e MAIL_PORT=$MAIL_PORT \
-e MAIL_USE_TLS=true \
-e MAIL_USE_SSL=true \
-e VCF_S3_SECRET=$VCF_S3_SECRET \
-e VCF_S3_KEY=$VCF_S3_KEY \
phenopolis_api
```

### Overview

The postgres database  is composed of the following 8 tables:
```
1. genes
2. variants
3. hom_variants
4. het_variants
5. hpo
6. users
7. users_individuals
8. individuals
```

`genes` and `hpo` tables are definition tables describing all known phenotypes and genes.
These tables are not going to be updated.

Our actual genetic and phenotypic data is loaded in `variants` and `individuals`.
These tables are updated when we get new data.  Also rows in `individuals` can be updated through the `update_patient_data` endpoint.  This endpoint allows users of the [phenopolis_frontend](https://github.com/phenopolis/phenopolis_frontend]) to update the `phenotypes` of individuals.

`users` contains all users of our system who contribute the genetic and phenotypic data.

The other tables are join tables.

### Tables

##### genes

* Defines all known genes.
* n=57820
* The PK should be `gene_id`.
* No FK.
* Not updated.

```
CREATE TABLE genes(
  "stop" INT,
  "gene_id" TEXT,
  "chrom" TEXT,
  "strand" TEXT,
  "full_gene_name" TEXT,
  "gene_name_upper" TEXT,
  "other_names" TEXT,
  "canonical_transcript" TEXT,
  "start" INT,
  "xstop" INT,
  "xstart" INT,
  "gene_name" TEXT
);
CREATE INDEX i_gene_id on genes (gene_id);
CREATE INDEX i_gene_name_upper on genes (gene_name_upper);
CREATE INDEX i_gene_name on genes (gene_name);
CREATE INDEX i_other_names on genes (other_names);
CREATE INDEX i_full_gene_name on genes (full_gene_name);
```

##### variants

* Stores all variants in our dataset. Each variants is present in at least on individual in either HET or HOM format (see `het_variant` and `hom_variant` join tables.
* n=4859970
* The PK is `variant_id` defined as `("#CHROM","POS", "REF","ALT")`. We could define new field with theses fields joined.
* FK `gene_symbol` to `gene` table.
* This table is updated by fresh import of genetic data. Note that the columns in this table might change in the future so it's important the code is generic.

```
CREATE TABLE variants(
  `#CHROM` TEXT,
  `POS` INTEGER,
  `ID` TEXT,
  `REF` TEXT,
  `ALT` TEXT,
  `AF` REAL,
  `AC` INTEGER,
  `AN` INTEGER,
  `HET_COUNT` INTEGER,
  `HOM_COUNT` INTEGER,
  `DP` INTEGER,
  `FS` INTEGER,
  `MLEAC` INTEGER,
  `MLEAF` INTEGER,
  `MQ` INTEGER,
  `FILTER` TEXT,
  `HET` TEXT,
  `HOM` TEXT,
  `most_severe_consequence` TEXT,
  `af_kaviar` REAL,
  `af_gnomad_genomes` REAL,
  `af_jirdc` REAL,
  `af_tommo` REAL,
  `af_krgdb` REAL,
  `af_converge` REAL,
  `af_hgvd` REAL,
  `gene_symbol` TEXT,
  `hgvsc` TEXT,
  `hgvsp` TEXT,
  `dann` REAL,
  `cadd_phred` REAL
);
CREATE INDEX p_gene_symbol_variants on variants (gene_symbol);
CREATE INDEX p_vid_variants on variants ("#CHROM","POS", "REF","ALT");
CREATE INDEX p_af_kaviar_variants on variants (af_kaviar);
CREATE INDEX p_af_gnomad_genomes_variants on variants (af_gnomad_genomes);
CREATE INDEX p_af_jirdc_variants on variants (af_jirdc);
CREATE INDEX p_af_tommo_variants on variants (af_tommo);
CREATE INDEX p_af_krgdb_variants on variants (af_krgdb);
CREATE INDEX p_af_converge_variants on variants (af_converge);
CREATE INDEX p_af_hgvd_variants on variants (af_hgvd);
CREATE INDEX p_AF on variants (AF);
CREATE INDEX p_AC on variants (AC);
```

##### hom_variants and het_variants

* Join tables linking `individual` to `variant`. Variants in HET state are stored in `het_variants`, HOM in `hom_variants`.
* n=5323761 (`het_variants`), n=336255 (`hom_variants`)
* PK none
* FK `individual` to `individuals` table. FK `("#CHROM","POS", "REF","ALT")` to `variants` table.
* Like variants, table get updated when new sequencing data is available.

```
CREATE TABLE hom_variants(
  "#CHROM" TEXT,
  "POS" INT,
  "REF" TEXT,
  "ALT" TEXT,
  "individual" TEXT
);
CREATE INDEX p_vid_hom_variants on hom_variants ("#CHROM","POS", "REF","ALT");
CREATE INDEX p_individual_hom_variants on hom_variants (individual);
```

```
CREATE TABLE het_variants(
  "#CHROM" TEXT,
  "POS" INT,
  "REF" TEXT,
  "ALT" TEXT,
  "individual" TEXT
);
CREATE INDEX p_vid_het_variants on het_variants ("#CHROM","POS", "REF","ALT");
CREATE INDEX p_individual_het_variants on het_variants (individual);
```

##### hpo

* Defines the Human Phenotype Ontology (HPO), these are stored in the individuals table (features columns).
* n=13941
* PK `hpo_id`
* FK none
* Table does not get updated.


```
CREATE TABLE hpo(
  "hpo_id" TEXT,
  "hpo_name" TEXT,
  "hpo_ancestor_ids" TEXT,
  "hpo_ancestor_names" TEXT
);
CREATE INDEX i_hpo_id on hpo (hpo_id);
CREATE INDEX i_hpo_name on hpo (hpo_name);
```

##### users

* Users of Phenopolis (i.e customers) have their data stored here (could also potentially store configs here). Users conntribute genetic patients stored in the `individuals` table.
* n=7
* PK user
* FK `users_indivdiuals`
* Password can get updated from the `change_password` endpoint.  New users could also potentially get created.

```
CREATE TABLE users(
  "user" TEXT,
  "argon_password" TEXT
);
CREATE INDEX i_user on users (user)
```

##### individuals

* Individuals with genetic data. These have Phenpolis id (`internal_id`) and an `external_id` which is the name the customer (user) has given to us. The ownership of `individuals` by `users` is stored in the join table `users_individuals`.
* n=8659
* PK `internal_id`. PK `external_id`
* FK none for known but genes could be one.
* Can be updated by the `update_patient_data` endpoint. The fields relating to patient features required more explanation...


```
CREATE TABLE `individuals` (
  `external_id` TEXT,
  `internal_id` TEXT,
  `sex` TEXT,
  `observed_features` TEXT,
  `unobserved_features` TEXT,
  `genes` TEXT,
  `ethnicity` TEXT,
  `consanguinity` TEXT,
  `PI` TEXT,
  `observed_features_names` TEXT,
  `simplified_observed_features` TEXT,
  `simplified_observed_features_names` TEXT,
  `ancestor_observed_features` TEXT,
  `ancestor_observed_features_names` TEXT
);
CREATE INDEX i_external_id on individuals (external_id);
CREATE INDEX i_internal_id on individuals (internal_id);
CREATE INDEX i_sex on individuals (sex);
CREATE INDEX i_consanguinity on individuals (consanguinity);
CREATE INDEX i_ethnicity on individuals (ethnicity);
CREATE INDEX i_PI on individuals (PI);
CREATE INDEX i_observed_features on individuals (observed_features);
CREATE INDEX i_observed_features_names on individuals (observed_features_names);
CREATE INDEX i_simplified_observed_features on individuals (simplified_observed_features);
CREATE INDEX i_simplified_observed_features_names on individuals (simplified_observed_features_names);
CREATE INDEX i_ancestor_observed_features on individuals (ancestor_observed_features);
CREATE INDEX i_ancestor_observed_features_names on individuals (ancestor_observed_features);
CREATE INDEX i_unobserved_features on individuals (unobserved_features);
CREATE INDEX i_genes on individuals(genes);
```

##### users_individuals

* Join table for `users` and `individuals` for which we have genetic data stored in our db.
* n=11712

```
CREATE TABLE users_individuals(
  "user" TEXT,
  "internal_id" TEXT
);
CREATE INDEX i_user2 on users_individuals (user);
CREATE INDEX i_internal_id2 on users_individuals (internal_id)
```


## endpoints and JSON files

The [phenopolis_frontend](https://github.com/phenopolis/phenopolis_frontend]) is the main way of interacting with the API.  It defines the following pages which each call endpoints in the API:

* The gene page: https://phenopolis.org/gene/ENSG00000119685
* The phenotype page: https://phenopolis.org/hpo/HP:0000639
* The individual (aka patient) page: https://phenopolis.org/individual/PH00000001
* The variant page: https://phenopolis.org/variant/2-112614429-G-A


The JSON config files are user-specific files which allow the user to save their display preferences for each page.  They are stored under `response_templates/` dir.

The "Save configuration" button on the website, which allows the user to select which columns they want displayed.  This triggers the `update_configuration` endpoint which will set the visible to true/false depending on which columns the user wants displayed.


All endpoints are defined under `views/`. There are 13 enpoints:
```
1. /phenopolis_statistics
2. /login
3. /logout
4. /is_logged_in
5. /change_password
6. /autocomplete
7. /best_guess
8. /gene/
9. /hpo
10. /individual
11. /update_individual
12. /variant
13. /save_configuration
```

They  all rely on the user being logged-in (i.e all annotated with the `@requires_auth` decorator) except for `/phenopolis_statistics` and `/login`.

They are language-specific (english "en", chinese "cn", japanese "jp").


#### /phenopolis_statistics

```
__init__.py:@app.route('/phenopolis_statistics')
```

#### /login

This will query the users `users` table and check the `argon2` password POST-param get matches.
If they do the Flask session object is set with the username (`session['user']`).

```
__init__.py:@app.route('/<language>/login', methods=['POST'])
__init__.py:@app.route('/login', methods=['POST'])
```

#### /logout

```
__init__.py:@app.route('/<language>/logout', methods=['POST'])
__init__.py:@app.route('/logout', methods=['POST'])
```

#### /is_logged_in

```
__init__.py:@app.route('/is_logged_in')
```

#### /change_password

Updates the password in `users`.
```
users.py:@app.route('/change_password', methods=['POST'])
```

#### /autocomplete and /best_guess

This suggests search terms:
```
autocomplete.py:@app.route('/<language>/autocomplete/<query_type>/<query>')
autocomplete.py:@app.route('/<language>/autocomplete/<query>')
autocomplete.py:@app.route('/autocomplete/<query_type>/<query>')
autocomplete.py:@app.route('/autocomplete/<query>')
```
Will try and figure out which table (`variants`, `gene` or `individuals`) to search in:
```
autocomplete.py:@app.route('/best_guess')
```

#### /gene

Endpoint called by the [gene](https://phenopolis.org/gene/TTLL5]) page, will return all variants in a gene (see [examplar_data](https://github.com/phenopolis/phenopolis_api/blob/master/exemplar_data/gene-ENSG00000119685.json)):

```
gene.py:@app.route('/<language>/gene/<gene_id>')
gene.py:@app.route('/<language>/gene/<gene_id>/<subset>')
gene.py:@app.route('/gene/<gene_id>')
gene.py:@app.route('/gene/<gene_id>/<subset>')
```

#### /hpo

Endpoint called by the [phenotype](https://phenopolis.org/hpo/HP:0000639]) page.
Will return all individuals with that HPO term (appearing in the ancestor terms) (see [examplar_data](https://github.com/phenopolis/phenopolis_api/blob/master/exemplar_data/hpo-HP:0000550.json)):

```
hpo.py:@app.route('/<language>/hpo/<hpo_id>')
hpo.py:@app.route('/<language>/hpo/<hpo_id>/<subset>')
hpo.py:@app.route('/hpo/<hpo_id>')
hpo.py:@app.route('/hpo/<hpo_id>/<subset>')
```

#### /individual

Endpoint called by the [individual](https://phenopolis.org/individual/PH00008268]) page.
Will return all variants for that individual (see [examplar_data](https://github.com/phenopolis/phenopolis_api/blob/master/exemplar_data/individual-PH00000001.json)):

```
individual.py:@app.route('/<language>/individual/<individual_id>')
individual.py:@app.route('/<language>/individual/<individual_id>/<subset>')
individual.py:@app.route('/individual/<individual_id>')
individual.py:@app.route('/individual/<individual_id>/<subset>')
```

#### /update_individual

There's also the edit button the individual page which calls this endpoint to update `individuals` table in postgres:

```
individual.py:@app.route('/<language>/update_patient_data/<individual_id>',methods=['POST'])
individual.py:@app.route('/update_patient_data/<individual_id>',methods=['POST'])
```

#### /variant

Endpoint called by the [variant](https://phenopolis.org/variant/22-38212762-A-G]) page.
See [examplar_data](https://github.com/phenopolis/phenopolis_api/blob/master/exemplar_data/variant-14-76127692-C-G.json) for example response.

```
variant.py:@app.route('/<language>/variant/<variant_id>')
variant.py:@app.route('/<language>/variant/<variant_id>/<subset>')
variant.py:@app.route('/variant/<variant_id>')
variant.py:@app.route('/variant/<variant_id>/<subset>')
```

#### /save_configuration
Save JSON configuration for display.  This updates a JSON file, does not write to the db.
```
save_configuration.py:@app.route('/<language>/save_configuration/<pageType>/<pagePart>', methods=['POST'])
save_configuration.py:@app.route('/save_configuration/<pageType>/<pagePart>', methods=['POST'])
```


