from views import *

# Load default config and override config from an environment variable
# application.config.from_pyfile('../dev.cfg')

if __name__ == "__main__":
    application.debug = True
    application.run()
