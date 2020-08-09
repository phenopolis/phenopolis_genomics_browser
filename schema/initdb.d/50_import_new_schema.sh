#!/bin/bash

set -euo pipefail
set -x

cd "/app/schema"

psql -1X --set ON_ERROR_STOP=1 -f "database.sql" \
    "dbname=${PH_DB_NAME}"
