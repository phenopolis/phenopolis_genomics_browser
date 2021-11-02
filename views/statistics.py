"""
Statistics view
"""
from typing import List
from flask import jsonify, session
from db.model import Sex, Individual
from views import VERSION, application, HG_ASSEMBLY
from views.auth import requires_auth, USER
from views.individual import _count_all_individuals, _count_all_individuals_by_sex, _get_authorized_individuals
from views.postgres import session_scope, get_db
from views.variant import sqlq_all_variants

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
        total_variants = count_variants()

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
                where g.assembly = %s and g.chromosome ~ '^X|^Y|^[0-9]{1,2}'
                and ig.individual_id = any(%s)
                """,
                [HG_ASSEMBLY, [x.id for x in individuals]],
            )
    return cur.rowcount


def count_variants():
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(sqlq_all_variants, [session[USER]])
    return cur.rowcount
