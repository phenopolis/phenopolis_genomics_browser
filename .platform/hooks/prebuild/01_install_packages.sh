#!/bin/bash

yum install -y libcurl-devel bzip2-devel xz-devel zlib-devel

amazon-linux-extras enable postgresql11

yum install -y postgresql

"${PYTHONPATH}/pip3" install cython
"${PYTHONPATH}/pip3" install pysam==0.15.3
