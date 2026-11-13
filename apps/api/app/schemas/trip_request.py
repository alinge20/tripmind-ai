"""Contratos (esquemas) del pedido de viaje.

Pydantic valida automáticamente todo lo que entra a la API: tipos, rangos y reglas
entre campos. Si algo no cumple, FastAPI responde 422 antes de llegar a la lógica.
"""

from datetime import date
from enum import StrEnum
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.common import Currency, Money

MAX_TRIP_DAYS = 60


class TripType(StrEnum):
    LEISURE = "leisure"
    ROMANTIC = "romantic"
    FAMILY = "family"
    FRIENDS = "friends"
    ADVENTURE = "adventure"
    BACKPACKING = "backpacking"
    BUSINESS = "business"


class DateFlexibility(StrEnum):
    EXACT = "exact"
    PLUS_MINUS_3_DAYS = "plus_minus_3_days"
    FLEXIBLE_MONTH = "flexible_month"


class AccommodationType(StrEnum):
    ANY = "any"
    HOTEL = "hotel"
    HOSTEL = "hostel"
    APARTMENT = "apartment"
    RESORT = "resort"


class Interest(StrEnum):
    BEACH = "beach"
    CULTURE = "culture"
    FOOD = "food"
    NATURE = "nature"
    NIGHTLIFE = "nightlife"
    SHOPPING = "shopping"
    ADVENTURE = "adventure"
    RELAX = "relax"


class Climate(StrEnum):
    WARM = "warm"
    MILD = "mild"
    COLD = "cold"
    ANY = "any"


class TripRequestCreate(BaseModel):
    """Lo que el usuario envía desde el formulario."""

    # extra="forbid": si el cliente envía campos desconocidos (p. ej. "is_premium": true),
    # se rechazan en lugar de ignorarse silenciosamente.
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    origin: str = Field(min_length=2, max_length=100)
    destination: str | None = Field(default=None, min_length=2, max_length=100)
    departure_date: date | None = None
    return_date: date | None = None
    date_flexibility: DateFlexibility = DateFlexibility.EXACT
    travelers: int = Field(ge=1, le=20)
    trip_type: TripType = TripType.LEISURE
    budget: Money | None = None
    accommodation: AccommodationType = AccommodationType.ANY
    interests: list[Interest] = Field(default_factory=list, max_length=8)
    preferred_climate: Climate | None = None
    trip_length_days: int | None = Field(default=None, ge=1, le=MAX_TRIP_DAYS)
    notes: str | None = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def _check_dates(self) -> "TripRequestCreate":
        if self.return_date and not self.departure_date:
            raise ValueError("Indica la fecha de salida si ya conoces la de regreso.")
        if self.departure_date and self.return_date:
            if self.return_date < self.departure_date:
                raise ValueError("La fecha de regreso no puede ser anterior a la de salida.")
            if (self.return_date - self.departure_date).days > MAX_TRIP_DAYS:
                raise ValueError(f"Por ahora planificamos viajes de hasta {MAX_TRIP_DAYS} días.")
        return self


class MissingInformation(BaseModel):
    field: str
    reason: str


class BudgetSummary(BaseModel):
    total: Money
    per_person: Money
    # Solo cuando conocemos la duración; es una división aritmética, no una estimación de precios.
    per_person_per_day: Money | None = None
    source: Literal["user_input"] = "user_input"


class TripSummary(BaseModel):
    origin: str
    destination: str | None
    destination_decided: bool
    departure_date: date | None
    return_date: date | None
    nights: int | None
    travelers: int
    trip_type: TripType
    budget: BudgetSummary | None


class AIStatus(BaseModel):
    status: Literal["not_configured", "not_implemented"]
    message: str


class TripRequestResponse(BaseModel):
    request_id: UUID
    summary: TripSummary
    missing_information: list[MissingInformation]
    ai: AIStatus
    # Fase 1 no guarda nada: la persistencia llega con Supabase en la Fase 3.
    persisted: Literal[False] = False
    currency_supported: list[Currency] = Field(default_factory=lambda: list(Currency))
