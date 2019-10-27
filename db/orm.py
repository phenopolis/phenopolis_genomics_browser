
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

## ??how to store strings as char vs varchar (varchar by default)

class Gene(Base):
    __tablename__ = 'genes'
    id   = Column(Integer, primary_key=True)
    stop = Column('stop', String(255)) 
    gene_id = Column('gene_id', String(255)) 
    chrom =  Column('stop', String(2))
    strand = Column('strand', String(1)) # forward or reverse strand
    full_gene_name = Column('full_gene_name', String(255)) 
    gene_name_upper = Column('gene_name_upper', String(255))
    other_names = Column('other_names', String(255))
    canonical_transcript = Column('canonical_transcript', String(255))
    start = Column('start', String(255))
    xstop = Column('xstop', String(255))
    xstart = Column('xstart', String(255))
    gene_name = Column('gene_name', String(255))

"""
CREATE TABLE variants(
  `#CHROM` TEXT,
  `POS` INTEGER,
  `ID` TEXT,
  `REF` TEXT,
  `ALT` TEXT,
  `AF` REAL,
  `AC` INTEGER,
  `AN` INTEGER,
  `HET_COUNT` INTEGER,
  `HOM_COUNT` INTEGER,
  `DP` INTEGER,
  `FS` INTEGER,
  `MLEAC` INTEGER,
  `MLEAF` INTEGER,
  `MQ` INTEGER,
  `FILTER` TEXT,
  `HET` TEXT,
  `HOM` TEXT,
  `most_severe_consequence` TEXT,
  `af_kaviar` REAL,
  `af_gnomad_genomes` REAL,
  `af_jirdc` REAL,
  `af_tommo` REAL,
  `af_krgdb` REAL,
  `af_converge` REAL,
  `af_hgvd` REAL,
  `gene_symbol` TEXT,
  `hgvsc` TEXT,
  `hgvsp` TEXT,
  `dann` REAL,
  `cadd_phred` REAL
)
"""

class Variant(Base):
    __tablename__ = 'variants'
    variant_id = Column(Integer, primary_key = True)
    chrom =  Column('stop', String(2))
    pos = Column('position', String(255))





meta.create_all()


