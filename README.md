# Phenopolis API

The Phenopolis API provides endpoints (see `views/` dir) which query the sqlite database and return JSON (see `exemplar_data` for examples of responses).
The templates for the JSON response are stored under `response_templates/`.
These are language specific as they are prefixed with en, cn and jp.
These JSON files provide the headers which map to what gets displayed on the fronentd (see [phenopolis_frontend](https://github.com/phenopolis/phenopolis_frontend)).
The actual data in the JSON gets populated by the endpoints as explained later in the [endpoints](#enpoints) section.

Endpoints are called by [phenopolis_frontend](https://github.com/phenopolis/phenopolis_frontend]) which also takes care of the rendering.


##  How to start the API srver

```
python run_server.py
```

`run_server.py` needs the `local.cfg` file which provides the path to:
* the sqlite database
* the JSON config files which determine what gets displayed to the logged-in user

## JSON config files

The JSON config files are user-specific files which allow the user to save their display preferences for each page.  Seee the "Save configuration" button on the website, which allows the user to select which columns they want displayed.  This triggers the `update_configuration` endpoint which will set the visible to true/false depending on which columns the user wants displayed.


## The sqlite database tables


### Overview

The sqlite database  is composed of the following 8 tables:
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
These tables will change when we get new data.  Also `indivdiuals` can be changed throught the website trough the `update_patient_data` endpoint.  This endpoint allows users of Phenopolis to update the `phenotypes' of individuals.

`users` contains all users of our system who contribute the genetic and phenotypic data.

The other tables are join tables.


### genes

* Defines all known genes.
* n=57820
* The PK should be `gene_id`.
* No FK.
* Not updated.

```
CREATE TABLE genes(
  "stop" TEXT,
  "gene_id" TEXT,
  "chrom" TEXT,
  "strand" TEXT,
  "full_gene_name" TEXT,
  "gene_name_upper" TEXT,
  "other_names" TEXT,
  "canonical_transcript" TEXT,
  "start" TEXT,
  "xstop" TEXT,
  "xstart" TEXT,
  "gene_name" TEXT
);
CREATE INDEX i_gene_id on genes (gene_id);
CREATE INDEX i_gene_name_upper on genes (gene_name_upper);
CREATE INDEX i_gene_name on genes (gene_name);
CREATE INDEX i_other_names on genes (other_names);
CREATE INDEX i_full_gene_name on genes (full_gene_name);
```

### variants

* Stores all variants in our dataset. Each variants is present in at least on individuals in either HET or HOM format (see `het_variant` and `hom_variant` tables.
* n=4859970
* The PK is `variant_id` defined as `("#CHROM","POS", "REF","ALT")`. We could define new field with theses fields joined.
* FK `gene_symbol` to `gene` table.
* This table is updated by fresh import of genetict data. Note that the columns in this table might change in the future.

```
CREATE TABLE variants(
  "#CHROM" TEXT,
  "POS" TEXT,
  "ID" TEXT,
  "REF" TEXT,
  "ALT" TEXT,
  "AF" TEXT,
  "AC" TEXT,
  "AN" TEXT,
  "HET_COUNT" TEXT,
  "HOM_COUNT" TEXT,
  "DP" TEXT,
  "FS" TEXT,
  "MLEAC" TEXT,
  "MLEAF" TEXT,
  "MQ" TEXT,
  "FILTER" TEXT,
  "HET" TEXT,
  "HOM" TEXT,
  "most_severe_consequence" TEXT,
  "af_kaviar" TEXT,
  "af_gnomad_genomes" TEXT,
  "af_jirdc" TEXT,
  "af_tommo" TEXT,
  "af_krgdb" TEXT,
  "af_converge" TEXT,
  "af_hgvd" TEXT,
  "gene_symbol" TEXT,
  "hgvsc" TEXT,
  "hgvsp" TEXT,
  "dann" TEXT,
  "cadd_phred" TEXT
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

# hom_variants and het_variants

* Join tables linking `individual` to `variant`. Variants in HET state are stored in `het_variants`, HOM in `hom_variants`.
* n=5323761 (`het_variants`), n=336255 (`hom_variants`)
* PK none
* FK `individual` to `individuals` table. FK `("#CHROM","POS", "REF","ALT")` to `variants` table.
* Like variants, table get updated when new sequencing data is available.

```
CREATE TABLE hom_variants(
  "#CHROM" TEXT,
  "POS" TEXT,
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
  "POS" TEXT,
  "REF" TEXT,
  "ALT" TEXT,
  "individual" TEXT
);
CREATE INDEX p_vid_het_variants on het_variants ("#CHROM","POS", "REF","ALT");
CREATE INDEX p_individual_het_variants on het_variants (individual);
```

# hpo

* Defines the Human Phenotype Ontology, these are stored in the individuals table (features columns).
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

# users

* Users of Phenopolis (i.e customers) have their data stored here (could also potentially store configs here). Users conntribute genetic patients stored in the `individuals` table. 
* n=7
* PK user
* FK `users_indivdiuals`
* Password can get updated from the `change_password` endpoint.  New users could also potentially get created.

```
CREATE TABLE users(
  "user" TEXT,
  "password" TEXT,
  "argon_password" TEXT
);
CREATE INDEX i_user on users (user)
```

# individuals
 
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



# users_individuals

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



## The endpoints

All endpoints are defined under `views.

They nearly all rely on the user being logged-in (see the `@requires_auth` decorator).

They are language-specific (english "en", chinese "cn", japanese "jp") but currently only english is supported.


### /login


This will query the users `users` table and check the `argon2` password matches:

```
__init__.py:@app.route('/<language>/login', methods=['POST'])
__init__.py:@app.route('/login', methods=['POST'])
```

### /statistics

```
__init__.py:@app.route('/phenopolis_statistics')
```


```
__init__.py:@app.route('/<language>/logout', methods=['POST'])
__init__.py:@app.route('/logout', methods=['POST'])
```

```
__init__.py:@app.route('/is_logged_in')
```


```
autocomplete.py:@app.route('/<language>/autocomplete/<query_type>/<query>')
autocomplete.py:@app.route('/<language>/autocomplete/<query>')
autocomplete.py:@app.route('/autocomplete/<query_type>/<query>')
autocomplete.py:@app.route('/autocomplete/<query>')
```
```
autocomplete.py:@app.route('/best_guess')
```
```
gene.py:@app.route('/<language>/gene/<gene_id>')
gene.py:@app.route('/<language>/gene/<gene_id>/<subset>')
gene.py:@app.route('/gene/<gene_id>')
gene.py:@app.route('/gene/<gene_id>/<subset>')
```

```
hpo.py:@app.route('/<language>/hpo/<hpo_id>')
hpo.py:@app.route('/<language>/hpo/<hpo_id>/<subset>')
hpo.py:@app.route('/hpo/<hpo_id>')
hpo.py:@app.route('/hpo/<hpo_id>/<subset>')
```

```
individual.py:@app.route('/<language>/individual/<individual_id>')
individual.py:@app.route('/<language>/individual/<individual_id>/<subset>')
individual.py:@app.route('/individual/<individual_id>')
individual.py:@app.route('/individual/<individual_id>/<subset>')
```

This endpoint updates the sqlite db.
```
individual.py:@app.route('/<language>/update_patient_data/<individual_id>',methods=['POST'])
individual.py:@app.route('/update_patient_data/<individual_id>',methods=['POST'])
```

Save JSON configuration for display.  This updates a JSON file, does not write to the db.
```
save_configuration.py:@app.route('/<language>/save_configuration/<pageType>/<pagePart>', methods=['POST'])
save_configuration.py:@app.route('/save_configuration/<pageType>/<pagePart>', methods=['POST'])
```

```
users.py:@app.route('/change_password', methods=['POST'])
```

```
variant.py:@app.route('/<language>/variant/<variant_id>')
variant.py:@app.route('/<language>/variant/<variant_id>/<subset>')
```
variant.py:@app.route('/variant/<variant_id>')
variant.py:@app.route('/variant/<variant_id>/<subset>')
```


