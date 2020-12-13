FROM amazonlinux:latest

# set work directory
WORKDIR /app

# Avoid generating .pyc files
ENV PYTHONUNBUFFERED 0

COPY ./requirements.txt /app/requirements.txt
COPY ./scripts/docker_app_packages.sh ./scripts/
RUN ./scripts/docker_app_packages.sh
