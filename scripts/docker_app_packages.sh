#!/bin/bash

# Install the packages required by the API in Docker.

set -euo pipefail
set -x

yum update -y

yum install -y --setopt install_weak_deps=false \
    bzip2-devel gcc libcurl-devel make openssl-devel python3 python3-devel \
    xz-devel zlib-devel git

pip3 install --upgrade pip
pip install -r requirements.txt
pip install "gunicorn>=20.0,<20.1"

yum -y erase \
    bzip2-devel gcc libcurl-devel make openssl-devel perl python3-devel \
    xz-devel zlib-devel

yum -y clean all
rm -rf /var/cache/yum/* /root/.cache
