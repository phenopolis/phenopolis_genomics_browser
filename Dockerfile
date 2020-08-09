FROM debian:buster-slim

# set work directory
WORKDIR /app

# set environment variables, to avoid pyc files and flushing buffer
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY ./requirements.txt /app/requirements.txt

RUN apt-get update \
    && apt-get install --no-install-recommends -y python3-pip=18.1-5 python3-pysam=0.15.2+ds-2 \
    && pip3 --no-cache-dir install --upgrade pip \
    && pip --no-cache-dir install setuptools==49.1.0 gunicorn==20.0.4 \
    && pip --no-cache-dir install -r requirements.txt \
    && apt-get autoremove -y && apt-get autoclean -y && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*
