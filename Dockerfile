FROM python:3.8.3-alpine

# set work directory
WORKDIR /usr/src/app

# set environment variables, to avoid pyc files and flushing buffer
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# install psycopg2 and pysam dependencies
RUN apk update \
    && apk add postgresql-dev gcc g++ python3-dev musl-dev git libffi-dev zlib-dev bzip2-dev xz-dev curl-dev make libcurl libpq

# install dependencies
RUN pip install --upgrade pip
COPY ./requirements.txt /usr/src/app/requirements.txt
RUN pip install -r requirements.txt

# pysam needs cython, however it only works via pip apparantly
RUN pip install -U cython

# Both cython and pysam had to be removed from requirements in order for pysam to work installation
RUN pip install -U pysam==0.15.3

# copy project
COPY ./application.py ./
COPY ./views views/
COPY ./db/__init__.py db/__init__.py

# Clear image
RUN pip cache purge
RUN apk del postgresql-dev gcc python3-dev musl-dev git libffi-dev zlib-dev bzip2-dev xz-dev curl-dev make

CMD [ "python", "./application.py" ]
