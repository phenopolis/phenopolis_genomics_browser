"""
Received Uploaded Files
"""
import os
import boto3
from botocore.client import Config
from flask import request, jsonify

from views import application
from views.auth import requires_admin
from views.exceptions import PhenopolisException


UPLOAD_FOLDER = "upload"

S3_KEY = os.getenv("VCF_S3_KEY")
SECRET_ACCESS_KEY = os.environ.get("VCF_S3_SECRET")


@application.route("/preSignS3URL", methods=["GET", "POST"])
@requires_admin
def presign_S3():
    data = request.get_json()
    filename = data.get("filename")
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=S3_KEY,
        aws_secret_access_key=SECRET_ACCESS_KEY,
        config=Config(signature_version="s3v4", region_name="eu-west-2"),
    )
    try:
        response = s3_client.generate_presigned_post(Bucket="phenopolis-website-uploads", Key=filename, ExpiresIn=3600,)
    except PhenopolisException as e:
        application.logger.error(str(e))
        return None

    return jsonify(response), 200
