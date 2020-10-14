def test_login_logout(api):
    resp = api.get(None, "/is_logged_in")
    assert resp.status_code == 401
    assert resp.json() == {"error": "Unauthenticated"}

    resp = api.post(None, "/login", {"user": "demo", "password": "demo1234"})
    assert resp.status_code == 401
    assert resp.json() == {"error": "Invalid Credentials. Please try again."}

    resp = api.post(None, "/login", {"user": "acme", "password": "demo1234"})
    assert resp.status_code == 401
    assert resp.json() == {"error": "Invalid Credentials. Please try again."}

    resp = api.get(None, "/is_logged_in")
    assert resp.status_code == 401

    resp = api.post(None, "/login", {"user": "demo", "password": "demo123"})
    assert resp.status_code == 200
    assert resp.json() == {"success": "Authenticated", "username": "demo"}

    resp = api.get(None, "/is_logged_in")
    assert resp.status_code == 200
    assert resp.json() == {"username": "demo"}

    resp = api.post(None, "/logout")
    assert resp.status_code == 200
    assert resp.json() == {"success": "logged out"}

    resp = api.get(None, "/is_logged_in")
    assert resp.status_code == 401
