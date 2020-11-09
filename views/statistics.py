"""
Statistics view
"""
from typing import List

from flask import jsonify, session
from sqlalchemy import and_, Float, cast
from sqlalchemy.orm import Session

from db.model import Variant, Sex, HeterozygousVariant, Individual, UserIndividual, HomozygousVariant
from views import application
from views.auth import USER, ADMIN_USER, requires_auth
from views.individual import _count_all_individuals, _count_all_individuals_by_sex
from views.postgres import session_scope

COMMON_VARIANTS_THRESHOLD = 0.05
RARE_VARIANTS_THRESHOLD = 0.01


@application.route("/statistics")
@requires_auth
def phenopolis_statistics():
    with session_scope() as db_session:

        # counts individuals
        total_patients = _count_all_individuals(db_session)
        male_patients = _count_all_individuals_by_sex(db_session, Sex.M)
        female_patients = _count_all_individuals_by_sex(db_session, Sex.F)
        unknown_patients = _count_all_individuals_by_sex(db_session, Sex.U)

        # counts variants
        total_variants = count_variants(db_session)
        # TODO: this cast to float on the AF is probably not efficient this needs changing in the DB
        gnomad_rare_variants = count_variants(
            db_session, cast(Variant.af_gnomad_genomes, Float) < RARE_VARIANTS_THRESHOLD
        )
        gnomad_low_frequency_variants = count_variants(
            db_session,
            and_(
                cast(Variant.af_gnomad_genomes, Float) >= RARE_VARIANTS_THRESHOLD,
                cast(Variant.af_gnomad_genomes, Float) <= COMMON_VARIANTS_THRESHOLD,
            ),
        )
        gnomad_common_variants = count_variants(
            db_session, cast(Variant.af_gnomad_genomes, Float) > COMMON_VARIANTS_THRESHOLD
        )

        # counts HPOs
        individuals = get_authorized_individuals(db_session)
        count_observed_features, count_unobserved_features = count_hpos(individuals)

        # counts genes
        genes = count_genes(db_session)

    return jsonify(
        exomes=total_patients,
        males=male_patients,
        females=female_patients,
        unknowns=unknown_patients,
        total_variants=total_variants,
        gnomad_rare_variants=gnomad_rare_variants,
        gnomad_low_frequency_variants=gnomad_low_frequency_variants,
        gnomad_common_variants=gnomad_common_variants,
        genes=genes,
        observed_features=count_observed_features,
        unobserved_features=count_unobserved_features,
        version_number=0,
    )


def get_authorized_individuals(db_session: Session) -> List[Individual]:
    user_id = session[USER]
    query = db_session.query(Individual, UserIndividual)
    if user_id != ADMIN_USER:
        query = query.filter(and_(Individual.internal_id == UserIndividual.internal_id, UserIndividual.user == user_id))
    return query.with_entities(Individual).all()


def count_hpos(individuals: List[Individual]):
    observed_features = set()
    unobserved_features = set()
    for i in individuals:
        observed_features.update(i.observed_features.split(","))
        unobserved_features.update(i.unobserved_features.split(","))
    return len(observed_features), len(unobserved_features)


def count_genes(db_session):
    hom_genes = (
        query_variants_by_zygosity(db_session, HomozygousVariant)
        .with_entities(Variant.gene_symbol)
        .group_by(Variant.gene_symbol)
    )
    het_genes = (
        query_variants_by_zygosity(db_session, HeterozygousVariant)
        .with_entities(Variant.gene_symbol)
        .group_by(Variant.gene_symbol)
    )
    return len(set([g[0] for g in hom_genes.all()] + [g[0] for g in het_genes.all()]))


def count_variants(db_session, additional_filter=None):
    query_hom_variants = query_variants_by_zygosity(db_session, HomozygousVariant, additional_filter)
    query_het_variants = query_variants_by_zygosity(db_session, HeterozygousVariant, additional_filter)
    return query_hom_variants.count() + query_het_variants.count()


def query_variants_by_zygosity(db_session, klass, additional_filter=None):
    """
    this method is used to query both HomozygousVariants and HeterozygousVariants which have an equivalent structure
    """
    query_hom_variants = (
        db_session.query(klass, UserIndividual, Variant)
        .join(UserIndividual, UserIndividual.internal_id == klass.individual)
        .filter(UserIndividual.user == session[USER])
        .join(
            Variant,
            and_(
                klass.CHROM == Variant.CHROM,
                klass.POS == Variant.POS,
                klass.REF == Variant.REF,
                klass.ALT == Variant.ALT,
            ),
        )
    )
    if additional_filter is not None:
        query_hom_variants = query_hom_variants.filter(additional_filter)
    return query_hom_variants
