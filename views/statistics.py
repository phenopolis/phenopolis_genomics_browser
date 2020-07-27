"""
Statistics view
"""
from views import application, jsonify

# from views.postgres import get_db_session


@application.route("/statistics")
def phenopolis_statistics():
    # total_patients=get_db_session().query(Individual).count()
    total_patients = 8000
    # male_patients=get_db_session().query(Individual).filter(Individual.sex=='M').count()
    male_patients = 3000
    # female_patients=get_db_session().query(Individual).filter(Individual.sex=='F').count()
    female_patients = 4000
    # unknown_patients=get_db_session().query(Individual).filter(Individual.sex=='U').count()
    unknown_patients = 1000
    # total_variants=get_db_session().query(Variant).count()
    total_variants = 8000000
    exac_variants = 0
    # pass_variants=get_db_session().query(Variant).filter(Variant.FILTER=='PASS').count()
    pass_variants = 700000
    # nonpass_variants=get_db_session().query(Variant).filter(Variant.FILTER!='PASS').count()
    nonpass_variants = 100000
    #     pass_exac_variants = 0
    #     pass_nonexac_variants = 0
    return jsonify(
        exomes="{:,}".format(total_patients),
        males="{:,}".format(male_patients),
        females="{:,}".format(female_patients),
        unknowns="{:,}".format(unknown_patients),
        total_variants="{:,}".format(total_variants),
        exac_variants="{:,}".format(exac_variants),
        pass_variants="{:,}".format(pass_variants),
        nonpass_variants="{:,}".format(nonpass_variants),
        # image=image.decode('utf8'))
        version_number=0,
    )
