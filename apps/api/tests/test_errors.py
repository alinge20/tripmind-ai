from fastapi.testclient import TestClient

from app.main import create_app
from tests.conftest import make_settings


def test_unexpected_errors_hide_internal_details():
    app = create_app(make_settings())

    @app.get("/boom")
    def boom():
        raise RuntimeError("secret internal detail")

    with TestClient(app, raise_server_exceptions=False) as client:
        response = client.get("/boom")

    assert response.status_code == 500
    assert response.json()["error"]["code"] == "internal_error"
    assert "secret internal detail" not in response.text
