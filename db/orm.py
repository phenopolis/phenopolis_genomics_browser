
import os
from sqlalchemy import create_engine
from sqlalchemy import MetaData


#"postgres://admin:donotusethispassword@aws-us-east-1-portal.19.dblayer.com:15813/compose"

os.environ['DB_HOST'] = 'localhost'
os.environ['DB_DATABASE'] = 'phenopolis_db_demo'
os.environ['DB_USER'] = 'demo'
os.environ['DB_PASSWORD'] = 'demo123'
os.environ['DB_PORT'] = '5433'

host=os.environ['DB_HOST']
database=os.environ['DB_DATABASE']
user=os.environ['DB_USER']
password=os.environ['DB_PASSWORD']
port=os.environ['DB_PORT']
engine = create_engine('postgres://%s:%s@%s:%s/%s'% (user,password,host,port,database))
engine.connect()

from sqlalchemy import Column, String, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship, backref
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

meta=MetaData(engine)

class Gene(Base):
    __tablename__ = 'genes'
    gene_id = Column('gene_id', String(255), primary_key=True)    
    stop = Column('stop', String(255)) 
    chrom =  Column('chrom', String(2))
    strand = Column('strand', String(1)) 
    full_gene_name = Column('full_gene_name', String(255)) 
    gene_name_upper = Column('gene_name_upper', String(255))
    other_names = Column('other_names', String(255))
    canonical_transcript = Column('canonical_transcript', String(255))
    start = Column('start', String(255))
    xstop = Column('xstop', String(255))
    xstart = Column('xstart', String(255))
    gene_name = Column('gene_name', String(255))
    variants = relationship('Variant', backref='genes', lazy = True)


class Variant(Base):
    __tablename__ = 'variants'
    variant_id = Column(Integer, primary_key = True) # needs composite key
    chrom =  Column('stop', String(2))
    pos = Column('position', String(255))
    id = Column('id', String(255))
    ref = Column('ref', String(255))
    alt = Column('alt', String(255))
    af = Column('af', Float)
    ac = Column('ac', Integer)
    an = Column('an', Integer)
    het_count = Column('het_count', Integer)
    hom_count = Column('hom_count', Integer)
    dp = Column('dp', Integer)
    fs = Column('fs', Integer)
    mleac = Column('mleac', Integer)
    mleaf = Column('mleaf', Integer)
    mq = Column('mq', Integer)
    filter = Column('filter', String(255))
    het = Column('het', String(255))
    hom = Column('hom', String(255))
    most_severe_consequence = Column('most_severe_consequence', String(255))
    af_kaviar = Column('af_kaviar', Float)
    af_gnomad_genomes = Column('af_gnomad_genomes', Float)
    af_jirdc = Column('af_jirdc', Float)
    af_tommo = Column('af_tommo', Float)
    af_krgdb = Column('af_krgdb', Float)
    af_converge = Column('af_converge', Float)
    af_hgvd = Column('af_hgvd', Float)
    gene_id = Column('gene_id', String(255), ForeignKey('genes.gene_id'))
    hgvsc = Column('hgvsc', String(255))
    hgvsp = Column('hgvsp', String(255))
    dann = Column('dann', Float)
    cadd_phred = Column('cadd_phred', Float)
    het_variants = relationship('HET_Variant', backref = backref('variants', uselist = False), lazy = True) # one to one relationships
    hom_variants = relationship('HOM_Variant', backref = backref('variants', uselist = False), lazy = True)

class HET_Variant(Base):
    __tablename__ = 'het_variants'
    variant_id = Column(Integer, ForeignKey('variants.variant_id'), primary_key = True) # needs composite key
    chrom =  Column('chrom', String(2))
    pos = Column('position', String(255))
    ref = Column('ref', String(255))
    alt = Column('alt', String(255))
    individual = Column('individual', String(255), ForeignKey('individuals.internal_id'))

class HOM_Variant(Base):
    __tablename__ = 'hom_variants'
    variant_id = Column(Integer, ForeignKey('variants.variant_id'), primary_key = True) # needs composite key
    chrom =  Column('chrom', String(2))
    pos = Column('position', String(255))
    ref = Column('ref', String(255))
    alt = Column('alt', String(255))
    individual = Column('individual', String(255), ForeignKey('individuals.internal_id'))

class HPO(Base):
    __tablename__ = 'hpo'
    hpo_id = Column('hpo_id', String(255), primary_key = True)
    hpo_ancestor_ids = Column('hpo_ancestor_ids', String(255))
    hpo_ancestor_names = Column('hop_ancestor_names', String(255))

class User(Base):
    __tablename__ = 'users'
    user = Column('user', primary_key = True)
    argon_password = Column('argon_password', String(255))
    individuals = relationship('User_Individual', backref = 'users')


class Individual(Base):
    __tablename__ = 'individuals'
    external_id = Column('external_id', String(255), primary_key = True)
    internal_id = Column('internal_id', String(255), primary_key = True)
    sex = Column('sex', String(1))
    observed_features = Column('observed_features', String(255))
    unobserved_features = Column('unobserved_features', String(255))
    genes = Column('genes', String(255))
    ethnicity = Column('ethnicity', String(255))
    consanguinity = Column('consanguinity', String(255))
    pi = Column('pi', String(255))
    observed_features_names = Column('observed_features_names', String(255))
    simplified_observed_features = Column('simplified_observed_features', String(255))
    simplified_observed_features_names = Column('simplified_observed_features_names', String(255))
    ancestor_observed_features = Column('ancestor_observed_features', String(255))
    ancestor_observed_features_names = Column('ancestor_observed_features_names', String(255))
    het_variants = relationship('HET_Variant', backref = 'individuals', lazy = True)
    hom_variants = relationship('HOM_Variant', backref = 'individuals', lazy = True)
    user = relationship('User_Individual', backref = 'individuals', lazy = True)

class User_Individual(Base):
    __tablename__ = 'users_individuals'
    user = Column('user', String(255), ForeignKey('users.user'))
    internal_id = Column('internal_id', String(255), ForeignKey('individuals.internal_id'), primary_key = True)

meta.create_all()


