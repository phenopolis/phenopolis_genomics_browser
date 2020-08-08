#!/bin/bash

set -euo pipefail

psql -1X --set ON_ERROR_STOP=1 -f "/app/db/import_schema.sql" \
    "dbname=${PH_DB_NAME}"
