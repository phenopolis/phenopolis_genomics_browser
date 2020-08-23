#!/bin/bash

# Apply outstanding database patches to the docker-compose local deployment.

set -euo pipefail

exec docker-compose run --rm --no-deps \
  -e PGPASSWORD=postgres \
  app /app/scripts/patch_db.py \
  --dsn "host=db user=postgres dbname=phenopolis_db" \
  "$@"
