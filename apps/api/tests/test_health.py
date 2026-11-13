def test_health_returns_ok(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["environment"] == "test"
    assert "X-Request-ID" in response.headers


def test_health_does_not_leak_secrets(client):
    assert "openai" not in client.get("/api/v1/health").text.lower()


def test_unknown_route_uses_uniform_error_shape(client):
    response = client.get("/api/v1/does-not-exist")
    assert response.status_code == 404
    error = response.json()["error"]
    assert error["code"] == "http_404"
    assert error["request_id"]


def test_openapi_lists_versioned_routes(client):
    paths = client.get("/openapi.json").json()["paths"]
    assert "/api/v1/health" in paths
    assert "/api/v1/trip-requests" in paths
