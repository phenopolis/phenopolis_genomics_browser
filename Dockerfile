FROM debian:buster-slim

# set work directory
WORKDIR /app

# set environment variables, to avoid pyc files and flushing buffer
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# install psycopg2 and pysam dependencies
RUN apt-get update
RUN apt-get install -y python3-pysam=0.15.2+ds-2 python3-pip=18.1-5

# install dependencies
#/usr/bin/pip3 -> /usr/local/bin/pip
RUN pip3 install --upgrade pip

COPY ./requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt

RUN pip install gunicorn==20.0.4

# Clear image
RUN pip cache purge
RUN pip uninstall pip -y
RUN apt-get purge python3-pip -y

# For gunicorn
RUN apt-get install python3-six=1.12.0-1 python3-pkg-resources=40.8.0-1

RUN apt-get autoremove -y && apt-get autoclean -y && apt-get clean -y
