### Phenopolis API

The Phenopolis API provides endpoints (see `views` dir) which query the sqlite database and return JSON (see `exemplar_data` for examples of responses).  The templates for the JSON response are stored under `response_templates`. These are going to be language specific.

These endpoints are queried and rendered by `phenopolis_frontend`.

##  How to run the API

```
python run_server.py
```

`run_server.py` needs the `local.cfg` file which provides the path to:
* the sqlite database
* the JSON config files which determine what gets displayed to the logged-in user



## The sqlite database tables

```
genes
variants
hom_variants
het_variants
hpo
users
users_individuals
individuals
```


## The endpoints

```
```

```
```


