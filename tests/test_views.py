'''
Test web views api

TODO:
    - How to test for session timeout??
    - Do we need to test login, how?
'''

import os
import pytest
from dotenv import load_dotenv
from views import application
from views.variant import variant
from views.gene import gene
from views.autocomplete import autocomplete, best_guess
from views.hpo import hpo
from views.individual import individual, update_patient_data
from views.exceptions import PhenopolisException
from views.auth import check_auth, is_logged_in, logout
from views.general import check_health
from views.statistics import phenopolis_statistics

load_dotenv(dotenv_path='./private.env')
load_dotenv(dotenv_path='./public.env')

ctx = application.test_request_context(path='/login', method='POST', data={'user': 'demo', 'password': 'demo123'})
ctx.push()

VCF_S3_SECRET = os.getenv('VCF_S3_SECRET')


def test_check_health():
    res = check_health()[0].json
    assert res.get('health') == 'ok'


def test_not_user():
    res = check_auth('not_user', 'blabla')
    assert not res


def test_requires_auth():
    '''Use wrong credential on purpose'''
    ctx_ = application.test_request_context(path='/login', method='POST', data={'user': 'demo', 'password': 'wrong'})
    ctx_.push()
    res = gene('TTLL5')[0].json
    assert res.get('error') == 'Unauthenticated'
    ctx_.pop()


def test_is_logged_in():
    res = is_logged_in()[0].json
    assert res.get('username') == 'demo'


def test_logout():
    res = logout()[0].json
    assert res.get('success') == 'logged out'


def test_variant_search():
    '''This tests S3 and VCF access via pysam'''
    res = variant('22-38212762-A-G')
    assert isinstance(res, str)
    assert '"end_href":"22-38212762-A-G",' in res


def test_variant_preview_not_in_db():
    '''
    This tests S3 and VCF access via pysam
    tests both for subset and entry not in DB, the real one is 14-76127655-C-T
    '''
    res = variant('14-76127655-C-G', subset='preview')
    assert res == '[{"preview":[["Clinvar",""]]}]'


def test_autocomplete_search():
    res = autocomplete('ttll').json
    assert 'gene:ARPC4-TTLL3' in res


def test_autocomplete_gene():
    res = autocomplete('ttll', 'gene').json
    assert sorted(res) == ['ARPC4-TTLL3', 'TTLL1', 'TTLL10', 'TTLL11', 'TTLL12', 'TTLL13', 'TTLL2', 'TTLL3', 'TTLL4', 'TTLL5', 'TTLL6', 'TTLL7', 'TTLL8', 'TTLL9']


def test_autocomplete_phenotype():
    res = autocomplete('gallbladder', 'phenotype').json
    assert 'Gallbladder dyskinesia' in res


def test_autocomplete_wrong_query_type():
    with pytest.raises(PhenopolisException) as excinfo:
        _res = autocomplete('ttll', 'acme').json
    assert 'Autocomplete request with unsupported' in str(excinfo)


def test_autocomplete_variant1():
    res = autocomplete('22-382127', query_type='variant').json
    assert '22-38212762-A-G' in res


def test_autocomplete_variant2():
    res = autocomplete('22-38212-A-G', query_type='variant').json
    assert '22-38212762-A-G' in res


def test_autocomplete_variant3():
    res = autocomplete('22:3821-A', query_type='variant').json
    assert '22-38212762-A-G' in res


def test_best_guess_gene():
    res = best_guess('gene:ttll5').json
    assert res.get('redirect') == '/gene/ttll5'


def test_best_guess_patient():
    res = best_guess('patient:PH00005862').json
    assert res.get('redirect') == '/individual/PH00005862'


def test_best_guess_phenotype():
    res = best_guess('phenotype:Atretic gallbladder').json
    assert res.get('redirect') == '/hpo/Atretic gallbladder'


def test_best_guess_variant():
    res = best_guess('variant:22-38212762-A-G').json
    assert res.get('redirect') == '/variant/22-38212762-A-G'


def test_best_guess_variant2():
    res = best_guess('22-38212762-A-G').json
    assert res.get('redirect') == '/variant/22-38212762-A-G'


def test_best_guess_not_found():
    res = best_guess('ttll')[0].json
    assert res.get('message') == 'Could not find search query'


def test_gene_id():
    res = gene('ENSG00000119685')
    assert 'tubulin tyrosine ligase-like family, member 5' in res


def test_gene_subset():
    res = gene('ENSG00000119685', subset='preview')
    assert '{"preview":' in res


def test_gene_name():
    res = gene('TTLL10')
    assert 'tubulin tyrosine ligase-like family, member 10' in res


def test_gene_other_names():
    other_names = ["KIAA0998", "STAMP"]
    responses = [gene(other_name) for other_name in other_names]
    for res in responses:
        assert 'tubulin tyrosine ligase-like family, member 5' in res


def test_gene_not_found():
    res = gene('HELLO')[0].json
    assert 'Gene not found' in res


def test_variants_appear():
    res = gene('ENSG00000119685')
    assert 'variant_id' in res


def test_hpo_id():
    res = hpo('HP:0000478')
    assert 'Retinal dystrophy;Abnormal fundus morphology' in res


def test_hpo_name():
    res = hpo('Neurogenic bladder')
    assert 'HP:0000011' in res


def test_hpo_preview():
    res = hpo('HP:0000478', subset='preview')
    assert '[{"preview":[["Number of Individuals"' in res


def test_hpo_subset():
    res = hpo('HP:0000478', subset='metadata')
    assert '"name":"Abnormality of the eye"' in res


def test_individual():
    ''' "demo" user has no right to acess PH00000001'''
    res = individual('PH00000001')
    assert 'You are not permitted to see this patient' in res
    assert 'Chromosome on which variant falls.' in res


def test_individual_preview():
    res = individual('PH00008258', subset='preview')
    assert 'Autosomal recessive inheritance;Visual impairment;Macular dystrophy' in res


def test_individual_subset():
    res = individual('PH00008258', subset='metadata')
    assert 'WebsterURMD_Sample_IC16489' in res


def test_update_patient_data_demo():
    res = update_patient_data('PH00000001')[0].json
    assert res.get('error') == 'Demo user not authorised'


def test_statistics():
    res = phenopolis_statistics().json
    assert 'total_variants' in res
