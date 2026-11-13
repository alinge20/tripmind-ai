from datetime import timedelta

import pytest

from tests.conftest import make_settings

URL = "/api/v1/trip-requests"


def valid_payload(departure, **overrides):
    payload = {
        "origin": "Bogotá",
        "destination": "Cartagena",
        "departure_date": departure.isoformat(),
        "return_date": (departure + timedelta(days=4)).isoformat(),
        "travelers": 2,
        "trip_type": "romantic",
        "budget": {"amount": "3000000", "currency": "COP"},
        "interests": ["beach", "food"],
    }
    payload.update(overrides)
    return payload


def test_valid_request_returns_summary(client, future_date):
    response = client.post(URL, json=valid_payload(future_date))
    assert response.status_code == 201
    body = response.json()
    summary = body["summary"]
    assert summary["nights"] == 4
    assert summary["destination_decided"] is True
    # 3.000.000 COP / 2 personas = 1.500.000; / 5 días = 300.000. Importes como texto exacto.
    assert summary["budget"]["per_person"] == {"amount": "1500000", "currency": "COP"}
    assert summary["budget"]["per_person_per_day"] == {"amount": "300000", "currency": "COP"}
    assert summary["budget"]["source"] == "user_input"
    assert body["persisted"] is False
    assert body["missing_information"] == []


def test_usd_budget_keeps_cents(client, future_date):
    payload = valid_payload(future_date, budget={"amount": "1000", "currency": "USD"}, travelers=3)
    body = client.post(URL, json=payload).json()
    assert body["summary"]["budget"]["per_person"]["amount"] == "333.33"


def test_ai_status_is_honest_without_key(client, future_date):
    ai = client.post(URL, json=valid_payload(future_date)).json()["ai"]
    assert ai["status"] == "not_configured"


def test_ai_status_with_key_is_not_claimed_as_working(future_date):
    from app.services.trip_request_service import ai_status

    status = ai_status(make_settings(openai_api_key="sk-test-not-real"))
    assert status.status == "not_implemented"


def test_return_before_departure_is_rejected(client, future_date):
    payload = valid_payload(future_date, return_date=(future_date - timedelta(days=1)).isoformat())
    response = client.post(URL, json=payload)
    assert response.status_code == 422
    error = response.json()["error"]
    assert error["code"] == "validation_error"
    assert "anterior" in error["details"][0]["message"]


def test_departure_in_the_past_is_rejected(client, future_date):
    past = future_date - timedelta(days=400)
    response = client.post(URL, json=valid_payload(past))
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "departure_in_past"


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("travelers", 0),
        ("travelers", 21),
        ("origin", "B"),
        ("budget", {"amount": "-5", "currency": "COP"}),
        ("budget", {"amount": "100", "currency": "EUR"}),
        ("trip_type", "space"),
        ("notes", "x" * 501),
    ],
)
def test_invalid_fields_are_rejected(client, future_date, field, value):
    response = client.post(URL, json=valid_payload(future_date, **{field: value}))
    assert response.status_code == 422
    fields = [d["field"] for d in response.json()["error"]["details"]]
    assert any(f.startswith(field) for f in fields)


def test_unknown_fields_are_rejected(client, future_date):
    # Un cliente no puede colar campos como "is_premium": la API los rechaza.
    response = client.post(URL, json=valid_payload(future_date, is_premium=True))
    assert response.status_code == 422


def test_trip_longer_than_limit_is_rejected(client, future_date):
    payload = valid_payload(future_date, return_date=(future_date + timedelta(days=61)).isoformat())
    assert client.post(URL, json=payload).status_code == 422


def test_undecided_destination_lists_missing_information(client):
    payload = {"origin": "Medellín", "travelers": 1}
    body = client.post(URL, json=payload).json()
    assert body["summary"]["destination_decided"] is False
    missing = {item["field"] for item in body["missing_information"]}
    assert {"budget", "departure_date", "preferred_climate", "trip_length_days"} <= missing


def test_rate_limit_returns_429(future_date):
    from fastapi.testclient import TestClient

    from app.core.config import get_settings
    from app.core.rate_limit import rate_limiter
    from app.main import create_app

    settings = make_settings(rate_limit_per_minute=2)
    app = create_app(settings)
    app.dependency_overrides[get_settings] = lambda: settings
    rate_limiter.reset()
    with TestClient(app) as client:
        codes = [client.post(URL, json=valid_payload(future_date)).status_code for _ in range(3)]
    rate_limiter.reset()
    assert codes == [201, 201, 429]


def test_cors_allows_only_configured_origin(client):
    allowed = client.options(
        URL, headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "POST"}
    )
    blocked = client.options(
        URL, headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "POST"}
    )
    assert allowed.headers.get("access-control-allow-origin") == "http://localhost:3000"
    assert "access-control-allow-origin" not in blocked.headers


def test_validation_messages_are_in_spanish(client, future_date):
    response = client.post(URL, json=valid_payload(future_date, travelers=0, extra_field=1))
    messages = {d["field"]: d["message"] for d in response.json()["error"]["details"]}
    assert messages["travelers"] == "Debe ser mayor o igual que 1."
    assert messages["extra_field"] == "Campo no permitido."
