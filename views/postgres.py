from views import *

def get_db():
    '''
    Get DB
    '''
    if 'db' not in g:
        g.db = psycopg2.connect(host = application.config['DB_HOST'],
                                database = application.config['DB_DATABASE'],
                                user = application.config['DB_USER'],
                                password = application.config['DB_PASSWORD'])
    return g.db

def get_db_session():
    """
    Opens a new database connection if there is none yet for the
    current application context.
    """
    if not hasattr(g, 'dbsession'):
        engine = create_engine(application.config['SQLALCHEMY_DATABASE_URI'], echo=True)
        engine.connect()
        DbSession = sessionmaker(bind=engine)
        DbSession.configure(bind=engine)
        g.dbsession = DbSession()
    return g.dbsession


def close_db():
    '''
    Close DB
    '''
    adb = g.pop('db', None)
    if adb is not None:
        adb.close()


def postgres_cursor():
    '''
    Postgres cursor
    '''
    cursor = get_db().cursor()
    return cursor
