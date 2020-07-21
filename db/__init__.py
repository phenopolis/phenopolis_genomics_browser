'''
DB schema
'''
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from sqlalchemy import MetaData
# "postgres://admin:donotusethispassword@aws-us-east-1-portal.19.dblayer.com:15813/compose"
from sqlalchemy import Column, String, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship, backref
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import and_

Base = declarative_base()

# meta=MetaData(engine)


class Gene(Base):
    __tablename__ = 'genes'
    gene_id = Column('gene_id', String(255), primary_key=True)
    stop = Column('stop', String(255))
    chrom = Column('chrom', String(2))
    strand = Column('strand', String(1))
    full_gene_name = Column('full_gene_name', String(255))
    gene_name_upper = Column('gene_name_upper', String(255))
    other_names = Column('other_names', String(255))
    canonical_transcript = Column('canonical_transcript', String(255))
    start = Column('start', Integer)
    xstop = Column('xstop', Integer)
    xstart = Column('xstart', Integer)
    gene_name = Column('gene_name', String(255))
    variants = relationship('Variant', backref='genes', lazy=True)

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class Variant(Base):
    __tablename__ = 'variants'
    variant_id = Column(Integer, primary_key=True)  # needs composite key
    CHROM = Column('CHROM', String(2))
    POS = Column('POS', String(255))
    ID = Column('ID', String(255))
    REF = Column('REF', String(255))
    ALT = Column('ALT', String(255))
    AF = Column('AF', Float)
    AC = Column('AC', Integer)
    AN = Column('AN', Integer)
    HET_COUNT = Column('HET_COUNT', Integer)
    HOM_COUNT = Column('HOM_COUNT', Integer)
    DP = Column('DP', Integer)
    FS = Column('FS', Integer)
    MLEAC = Column('MLEAC', Integer)
    MLEAF = Column('MLEAF', Integer)
    MQ = Column('MQ', Integer)
    FILTER = Column('FILTER', String(255))
    HET = Column('HET', String(255))
    HOM = Column('HOM', String(255))
    most_severe_consequence = Column('most_severe_consequence', String(255))
    af_kaviar = Column('af_kaviar', String)
    af_gnomad_genomes = Column('af_gnomad_genomes', String)
    af_jirdc = Column('af_jirdc', String)
    af_tommo = Column('af_tommo', String)
    af_krgdb = Column('af_krgdb', String)
    af_converge = Column('af_converge', String)
    af_hgvd = Column('af_hgvd', String)
    gene_id = Column('gene_id', String(255), ForeignKey('genes.gene_id'))
    hgvsc = Column('hgvsc', String(255))
    hgvsp = Column('hgvsp', String(255))
    dann = Column('dann', String)
    cadd_phred = Column('cadd_phred', String)

    # het_variants = relationship('HET_Variant', backref = backref('variants', uselist = False), lazy = True) # one to one relationships
    # hom_variants = relationship('HOM_Variant', backref = backref('variants', uselist = False), lazy = True)
    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class HET_Variant(Base):
    __tablename__ = 'het_variants'
    variant_id = Column(Integer, ForeignKey('variants.variant_id'), primary_key=True)  # needs composite key
    chrom = Column('chrom', String(2))
    pos = Column('position', String(255))
    ref = Column('ref', String(255))
    alt = Column('alt', String(255))
    individual = Column('individual', String(255), ForeignKey('individuals.internal_id'))


class HOM_Variant(Base):
    __tablename__ = 'hom_variants'
    variant_id = Column(Integer, ForeignKey('variants.variant_id'), primary_key=True)  # needs composite key
    chrom = Column('chrom', String(2))
    pos = Column('position', String(255))
    ref = Column('ref', String(255))
    alt = Column('alt', String(255))
    individual = Column('individual', String(255), ForeignKey('individuals.internal_id'))


class HPO(Base):
    __tablename__ = 'hpo'
    hpo_id = Column('hpo_id', String(255), primary_key=True)
    hpo_name = Column('hpo_name', String(255))
    hpo_ancestor_ids = Column('hpo_ancestor_ids', String(255))
    hpo_ancestor_names = Column('hpo_ancestor_names', String(255))

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class User(Base):
    __tablename__ = 'users'
    user = Column('user', primary_key=True)
    argon_password = Column('argon_password', String(255))
    individuals = relationship('User_Individual', backref='users')

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class Individual(Base):
    __tablename__ = 'individuals'
    external_id = Column('external_id', String(255), primary_key=True)
    internal_id = Column('internal_id', String(255), primary_key=True)
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
    het_variants = relationship('HET_Variant', backref='individuals', lazy=True)
    hom_variants = relationship('HOM_Variant', backref='individuals', lazy=True)
    user = relationship('User_Individual', backref='individuals', lazy=True)


class User_Individual(Base):
    __tablename__ = 'users_individuals'
    user = Column('user', String(255), ForeignKey('users.user'))
    internal_id = Column('internal_id', String(255), ForeignKey('individuals.internal_id'), primary_key=True)

# meta.create_all()
