"""
Received Uploaded Files
"""
import os

import boto3
from botocore.client import Config
from flask import jsonify, request

from views import application
from views.auth import requires_user
from views.exceptions import PhenopolisException

REMOTE_FILES = int(os.getenv("REMOTE_FILES", 0))

BUCKET = os.getenv("BUCKET", "phenopolis-website-uploads")
REGION = os.getenv("REGION", "eu-west-2")

M_USER = os.getenv("MINIO_ROOT_USER")
M_PASS = os.getenv("MINIO_ROOT_PASSWORD")

if REMOTE_FILES:
    s3_client1 = boto3.client("s3", config=Config(signature_version="s3v4", region_name=REGION))
    s3_client2 = s3_client1
else:
    s3_client1 = boto3.client(
        "s3",
        endpoint_url="http://host.docker.internal:9000",
        aws_access_key_id=M_USER,
        aws_secret_access_key=M_PASS,
        config=Config(signature_version="s3v4", region_name=REGION),
        use_ssl=False,
        verify=False,
    )
    s3_client2 = boto3.client(
        "s3",
        endpoint_url="http://localhost:9000",
        aws_access_key_id=M_USER,
        aws_secret_access_key=M_PASS,
        config=Config(signature_version="s3v4", region_name=REGION),
        use_ssl=False,
        verify=False,
    )

try:
    s3_client1.create_bucket(Bucket=BUCKET)
except Exception:
    pass


@application.route("/preSignS3URL", methods=["GET", "POST"])
@requires_user
def presign_S3():
    data = request.get_json()
    filename = data.get("filename")
    prefix = data.get("prefix")

    try:
        response = s3_client2.generate_presigned_post(Bucket=BUCKET, Key=prefix + "/" + filename, ExpiresIn=3600)
    except PhenopolisException as e:
        application.logger.error(str(e))
        return None

    return jsonify(response), 200


@application.route("/files/<individual_id>", methods=["GET", "POST"])
@requires_user
def getUploadedFile(individual_id):
    try:
        response = s3_client1.list_objects_v2(Bucket=BUCKET, Prefix=individual_id, MaxKeys=100)
        if response["KeyCount"] == 0:
            return jsonify(response), 404
    except PhenopolisException as e:
        application.logger.error(str(e))
        return None
    message = "get Uploaded File Success"
    return jsonify(message=message, response=response), 200


@application.route("/files", methods=["DELETE"])
@requires_user
def delete_file():
    data = request.get_json()
    fileKey = data.get("fileKey")
    response = s3_client1.delete_object(Bucket=BUCKET, Key=fileKey)

    return jsonify(message="Delete File Success", response=response), 200


@application.route("/file_download", methods=["POST"])
@requires_user
def download_file():
    data = request.get_json()
    fileKey = data.get("fileKey")
    response = s3_client2.generate_presigned_url(
        "get_object", Params={"Bucket": BUCKET, "Key": fileKey}, ExpiresIn=300,
    )
    return jsonify(filename=fileKey, response=response), 200
