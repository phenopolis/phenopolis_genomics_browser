"""
Recevied Uploaded Files
"""
import os
# import boto3
# import logging
# import boto3
# from botocore.exceptions import ClientError
from flask import request, jsonify
from sqlalchemy.orm import Session

from views import application
from views.auth import requires_admin
from views.exceptions import PhenopolisException
from views.helpers import _get_json_payload
from views.postgres import session_scope

from werkzeug.utils import secure_filename



UPLOAD_FOLDER = 'upload'

@application.route("/preSignS3URL", methods=['GET', 'POST'])
@requires_admin
def presign_S3():
    print("- - - - - - -")
    print("PreSigned S3 URL")
    print(request.files)
    return jsonify(success="PreSignS3URL Success!"), 200

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


# def create_presigned_url(bucket_name, object_name, expiration=3600):
    # """Generate a presigned URL to share an S3 object

    # :param bucket_name: string
    # :param object_name: string
    # :param expiration: Time in seconds for the presigned URL to remain valid
    # :return: Presigned URL as string. If error, returns None.
    # """

    # # Generate a presigned URL for the S3 object
    # s3_client = boto3.client('s3')
    # try:
    #     response = s3_client.generate_presigned_url('get_object',
    #                                                 Params={'Bucket': bucket_name,
    #                                                         'Key': object_name},
    #                                                 ExpiresIn=expiration)
    # except ClientError as e:
    #     logging.error(e)
    #     return None

    # # The response contains the presigned URL
    # return response