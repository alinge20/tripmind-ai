from collections.abc import Iterator
from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings, get_settings
from app.core.rate_limit import rate_limiter
from app.main import create_app


def make_settings(**overrides: object) -> Settings:
    # _env_file=None: las pruebas no leen tu .env local, así son reproducibles.
    base: dict[str, object] = {"app_env": "test", "openai_api_key": None}
    base.update(overrides)
    return Settings(_env_file=None, **base)  # type: ignore[arg-type]


@pytest.fixture
def settings() -> Settings:
    return make_settings()


@pytest.fixture
def client(settings: Settings) -> Iterator[TestClient]:
    rate_limiter.reset()
    app = create_app(settings)
    app.dependency_overrides[get_settings] = lambda: settings
    with TestClient(app) as test_client:
        yield test_client
    rate_limiter.reset()


@pytest.fixture
def future_date() -> date:
    return date.today() + timedelta(days=30)
