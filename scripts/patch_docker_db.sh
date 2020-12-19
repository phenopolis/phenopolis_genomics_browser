#!/bin/bash

# Apply outstanding database patches to the docker-compose local deployment.

set -euo pipefail

dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

container=$(docker-compose ps -q "db")
dbhost=$(docker inspect \
    --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' \
    "$container")

export PGPASSWORD=postgres
export PATCH_DSN=${PATCH_DSN-"host=$dbhost user=postgres dbname=phenopolis_db"}

exec "$dir/patch_db.py" "$dir"/../schema/patches/ "$@"
