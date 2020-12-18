"""
Recevied Uploaded Files
"""
import os
import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
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

S3_KEY = os.getenv('VCF_S3_KEY')
SECRET_ACCESS_KEY = os.environ.get('VCF_S3_SECRET')


@application.route("/preSignS3URL", methods=['GET', 'POST'])
@requires_admin
def presign_S3():
    print("\n\n- - - - - - -")
    print("PreSigned S3 URL Files")

    # data = request.get_json()
    # filename = data.get("filename")
    # contentType = data.get("contentType")
    # print(filename)
    # print(contentType)

    # Generate a presigned URL for the S3 object
    s3_client = boto3.client(
        's3',
        aws_access_key_id=S3_KEY,
        aws_secret_access_key=SECRET_ACCESS_KEY,
        config=Config(signature_version='s3v4', region_name='eu-west-2')
        # aws_session_token=SESSION_TOKEN
    )
    # response = s3.list_buckets()
    # Output the bucket names
    # print('Existing buckets:')
    # for bucket in response['Buckets']:
    #     print(f'  {bucket["Name"]}')
    try:
        # response = s3_client.generate_presigned_post('phenopolis-website-uploads',
        #                                              'TestFile.idat',
        #                                              Fields=None,
        #                                              Conditions=None,
        #                                              ExpiresIn=3600)
        # response = s3_client.generate_presigned_url('put_object', {'Bucket': 'phenopolis-website-uploads',
        #                                                            'Key': 'TestFigure.jpg',
        #                                                            'ContentType': 'image/jpeg'}, 300)
        response = s3_client.generate_presigned_post(
            Bucket='phenopolis-website-uploads',
            Key='TestFigure.jpg',
            ExpiresIn=3600,
        )
        print('\n = = = = = ')
        print(response)
    except ClientError as e:
        logging.error(e)
        return None

    # The response contains the presigned URL
    return jsonify(response), 200


# @ application.route("/upload", methods=['GET', 'POST'])
# @ requires_admin
# def recevie_uppy():
#     print("- - - - - - - ")
#     print("Hello World!")
#     if request.method == 'POST':
#         # check if the post request has the file part
#         print(request.files)
#         if len(request.files) == 0:
#             return jsonify(error="No file n request"), 400
#         for fi in request.files:
#             file = request.files[fi]
#             filename = secure_filename(file.filename)
#             file.save(os.path.join(UPLOAD_FOLDER, filename))
#             return jsonify(success="File Saved"), 200


# def create_presigned_url(bucket_name, object_name, expiration=3600):
#     """Generate a presigned URL to share an S3 object

#     :param bucket_name: string
#     :param object_name: string
#     :param expiration: Time in seconds for the presigned URL to remain valid
#     :return: Presigned URL as string. If error, returns None.
#     """

#     # Generate a presigned URL for the S3 object
#     s3_client = boto3.client('s3')
#     try:
#         response = s3_client.generate_presigned_url('get_object',
#                                                     Params={'Bucket': bucket_name,
#                                                             'Key': object_name},
#                                                     ExpiresIn=expiration)
#     except ClientError as e:
#         logging.error(e)
#         return None

#     # The response contains the presigned URL
#     return response
