def test_presign_S3(_admin_client):
    patientID = "PH0001"
    payload = {
        "prefix": patientID,
        "filename": patientID + "_" + "a_file.vcf",
        "contentType": "multipart/form-data",
    }
    resp = _admin_client.post("/preSignS3URL", json=payload, content_type="application/json")
    assert resp.status_code == 200
    assert "x-amz-credential" in str(resp.json)
    assert resp.json.get("fields").get("key") == f"{patientID}/{payload['filename']}"
