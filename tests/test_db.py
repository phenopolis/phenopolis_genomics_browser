"""
Test DB access
Full and Demo DB slightly differ for the entries tested bellow
Using some reliable common ground
Demo DB need to be updated?
"""

from views.postgres import postgres_cursor, get_db_session, close_db
from db import Gene


def test_db_sql_query(_demo):
    """res -> tuple"""
    cursor = postgres_cursor()
    cursor.execute(
        """select gene_id, gene_name, gene_name_upper, full_gene_name, other_names from genes g
        where gene_id = 'ENSG00000156171'"""
    )
    res = cursor.fetchone()
    assert "DNA-damage regulated autophagy modulator 2" in res


def test_sqlalchemy_query(_demo):
    """res -> db.Gene"""
    res = get_db_session().query(Gene).filter(Gene.gene_id == "ENSG00000119685").first()
    assert res.gene_name == "TTLL5"


# Never used so far
def test_close_db(_demo):
    close_db()
