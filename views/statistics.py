"""
Statistics view
"""
# TODO: what exactly one wants with this?
from typing import List

from flask import jsonify, session
from sqlalchemy import and_
from sqlalchemy.orm import Session

from db.model import Variant, Sex, HeterozygousVariant, Individual, UserIndividual, HomozygousVariant
from views import application
from views.auth import USER, ADMIN_USER
from views.individual import _count_all_individuals, _count_all_individuals_by_sex
from views.postgres import session_scope


@application.route("/statistics")
def phenopolis_statistics():
    with session_scope() as db_session:

        # counts individuals
        total_patients = _count_all_individuals(db_session)
        male_patients = _count_all_individuals_by_sex(db_session, Sex.M)
        female_patients = _count_all_individuals_by_sex(db_session, Sex.F)
        unknown_patients = _count_all_individuals_by_sex(db_session, Sex.U)

        # counts variants
        # TODO: the use of two queries instead of a join between authorized individuals and homoyzgous_variants is
        # TODO: temporary. The database needs to be changed so homozygous_variants is linked to internal_id
        individuals = get_authorized_individuals(db_session)
        total_variants = query_variants(db_session, individuals)
        exac_variants = 0
        pass_variants = query_variants(db_session, individuals, Variant.FILTER == 'PASS')
        nonpass_variants = query_variants(db_session, individuals, Variant.FILTER != 'PASS')

        # counts HPOs
        # TODO

        # counts genes
        # TODO

    return jsonify(
        exomes=total_patients,
        males=male_patients,
        females=female_patients,
        unknowns=unknown_patients,
        total_variants=total_variants,
        exac_variants=exac_variants,
        pass_variants=pass_variants,
        nonpass_variants=nonpass_variants,
        # image=image.decode('utf8'))
        version_number=0,
    )


def get_authorized_individuals(db_session: Session) -> List[Individual]:
    user_id = session[USER]
    query = db_session.query(Individual, UserIndividual)
    if user_id != ADMIN_USER:
        query = query.filter(and_(Individual.internal_id == UserIndividual.internal_id, UserIndividual.user == user_id))
    return query.with_entities(Individual).all()


def query_variants(db_session, individuals, additional_filter=None):
    query_hom_variants = db_session.query(HomozygousVariant) \
        .join(Variant, and_(HomozygousVariant.CHROM == Variant.CHROM, HomozygousVariant.POS == Variant.POS,
                            HomozygousVariant.REF == Variant.REF, HomozygousVariant.ALT == Variant.ALT)) \
        .filter(HomozygousVariant.individual.in_([i.external_id for i in individuals]))
    query_het_variants = db_session.query(HeterozygousVariant, Variant) \
        .join(Variant, and_(HeterozygousVariant.CHROM == Variant.CHROM, HeterozygousVariant.POS == Variant.POS,
                            HeterozygousVariant.REF == Variant.REF, HeterozygousVariant.ALT == Variant.ALT)) \
        .filter(HeterozygousVariant.individual.in_([i.external_id for i in individuals]))
    if additional_filter is not None:
        query_hom_variants = query_hom_variants.filter(additional_filter)
        query_het_variants = query_het_variants.filter(additional_filter)
    return query_hom_variants.count() + query_het_variants.count()
