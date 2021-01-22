"""
DB schema
"""
# "postgres://admin:donotusethispassword@aws-us-east-1-portal.19.dblayer.com:15813/compose"

import enum
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    ForeignKey,
    JSON,
    Boolean,
    DateTime,
    Enum,
    func,
    BigInteger,
    SmallInteger,
)
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql.schema import MetaData

Public = declarative_base()
Phenopolis = declarative_base(metadata=MetaData(schema="phenopolis"))
Ensembl = declarative_base(metadata=MetaData(schema="ensembl"))
Hpo = declarative_base(metadata=MetaData(schema="hpo"))

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


class Gene(Public, AsDictable):
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


class NewGene(Ensembl, AsDictable):
    __tablename__ = "gene"
    # schema = "ensembl"
    identifier = Column(Integer, nullable=False, primary_key=True)
    ensembl_gene_id = Column(String(255), nullable=False)
    # version = Column(SmallInteger)
    start = Column(Integer, nullable=False)
    end = Column(Integer, nullable=False)
    # description = Column(String(255))
    chromosome = Column(String(255), nullable=False)
    strand = Column(SmallInteger, nullable=False)
    # band = Column(String(255))
    # biotype = Column(String(255))
    hgnc_id = Column(String(255))
    hgnc_symbol = Column(String(255))
    # percentage_gene_gc_content = Column(Float)
    assembly = Column(String(255))


class IndividualGene(Phenopolis, AsDictable):
    __tablename__ = "individual_gene"
    individual_id = Column(Integer, nullable=False, primary_key=True)
    gene_id = Column(BigInteger, ForeignKey("gene.identifier"), nullable=False, primary_key=True)
    # status = Column(String(255))
    # clinvar_id = Column(String(255))
    # pubmed_id = Column(String(255))
    # comment = Column(String(255))
    # user_id = Column(String(255))


class Variant(Public, AsDictable):
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


class HeterozygousVariant(Public, AsDictable):
    __tablename__ = "het_variants"
    CHROM = Column("CHROM", String(2), primary_key=True)
    POS = Column("POS", String(255), primary_key=True)
    REF = Column("REF", String(255), primary_key=True)
    ALT = Column("ALT", String(255), primary_key=True)
    individual = Column("individual", String(255), ForeignKey("individuals.internal_id"), primary_key=True)


class HomozygousVariant(Public, AsDictable):
    __tablename__ = "hom_variants"
    CHROM = Column("CHROM", String(2), primary_key=True)
    POS = Column("POS", String(255), primary_key=True)
    REF = Column("REF", String(255), primary_key=True)
    ALT = Column("ALT", String(255), primary_key=True)
    individual = Column("individual", String(255), ForeignKey("individuals.internal_id"), primary_key=True)


class HPO(Public, AsDictable):
    __tablename__ = "hpo"
    hpo_id = Column("hpo_id", String(255), primary_key=True)
    hpo_name = Column("hpo_name", String(255))
    hpo_ancestor_ids = Column("hpo_ancestor_ids", String(255))
    hpo_ancestor_names = Column("hpo_ancestor_names", String(255))


class HpoTerm(Hpo, AsDictable):
    __tablename__ = "term"
    id = Column(Integer, primary_key=True, nullable=False)
    hpo_id = Column(String(255), primary_key=True, nullable=False)
    name = Column(String(255), nullable=False)
    # description
    # comment


class IndividualFeature(Phenopolis, AsDictable):
    __tablename__ = "individual_feature"
    individual_id = Column(Integer, ForeignKey("individual.id"), primary_key=True, nullable=False)
    feature_id = Column(Integer, ForeignKey("term.id"), primary_key=True, nullable=False)
    type = Column(String(255), primary_key=True, nullable=False)


class User(Public, AsDictable):
    __tablename__ = "users"
    user = Column("user", primary_key=True, unique=True)
    argon_password = Column("argon_password", String(255))
    individuals = relationship("UserIndividual", backref="users")
    enabled = Column("enabled", Boolean(), default=False)
    registered_on = Column("registered_on", DateTime(timezone=True), default=func.now())
    confirmed = Column("confirmed", Boolean(), default=False)
    confirmed_on = Column("confirmed_on", DateTime(timezone=True))
    email = Column("email", unique=True)
    full_name = Column("full_name")


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


class Individuals(Public, AsDictable):
    __tablename__ = "individuals"
    external_id = Column("external_id", String(255), primary_key=True)
    internal_id = Column("internal_id", String(255), primary_key=True)
    sex = Column("sex", Enum(Sex))
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


class Individual(Phenopolis, AsDictable):
    __tablename__ = "individual"
    id = Column(Integer, nullable=False, primary_key=True)
    phenopolis_id = Column(String(255), nullable=False)
    external_id = Column(String(255))
    sex = Column(Enum(Sex), nullable=False)
    consanguinity = Column("consanguinity", String(255))


class UserIndividual(Public, AsDictable):
    __tablename__ = "users_individuals"
    # remove pytest warning DELETE statement on table 'users_individuals' expected to delete 1 row(s); 4 were matched
    __mapper_args__ = {"confirm_deleted_rows": False}
    user = Column("user", String(255), ForeignKey("users.user"))
    internal_id = Column("internal_id", String(255), ForeignKey("individuals.internal_id"), primary_key=True,)


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


# meta.create_all()
