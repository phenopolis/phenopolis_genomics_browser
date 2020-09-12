"""
Flask app
"""
from views import application, APP_ENV

if __name__ == "__main__":
    application.debug = False
    if APP_ENV == "debug":
        application.debug = True
    elif APP_ENV == "coverage":
        from pytest_cov.embed import cleanup_on_sigterm

        cleanup_on_sigterm()

    application.run()
