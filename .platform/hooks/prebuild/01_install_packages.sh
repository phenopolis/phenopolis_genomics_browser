#!/bin/bash

yum install -y libcurl-devel bzip2-devel xz-devel zlib-devel

# packages needed in Docker for cyvcf2, likely needed here
yum install -y gcc python3-devel openssl-devel make python3-wheel

amazon-linux-extras enable postgresql11

yum install -y postgresql

"${PYTHONPATH}/pip3" install cython
"${PYTHONPATH}/pip3" install cyvcf2==0.20.9
