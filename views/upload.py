"""
Recevied Uploaded Files
"""
import os
from flask import request, jsonify
from sqlalchemy.orm import Session

from views import application
from views.auth import requires_admin
from views.exceptions import PhenopolisException
from views.helpers import _get_json_payload
from views.postgres import session_scope

from werkzeug.utils import secure_filename

UPLOAD_FOLDER = 'upload'

@application.route("/upload", methods=['GET', 'POST'])
@requires_admin
def recevie_uppy():
    print("- - - - - - - ")
    print("Hello World!")
    if request.method == 'POST':
        # check if the post request has the file part
        print(request.files)
        if len(request.files) == 0:
            return jsonify(error="No file n request"), 400
        for fi in request.files:            
            file = request.files[fi]
            filename = secure_filename(file.filename)
            file.save(os.path.join(UPLOAD_FOLDER, filename))
            return jsonify(success="File Saved"), 200

    
