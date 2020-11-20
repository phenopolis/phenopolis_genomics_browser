"""
Flask app
"""
from views import application, APP_ENV

if __name__ == "__main__":
    application.debug = False
    if APP_ENV == "debug":
        application.debug = True
    application.run()
