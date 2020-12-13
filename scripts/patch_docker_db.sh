#!/bin/bash

# Apply outstanding database patches to the docker-compose local deployment.

set -euo pipefail

dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

container=$(docker-compose ps -q "db")
dbhost=$(docker inspect \
    --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' \
    "$container")

export PGPASSWORD=postgres

exec "$dir/patch_db.py" \
  --dsn "host=$dbhost user=postgres dbname=phenopolis_db" \
  "$@"
