"""
Test DB access
Full and Demo DB slightly differ for the entries tested bellow
Using some reliable common ground
Demo DB need to be updated?
"""

from db.model import NewGene
from views import HG_ASSEMBLY
from views.postgres import close_db, postgres_cursor, session_scope


def test_db_sql_query_old_schema(_demo):
    """res -> tuple"""
    cursor = postgres_cursor()
    cursor.execute(
        """select gene_id, gene_name, gene_name_upper, full_gene_name, other_names from genes g
        where gene_id = 'ENSG00000156171'"""
    )
    res = cursor.fetchone()
    assert "DNA-damage regulated autophagy modulator 2" in res


def test_db_sql_query(_demo):
    """res -> tuple"""
    cursor = postgres_cursor()
    cursor.execute(
        "select * from ensembl.gene where ensembl_gene_id = 'ENSG00000156171' and assembly = %s", [HG_ASSEMBLY]
    )
    res = cursor.fetchone()
    assert "DNA-damage regulated autophagy modulator 2" in res


def test_sqlalchemy_query(_demo):
    """res -> db.NewGene"""
    with session_scope() as db_session:
        res = db_session.query(NewGene).filter(NewGene.ensembl_gene_id == "ENSG00000119685").first()
        assert res.hgnc_symbol == "TTLL5"


# Never used so far
def test_close_db(_demo):
    close_db()
