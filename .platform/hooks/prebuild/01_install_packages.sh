#!/bin/bash

yum install -y libcurl-devel bzip2-devel xz-devel

yum install -y postgresql

/opt/python/run/venv/bin/pip3 install cython
