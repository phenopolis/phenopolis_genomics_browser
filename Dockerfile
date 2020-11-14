FROM amazonlinux:latest

# set work directory
WORKDIR /app

# set environment variables, to avoid pyc files and flushing buffer
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY ./requirements.txt /app/requirements.txt
COPY ./scripts/docker_app_packages.sh ./scripts/

RUN ./scripts/docker_app_packages.sh
