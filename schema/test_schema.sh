#!/bin/bash

# Test the correctness of the database schema.
#
# You can run the script in the local docker deployment using:
#
#  docker-compose exec -u postgres db schema/test_schema.sh

set -euo pipefail

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

export PGUSER=postgres

if ! psql -X -c "drop database if exists phenopolis_db_schema_test"; then
    echo "
Maybe you wanted to type:

    docker-compose exec -u postgres db /app/schema/test_schema.sh
" >&2
    exit 1;
fi

psql -eX -c "create database phenopolis_db_schema_test"
psql -e1X -f database.sql --set ON_ERROR_STOP=1 phenopolis_db_schema_test
psql -eX -c "drop database phenopolis_db_schema_test"
