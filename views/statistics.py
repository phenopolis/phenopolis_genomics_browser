"""
Statistics view
"""
from typing import List

from flask import jsonify, session
from sqlalchemy import and_

from db.model import Variant, Sex, HeterozygousVariant, Individual, HomozygousVariant, UserIndividual
from views import VERSION, application
from views.auth import requires_auth, USER
from views.individual import _count_all_individuals, _count_all_individuals_by_sex, _get_authorized_individuals
from views.postgres import session_scope, get_db

COMMON_VARIANTS_THRESHOLD = 0.05
RARE_VARIANTS_THRESHOLD = 0.01


@application.route("/statistics")
@requires_auth
def phenopolis_statistics():
    with session_scope() as db_session:

        # counts individuals
        total_patients = _count_all_individuals()
        male_patients = _count_all_individuals_by_sex(Sex.M)
        female_patients = _count_all_individuals_by_sex(Sex.F)
        unknown_patients = _count_all_individuals_by_sex(Sex.U)

        # counts variants
        total_variants = count_variants(db_session)

        # counts HPOs
        individuals = _get_authorized_individuals(db_session)
        count_observed_features, count_unobserved_features = count_hpos(individuals)

        # counts genes
        total_genes = count_genes(individuals)

    return jsonify(
        exomes=total_patients,
        males=male_patients,
        females=female_patients,
        unknowns=unknown_patients,
        total_variants=total_variants,
        observed_features=count_observed_features,
        unobserved_features=count_unobserved_features,
        total_genes=total_genes,
        version_number=VERSION,
    )


def count_hpos(individuals: List[Individual]):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """select ife.type, count(distinct ife.feature_id) from phenopolis.individual_feature ife
                where ife.individual_id = any(%s) and ife.type in ('observed','unobserved') group by ife.type""",
                [[x.id for x in individuals]],
            )
            res = dict(cur.fetchall())
    return res.get("observed", 0), res.get("unobserved", 0)


def count_genes(individuals: List[Individual]):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                select distinct gene_id from phenopolis.individual_gene ig
                join ensembl.gene g on g.identifier = ig.gene_id 
                where g.assembly = 'GRCh37' and g.chromosome ~ '^X|^Y|^[0-9]{1,2}'
                and ig.individual_id = any(%s)
                """,
                [[x.id for x in individuals]],
            )
    return cur.rowcount


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
