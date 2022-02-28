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

BUCKET = os.getenv("BUCKET", "phenopolis-website-uploads")
REGION = os.getenv("REGION", "eu-west-2")

S3_USER = os.getenv("S3_ACCESS_KEY_ID")
S3_PASS = os.getenv("S3_SECRET_ACCESS_KEY")
ENDPOINT = os.getenv("ENDPOINT")

s3_client1 = boto3.client(  # for listing and delete
    "s3",
    endpoint_url=ENDPOINT,  # http://minio-server:9000 works
    # endpoint_url="http://localhost:9000", # did not work
    # endpoint_url="http://host.docker.internal:9000", # does work
    aws_access_key_id=S3_USER,
    aws_secret_access_key=S3_PASS,
    config=Config(signature_version="s3v4", region_name=REGION),
)

s3_client2 = s3_client1
if ENDPOINT:
    if "minio-server" in ENDPOINT:
        s3_client2 = boto3.client(  # needs localhost, because of uppy? to presign (upload) and download
            "s3",
            endpoint_url="http://localhost:9000",  # worked
            # see https://docs.min.io/docs/how-to-use-aws-sdk-for-python-with-minio-server.html
            # endpoint_url="http://minio-server:9000", # does not work
            aws_access_key_id=S3_USER,
            aws_secret_access_key=S3_PASS,
            config=Config(signature_version="s3v4", region_name=REGION),
        )

try:
    s3_client1.create_bucket(Bucket=BUCKET, CreateBucketConfiguration={"LocationConstraint": REGION})
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
