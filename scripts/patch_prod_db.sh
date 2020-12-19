#!/bin/bash

# Apply outstanding database migrations to the phenopolis prod_db database
#
# Usage:
#
# Just run this script on the phenopolis_api host. Extra params are added to
# patch_db.py (e.g. --yes for unattended migration)

set -euo pipefail

export PGDATABASE=phenopolis_prod_db

dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
exec "${dir}/patch_dev_db.sh" \
    "$dir"/../schema/patches/ "$@"
