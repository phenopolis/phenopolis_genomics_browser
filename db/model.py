"""
DB schema
"""
# "postgres://admin:donotusethispassword@aws-us-east-1-portal.19.dblayer.com:15813/compose"
from sqlalchemy import Column, String, Integer, Float, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base


Base = declarative_base()

# meta=MetaData(engine)


class AsDictable(object):
    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class Gene(Base, AsDictable):
    __tablename__ = "genes"
    gene_id = Column("gene_id", String(255), primary_key=True)
    stop = Column("stop", String(255))
    chrom = Column("chrom", String(2))
    strand = Column("strand", String(1))
    full_gene_name = Column("full_gene_name", String(255))
    gene_name_upper = Column("gene_name_upper", String(255))
    other_names = Column("other_names", String(255))
    canonical_transcript = Column("canonical_transcript", String(255))
    start = Column("start", Integer)
    xstop = Column("xstop", Integer)
    xstart = Column("xstart", Integer)
    gene_name = Column("gene_name", String(255))
    variants = relationship("Variant", backref="genes", lazy=True)


class Variant(Base, AsDictable):
    __tablename__ = "variants"
    variant_id = Column(Integer)
    CHROM = Column("CHROM", String(2), primary_key=True)
    POS = Column("POS", String(255), primary_key=True)
    ID = Column("ID", String(255))
    REF = Column("REF", String(255), primary_key=True)
    ALT = Column("ALT", String(255), primary_key=True)
    AF = Column("AF", Float)
    AC = Column("AC", Integer)
    AN = Column("AN", Integer)
    HET_COUNT = Column("HET_COUNT", Integer)
    HOM_COUNT = Column("HOM_COUNT", Integer)
    DP = Column("DP", Integer)
    FS = Column("FS", Integer)
    MLEAC = Column("MLEAC", Integer)
    MLEAF = Column("MLEAF", Integer)
    MQ = Column("MQ", Integer)
    FILTER = Column("FILTER", String(255))
    HET = Column("HET", String(255))
    HOM = Column("HOM", String(255))
    most_severe_consequence = Column("most_severe_consequence", String(255))
    af_kaviar = Column("af_kaviar", String)
    af_gnomad_genomes = Column("af_gnomad_genomes", String)
    af_jirdc = Column("af_jirdc", String)
    af_tommo = Column("af_tommo", String)
    af_krgdb = Column("af_krgdb", String)
    af_converge = Column("af_converge", String)
    af_hgvd = Column("af_hgvd", String)
    gene_id = Column("gene_id", String(255), ForeignKey("genes.gene_id"))
    gene_symbol = Column("gene_symbol", String(255))
    hgvsc = Column("hgvsc", String(255))
    hgvsp = Column("hgvsp", String(255))
    dann = Column("dann", String)
    cadd_phred = Column("cadd_phred", String)


class HeterozygousVariant(Base, AsDictable):
    __tablename__ = "het_variants"
    CHROM = Column("CHROM", String(2), primary_key=True)
    POS = Column("POS", String(255), primary_key=True)
    REF = Column("REF", String(255), primary_key=True)
    ALT = Column("ALT", String(255), primary_key=True)
    individual = Column("individual", String(255), ForeignKey("individuals.internal_id"), primary_key=True)


class HomozygousVariant(Base, AsDictable):
    __tablename__ = "hom_variants"
    CHROM = Column("CHROM", String(2), primary_key=True)
    POS = Column("POS", String(255), primary_key=True)
    REF = Column("REF", String(255), primary_key=True)
    ALT = Column("ALT", String(255), primary_key=True)
    individual = Column("individual", String(255), ForeignKey("individuals.external_id"), primary_key=True)


class HPO(Base, AsDictable):
    __tablename__ = "hpo"
    hpo_id = Column("hpo_id", String(255), primary_key=True)
    hpo_name = Column("hpo_name", String(255))
    hpo_ancestor_ids = Column("hpo_ancestor_ids", String(255))
    hpo_ancestor_names = Column("hpo_ancestor_names", String(255))


class User(Base, AsDictable):
    __tablename__ = "users"
    user = Column("user", primary_key=True)
    argon_password = Column("argon_password", String(255))
    individuals = relationship("UserIndividual", backref="users")
    enabled = Column("enabled", Boolean())


class UserConfig(Base, AsDictable):
    __tablename__ = "user_config"
    user_name = Column("user_name", String(255), primary_key=True)
    language = Column("language", String(255), primary_key=True)
    page = Column("page", String(255), primary_key=True)
    config = Column("config", JSON)


class Individual(Base, AsDictable):
    __tablename__ = "individuals"
    external_id = Column("external_id", String(255), primary_key=True)
    internal_id = Column("internal_id", String(255), primary_key=True)
    sex = Column("sex", String(1))
    observed_features = Column("observed_features", String(255))
    unobserved_features = Column("unobserved_features", String(255))
    genes = Column("genes", String(255))
    ethnicity = Column("ethnicity", String(255))
    consanguinity = Column("consanguinity", String(255))
    pi = Column("pi", String(255))
    observed_features_names = Column("observed_features_names", String(255))
    simplified_observed_features = Column("simplified_observed_features", String(255))
    simplified_observed_features_names = Column("simplified_observed_features_names", String(255))
    ancestor_observed_features = Column("ancestor_observed_features", String(255))
    ancestor_observed_features_names = Column("ancestor_observed_features_names", String(255))
    het_variants = relationship("HeterozygousVariant", backref="individuals", lazy=True)
    hom_variants = relationship("HomozygousVariant", backref="individuals", lazy=True)
    user = relationship("UserIndividual", backref="individuals", lazy=True)


class UserIndividual(Base, AsDictable):
    __tablename__ = "users_individuals"
    user = Column("user", String(255), ForeignKey("users.user"))
    internal_id = Column("internal_id", String(255), ForeignKey("individuals.internal_id"), primary_key=True,)


# meta.create_all()
