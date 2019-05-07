from views import *

# Load default config and override config from an environment variable
app.config.from_pyfile('../local.cfg')

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=7887,threaded=True)





