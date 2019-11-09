from views import *

if __name__ == "__main__":
    application.debug = True
    #application.run()
    application.run(host='0.0.0.0',port=7888,threaded=True)
