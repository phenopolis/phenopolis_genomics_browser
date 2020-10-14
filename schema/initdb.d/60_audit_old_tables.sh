#!/bin/bash

set -euo pipefail

cd "/app/schema"

psql -1X --set ON_ERROR_STOP=1 -f "/app/db/audit.sql" \
    "dbname=${PH_DB_NAME}"
