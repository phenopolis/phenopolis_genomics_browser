FROM amazonlinux:latest

# set work directory
WORKDIR /app

# set environment variables, to avoid pyc files and flushing buffer
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY ./requirements.txt /app/requirements.txt

RUN yum update -y \
    && yum install -y --setopt install_weak_deps=false python3-3.7.9-1.amzn2.0.1 python3-pip-9.0.3-1.amzn2.0.2 \
    gcc-7.3.1-9.amzn2 python3-devel-3.7.9-1.amzn2.0.1 libcurl-devel-7.61.1-12.amzn2.0.2 zlib-devel-1.2.7-18.amzn2 \
    openssl-devel-1.0.2k-19.amzn2.0.3 bzip2-devel-1.0.6-13.amzn2.0.2 xz-devel-5.2.2-1.amzn2.0.2 make-3.82-24.amzn2 \
    python3-wheel-0.30.0a0-9.amzn2.0.3 \
    && pip3 --no-cache-dir install --upgrade pip \
    && pip --no-cache-dir install gunicorn==20.0.4 \
    && pip --no-cache-dir install -r requirements.txt \
    && pip --no-cache-dir install cyvcf2==0.20.9 \
    && yum -y erase gcc python3-devel libcurl-devel zlib-devel openssl-devel bzip2-devel xz-devel make python3-wheel perl \
    && yum upgrade \
    && yum -y clean all \
    && rm -rf /var/cache/yum/*
