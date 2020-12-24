#!/bin/bash

# Apply outstanding database migrations to the phenopolis dev_db database
#
# Usage:
#
# Just run this script on the phenopolis_api host. Extra params are added to
# patch_db.py (e.g. --yes for unattended migration)

set -euo pipefail

export PGHOST=phenopolis-api-databases.cjaird0q4nq9.eu-west-2.rds.amazonaws.com
export PGUSER=phenopolis_root
export PGDATABASE=${PGDATABASE:-phenopolis_dev_db}

dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
exec /home/ec2-user/phenopolis_api/.venv/bin/python3 "${dir}/patch_db.py" \
    "$dir"/../schema/patches/ "$@"
