#!/usr/bin/env bash

set -euo pipefail

cleanup() {
    if $remove; then
        echo ">>> Removing created _redirects"
        rm -fv /app/_redirects
        exit 3
    else
        echo "Bye Bye!"
        exit 5
    fi
}
reddoc="_redirects_docker"
if [ -n "${1}" ]; then
    reddoc=${1}
    echo "Using arg ${reddoc}"
fi
remove=false
if [ ! -s "/app/_redirects" ]; then
    echo ">>> Copying ${reddoc} to _redirects"
    cp "/app/${reddoc}" /app/_redirects
    remove=true
else
    echo ">>> _redirects already exists"
fi

#trap cleanup INT TERM EXIT
trap cleanup INT TERM EXIT QUIT WINCH ERR
#while true; do :; done
echo ">>> Starting NETLIFY"
netlify dev | tee dev.log &
echo ">>> Waiting..."
wait
