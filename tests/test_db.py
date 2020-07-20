'''
Test DB access
'''
# @pylint: disable=missing-function-docstring

from views import application
from views.postgres import postgres_cursor, get_db_session, close_db
from db import Gene

ctx = application.app_context()
ctx.push()


def test_db_sql_query():
    cursor = postgres_cursor()

    cursor.execute("select gene_id, gene_name, gene_name_upper, full_gene_name, other_names from genes g where gene_id = 'ENSG00000070761'")
    res = cursor.fetchone()
    assert res == ('ENSG00000070761', 'C16orf80', 'C16ORF80', 'chromosome 16 open reading frame 80', '["EVORF", "FSAP23", "GTL3", "CFAP20"]')


def test_sqlalchemy_query():
    res = get_db_session().query(Gene).filter(Gene.gene_id == 'ENSG00000070761').first()
    assert res.gene_name == 'C16orf80'


# Never used so far
def test_close_db():
    close_db()
