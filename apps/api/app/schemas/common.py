from decimal import Decimal
from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, Field


class Currency(StrEnum):
    """Monedas soportadas. Para añadir otra basta con agregarla aquí y en MINOR_UNITS."""

    COP = "COP"
    USD = "USD"


# Decimales con los que se expresa cada moneda (el peso colombiano se usa sin centavos).
MINOR_UNITS: dict[Currency, int] = {Currency.COP: 0, Currency.USD: 2}


class Money(BaseModel):
    """Un importe siempre viaja con su moneda.

    Usamos Decimal (no float) porque los float no representan exactamente valores como 0.1.
    En JSON el importe se envía como texto ("1500000") para no perder precisión.
    """

    amount: Decimal = Field(gt=0, max_digits=14, decimal_places=2)
    currency: Currency


class ErrorDetail(BaseModel):
    field: str
    message: str


class ErrorBody(BaseModel):
    code: str
    message: str
    request_id: str | None = None
    details: list[ErrorDetail] | None = None


class ErrorResponse(BaseModel):
    error: ErrorBody


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str
    version: str
    environment: str
