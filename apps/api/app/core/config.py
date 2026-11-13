"""Configuración centralizada.

Todos los valores vienen de variables de entorno (o de un archivo .env en local).
Así el código no contiene secretos y cada entorno (local, producción) puede
configurarse sin tocar el código.
"""

from functools import lru_cache
from typing import Annotated, Literal
from zoneinfo import ZoneInfo

from fastapi import Depends
from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "TripMind AI API"
    app_version: str = "0.1.0"
    app_env: Literal["development", "production", "test"] = "development"

    # Se guarda como texto ("a,b") porque es la forma natural de escribir listas en un .env.
    cors_origins: str = "http://localhost:3000"
    default_timezone: str = "America/Bogota"
    rate_limit_per_minute: int = Field(default=20, ge=1, le=1000)

    # SecretStr evita que la clave aparezca si alguien imprime la configuración.
    openai_api_key: SecretStr | None = None

    @field_validator("default_timezone")
    @classmethod
    def _valid_timezone(cls, value: str) -> str:
        ZoneInfo(value)  # lanza un error si la zona horaria no existe
        return value

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def ai_provider_configured(self) -> bool:
        return bool(self.openai_api_key and self.openai_api_key.get_secret_value().strip())


@lru_cache
def get_settings() -> Settings:
    return Settings()


# Atajo para inyectar la configuración en rutas y dependencias de FastAPI.
SettingsDep = Annotated[Settings, Depends(get_settings)]
