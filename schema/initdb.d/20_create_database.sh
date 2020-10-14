#!/bin/bash

set -euo pipefail

psql -c "create database ${PH_DB_NAME}"
