
import os
from sqlalchemy import create_engine
from sqlalchemy import MetaData


#"postgres://admin:donotusethispassword@aws-us-east-1-portal.19.dblayer.com:15813/compose"

host=os.environ['DB_HOST']
database=os.environ['DB_DATABASE']
user=os.environ['DB_USER']
password=os.environ['DB_PASSWORD']
engine = create_engine('postgres://%s:%s@%s/%s'% (user,password,host,database))
engine.connect()

from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship, backref
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

meta=MetaData(engine)

"""
CREATE TABLE public.genes (
    stop text,
    gene_id text,
    chrom text,
    strand text,
    full_gene_name text,
    gene_name_upper text,
    other_names text,
    canonical_transcript text,
    start text,
    xstop text,
    xstart text,
    gene_name text
);
"""
class Gene(Base):
    __tablename__ = 'genes'
    id   = Column(Integer, primary_key=True)


meta.create_all()


