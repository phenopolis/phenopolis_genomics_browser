"""
DB schema
"""
# "postgres://admin:donotusethispassword@aws-us-east-1-portal.19.dblayer.com:15813/compose"

import enum
from sqlalchemy import Column, String, Integer, ForeignKey, JSON, Boolean, DateTime, Enum, func
from sqlalchemy import BigInteger, SmallInteger
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base, DeclarativeMeta
from sqlalchemy.sql.schema import MetaData


Public: DeclarativeMeta = declarative_base()
Phenopolis: DeclarativeMeta = declarative_base(metadata=MetaData(schema="phenopolis"))
Ensembl: DeclarativeMeta = declarative_base(metadata=MetaData(schema="ensembl"))
Hpo: DeclarativeMeta = declarative_base(metadata=MetaData(schema="hpo"))

# meta=MetaData(engine)


class AsDictable(object):
    def as_dict(self):
        dictionary = self.__dict__.copy()
        if "_sa_instance_state" in dictionary:
            del dictionary["_sa_instance_state"]  # removes SQLAlchemy internal field
        for k, v in dictionary.items():  # ensures that Enum fields are represented as strings
            if isinstance(v, enum.Enum):
                dictionary[k] = v.name
        return dictionary


class NewGene(Ensembl, AsDictable):
    __tablename__ = "gene"
    identifier = Column(Integer, nullable=False, primary_key=True)
    ensembl_gene_id = Column(String(255), nullable=False)
    start = Column(Integer, nullable=False)
    end = Column(Integer, nullable=False)
    chromosome = Column(String(255), nullable=False)
    strand = Column(SmallInteger, nullable=False)
    hgnc_id = Column(String(255))
    hgnc_symbol = Column(String(255))
    assembly = Column(String(255))


class IndividualGene(Phenopolis, AsDictable):
    __tablename__ = "individual_gene"
    individual_id = Column(Integer, ForeignKey("phenopolis.individual.id"), nullable=False, primary_key=True)
    gene_id = Column(BigInteger, nullable=False, primary_key=True)
    # SQLAlchemy seems really annoying when dealing with ForeignKey between schemas
    # We're not needing this below, though it's working fine in postgres
    # ForeignKey bellow will cause Individual to fail
    # gene_id = Column(BigInteger, ForeignKey("ensembl.gene.identifier"), nullable=False, primary_key=True)


class HpoTerm(Hpo, AsDictable):
    __tablename__ = "term"
    id = Column(Integer, primary_key=True, nullable=False)
    hpo_id = Column(String(255), primary_key=True, nullable=False)
    name = Column(String(255), nullable=False)


class IndividualFeature(Phenopolis, AsDictable):
    __tablename__ = "individual_feature"
    individual_id = Column(Integer, ForeignKey("phenopolis.individual.id"), primary_key=True, nullable=False)
    feature_id = Column(Integer, ForeignKey("hpo.term.id"), primary_key=True, nullable=False)
    type = Column(String(255), primary_key=True, nullable=False)


class User(Public, AsDictable):
    __tablename__ = "users"
    user = Column("user", String(255), primary_key=True, unique=True)
    argon_password = Column("argon_password", String(255))
    individuals = relationship("UserIndividual", backref="users")
    enabled = Column("enabled", Boolean(), default=False)
    registered_on = Column("registered_on", DateTime(timezone=True), default=func.now())
    confirmed = Column("confirmed", Boolean(), default=False)
    confirmed_on = Column("confirmed_on", DateTime(timezone=True))
    email = Column("email", String(255), unique=True)
    full_name = Column("full_name", String(255))


class UserConfig(Public, AsDictable):
    __tablename__ = "user_config"
    user_name = Column("user_name", String(255), primary_key=True)
    language = Column("language", String(255), primary_key=True)
    page = Column("page", String(255), primary_key=True)
    config = Column("config", JSON)


class Sex(enum.Enum):
    # male
    M = 1
    # female
    F = 2
    # unknown
    U = 3


class Individual(Phenopolis, AsDictable):
    __tablename__ = "individual"
    id = Column(Integer, nullable=False, primary_key=True)
    phenopolis_id = Column(String(255), nullable=False)
    external_id = Column(String(255))
    sex = Column(Enum(Sex), nullable=False)
    consanguinity = Column("consanguinity", String(255))
    # These relationships are not used, but if used they're braking delete_individual()
    # sqlalchemy.exc.NoReferencedTableError: Foreign key associated with column 'individual_gene.gene_id'
    # could not find table 'ensembl.gene' with which to generate a foreign key to target column 'identifier'
    # to_feat = relationship("IndividualFeature", backref="individual_feature", lazy=True, cascade="all, delete-orphan")
    # to_gene = relationship("IndividualGene", backref="individual_gene", lazy=True, cascade="all, delete-orphan")


class UserIndividual(Public, AsDictable):
    __tablename__ = "users_individuals"
    # remove pytest warning DELETE statement on table 'users_individuals' expected to delete 1 row(s); 4 were matched
    __mapper_args__ = {"confirm_deleted_rows": False}
    user = Column("user", String(255), ForeignKey("users.user"))
    internal_id = Column("internal_id", String(255), primary_key=True,)


class NewVariant(Phenopolis, AsDictable):
    __tablename__ = "variant"
    id = Column(BigInteger, primary_key=True)
    chrom = Column(String(255), nullable=False)
    pos = Column(Integer, nullable=False)
    ref = Column(String(255), nullable=False)
    alt = Column(String(255), nullable=False)


class TranscriptConsequence(Phenopolis, AsDictable):
    __tablename__ = "transcript_consequence"
    id = Column(BigInteger, primary_key=True)
    chrom = Column(String(255), nullable=False)
    pos = Column(Integer, nullable=False)
    ref = Column(String(255), nullable=False)
    alt = Column(String(255), nullable=False)
    hgvs_c = Column(String(255))
    hgvs_p = Column(String(255))
    consequence = Column(String(255))
    gene_id = Column(String(255))


class IndividualVariant(Phenopolis, AsDictable):
    __tablename__ = "individual_variant"
    individual_id = Column(Integer, nullable=False, primary_key=True)
    variant_id = Column(BigInteger, nullable=False, primary_key=True)
    chrom = Column(String(255), nullable=False)
    pos = Column(Integer, nullable=False)
    ref = Column(String(255), nullable=False)
    alt = Column(String(255), nullable=False)
    zygosity = Column(String(255), nullable=False)


class IndividualVariantClassification(Phenopolis, AsDictable):
    __tablename__ = "individual_variant_classification"
    id = Column(BigInteger, primary_key=True)
    individual_id = Column(Integer, ForeignKey("individual_variant.individual_id"), nullable=False)
    variant_id = Column(BigInteger, ForeignKey("individual_variant.variant_id"), nullable=False)
    user_id = Column(String(255), nullable=False)
    classified_on = Column(DateTime(timezone=True), default=func.now())
    classification = Column(String(255), nullable=False)
    pubmed_id = Column(String(255))
    notes = Column(String(255))
