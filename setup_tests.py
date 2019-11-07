from application import application as app
import unittest
import os

def db_conn_parameters():
    os.environ['DB_HOST'] = 'localhost'
    os.environ['DB_DATABASE'] = 'phenopolis_db_demo'
    os.environ['DB_USER'] = 'demo'
    os.environ['DB_PASSWORD'] = 'demo123'
    os.environ['DB_PORT'] = '5433'

class BaseTestCase(unittest.TestCase):
    def setUp(self):
            app.config['DEBUG'] = False
            app.config['TESTING'] = True
            app.config['WTF_CSRF_ENABLED'] = False
            self.client = app.test_client()
            
    def tearDown(self):
        pass

    def login(self, name, password):
        return self.client.post('/login',
        data=dict(name=name, password=password),
        follow_redirects=True)

class LoggedInTestCase(unittest.TestCase):
    def setUp(self):
        app.config['DEBUG'] = False
        app.config['TESTING'] = True
        app.config['WTF_CSRF_ENABLED'] = False
        
        self.client = app.test_client()
        with self.client.session_transaction() as session:
                session['user'] = 'demo'
                session['password'] = 'demo123'
        
        db_conn_parameters()

    def tearDown(self):
        pass

print('nice')