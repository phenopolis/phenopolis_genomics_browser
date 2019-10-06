from views import *

# Load default config and override config from an environment variable
application.config.from_pyfile('../dev.cfg')

if __name__ == "__main__":
    application.run(host='0.0.0.0',port=7888,threaded=True)





