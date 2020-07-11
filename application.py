from views import application
import logging
from logging.config import dictConfig
from flask.logging import default_handler

'''
Flask app
'''


def _configure_logs():
    dictConfig({
        'version': 1,
        'formatters': {
            'default': {
                'format': '%(asctime)s-%(levelname)s-%(name)s::%(module)s|%(lineno)s:: %(message)s'
            }
        },
        'handlers': {
            'wsgi': {
                'class': 'logging.StreamHandler',
                'stream': 'ext://flask.logging.wsgi_errors_stream',
                'formatter': 'default'
            },
            'info_rotating_file_handler': {
                'level': 'INFO',
                'formatter': 'default',
                'class': 'logging.handlers.RotatingFileHandler',
                'filename': 'phenopolis.log',
                'mode': 'a',
                'maxBytes': 1048576,
                'backupCount': 10
            }
        },
        'root': {
            'level': 'INFO',
            'handlers': ['wsgi']
        }
    })
    # add SQLalchemy logs
    logging.getLogger('sqlalchemy').addHandler(default_handler)


if __name__ == "__main__":
    _configure_logs()   # NOTE: this needs to happen before starting the application
    application.debug = True
    application.run()
