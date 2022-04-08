"""
Received Uploaded Files
"""
import os

import boto3
from botocore.client import Config
from flask import jsonify, request

from views import application
from views.auth import requires_admin
from views.exceptions import PhenopolisException

UPLOAD_FOLDER = "upload"

S3_KEY = os.getenv("VCF_S3_KEY")
SECRET_ACCESS_KEY = os.environ.get("VCF_S3_SECRET")
DOWNLOAD_SIGNED_URL_TIME = 300

s3_client = boto3.client(
    "s3",
    aws_access_key_id=S3_KEY,
    aws_secret_access_key=SECRET_ACCESS_KEY,
    config=Config(signature_version="s3v4", region_name="eu-west-2"),
)


@application.route("/preSignS3URL", methods=["GET", "POST"])
@requires_admin
def presign_S3():
    data = request.get_json()
    filename = data.get("filename")
    prefix = data.get("prefix")

    try:
        response = s3_client.generate_presigned_post(
            Bucket="phenopolis-website-uploads", Key=prefix + "/" + filename, ExpiresIn=3600
        )
    except PhenopolisException as e:
        application.logger.error(str(e))
        return None

    return jsonify(response), 200


@application.route("/files/<individual_id>", methods=["GET", "POST"])
@requires_admin
def getUploadedFile(individual_id):
    try:
        response = s3_client.list_objects_v2(Bucket="phenopolis-website-uploads", Prefix=individual_id, MaxKeys=100)

        if response["KeyCount"] == 0:
            return jsonify(response), 404
    except PhenopolisException as e:
        application.logger.error(str(e))
        return None
    message = "get Uploaded File Success"
    return jsonify(message=message, response=response), 200


@application.route("/files", methods=["DELETE"])
@requires_admin
def delete_file():
    data = request.get_json()
    fileKey = data.get("fileKey")
    response = s3_client.delete_object(Bucket="phenopolis-website-uploads", Key=fileKey)

    return jsonify(message="Delete File Success", response=response), 200


@application.route("/file_download", methods=["POST"])
@requires_admin
def download_file():
    data = request.get_json()
    fileKey = data.get("fileKey")
    response = s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": "phenopolis-website-uploads", "Key": fileKey},
        ExpiresIn=DOWNLOAD_SIGNED_URL_TIME,
    )
    return jsonify(filename=fileKey, response=response), 200
