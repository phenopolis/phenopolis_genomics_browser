def test_login_logout(_not_logged_in_client):
    resp = _not_logged_in_client.get("is_logged_in")
    assert resp.status_code == 401
    assert resp.json == {"error": "Unauthenticated"}

    resp = _not_logged_in_client.post("/login", json={"user": "demo", "password": "demo1234"})
    assert resp.status_code == 401
    assert resp.json == {"error": "Invalid Credentials. Please try again."}

    resp = _not_logged_in_client.post("/login", json={"user": "acme", "password": "demo1234"})
    assert resp.status_code == 401
    assert resp.json == {"error": "Invalid Credentials. Please try again."}

    resp = _not_logged_in_client.post("/login", json={"user": "demo", "password": "demo123"})
    assert resp.status_code == 200
    assert resp.json == {"success": "Authenticated", "username": "demo"}

    resp = _not_logged_in_client.get("/is_logged_in")
    assert resp.status_code == 200
    assert resp.json == {"username": "demo"}

    resp = _not_logged_in_client.post("/logout")
    assert resp.status_code == 200
    assert resp.json == {"success": "logged out"}

    resp = _not_logged_in_client.get("/is_logged_in")
    assert resp.status_code == 401


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
