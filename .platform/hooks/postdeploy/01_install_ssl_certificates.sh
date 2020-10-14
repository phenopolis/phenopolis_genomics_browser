#!/usr/bin/env bash

set -e

if [ -f "/etc/pki/tls/certs/server-key.pem" ]; then
  echo '/etc/pki/tls/certs/server-key.pem already exists'
else
  openssl req -x509 -sha256 -nodes -newkey rsa:4096 -days 365 \
    -keyout /etc/pki/tls/certs/server-key.pem \
    -out /etc/pki/tls/certs/server-cert.pem \
    -subj "/C=GB/ST=London/L=London/O=Phenopolis/OU=Org/CN=api-live.phenopolis.org"
fi

if [ -f "/etc/nginx/conf.d/webapp-ssl.conf" ]; then
  echo '/etc/nginx/conf.d/webapp-ssl.conf already exists'
else
  mv /etc/nginx/conf.d/webapp-ssl.pre /etc/nginx/conf.d/webapp-ssl.conf
fi

echo "Restarting nginx"
nginx -t
nginx -s reload
