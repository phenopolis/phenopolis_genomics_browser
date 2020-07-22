"""
Flask app
"""

from views import application

if __name__ == "__main__":
    application.debug = True
    application.run()
