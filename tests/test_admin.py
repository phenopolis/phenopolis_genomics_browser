'''
Tests that requires Admin access
'''
import os
from dotenv import load_dotenv
from views import application
from views.autocomplete import autocomplete
from views.individual import individual

load_dotenv(dotenv_path='./private.env')

ctx_ = application.test_request_context(path='/login', method='POST', data={'user': 'Admin', 'password': os.getenv('ADMIN_PASS')})


def test_autocomplete_patient():
    '''
    Needs user with permission to access patients
    '''
    ctx_.push()
    res = autocomplete('862', 'patient').json
    assert 'PH00005862' in res
    ctx_.pop()


def test_individual():
    ctx_.push()
    res = individual('PH00008258')
    assert 'Sorry","You are not authorised to see this individual' in res
    assert '"FILTER":"VQSRTrancheSNP99.50to99.60"' in res
    ctx_.pop()


def test_individual_without_gene():
    ctx_.push()
    res = individual('PH00000001')
    assert 'Sorry","You are not authorised to see this individual' in res
    assert '"FILTER":"VQSRTrancheSNP99.50to99.60"' in res
    ctx_.pop()
