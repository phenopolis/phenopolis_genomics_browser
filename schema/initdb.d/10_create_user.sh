#!/bin/bash

set -euo pipefail
# set -x

psql -c "create user ${PH_DB_USER}"
psql -c "alter user ${PH_DB_USER} with password '${PH_DB_PASSWORD}'"
