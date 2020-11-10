"""
Statistics view
"""
from typing import List

from flask import jsonify, session
from sqlalchemy import and_

from db.model import Variant, Sex, HeterozygousVariant, Individual, HomozygousVariant, UserIndividual
from views import application
from views.auth import requires_auth, USER
from views.individual import _count_all_individuals, _count_all_individuals_by_sex, get_authorized_individuals
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

        # counts HPOs
        individuals = get_authorized_individuals(db_session)
        count_observed_features, count_unobserved_features = count_hpos(individuals)

    return jsonify(
        exomes=total_patients,
        males=male_patients,
        females=female_patients,
        unknowns=unknown_patients,
        total_variants=total_variants,
        observed_features=count_observed_features,
        unobserved_features=count_unobserved_features,
        version_number=0,
    )


def count_hpos(individuals: List[Individual]):
    observed_features = set()
    unobserved_features = set()
    for i in individuals:
        observed_features.update(i.observed_features.split(","))
        unobserved_features.update(i.unobserved_features.split(","))
    return len(observed_features), len(unobserved_features)


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
