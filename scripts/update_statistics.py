import logging


from views import application
from views.statistics import _count_all_individuals, _count_all_individuals_by_sex
from views.statistics import count_variants, get_authorized_individuals
from views.statistics import count_hpos, Sex, session_scope


logger = logging.getLogger()
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s')


def main():
    with application.app_context():
        # TODO: either get users from command line or query for all active users
        for user in ["demo"]:
            logging.info("updating statst for user %s", user)
            stats = get_statistics(user)

            # TODO: create an user_stats table and write this blob therew
            # write_statstics(user, stats)


def get_statistics(user):
    with session_scope() as db_session:

        # counts individuals
        total_patients = _count_all_individuals(db_session, user=user)
        male_patients = _count_all_individuals_by_sex(db_session, Sex.M, user=user)
        female_patients = _count_all_individuals_by_sex(db_session, Sex.F, user=user)
        unknown_patients = _count_all_individuals_by_sex(db_session, Sex.U, user=user)

        # TODO: pass down users as parameters to all code paths

        # # counts variants
        # total_variants = count_variants(db_session)

        # # counts HPOs
        # individuals = get_authorized_individuals(db_session)
        # count_observed_features, count_unobserved_features = count_hpos(individuals)

    return dict(
        exomes=total_patients,
        males=male_patients,
        females=female_patients,
        unknowns=unknown_patients,
        # total_variants=total_variants,
        # observed_features=count_observed_features,
        # unobserved_features=count_unobserved_features,
        version_number=0,
    )


if __name__ == '__main__':
    main()
