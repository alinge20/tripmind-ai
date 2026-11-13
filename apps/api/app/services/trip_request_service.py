"""Lógica de negocio del pedido de viaje.

Las rutas solo reciben y devuelven datos; las decisiones viven aquí para poder
probarlas sin HTTP y reutilizarlas cuando lleguen la IA y la base de datos.
"""

import uuid
from datetime import date, datetime
from decimal import ROUND_HALF_UP, Decimal
from zoneinfo import ZoneInfo

from app.core.config import Settings
from app.core.errors import AppError
from app.schemas.common import MINOR_UNITS, Currency, Money
from app.schemas.trip_request import (
    AIStatus,
    BudgetSummary,
    MissingInformation,
    TripRequestCreate,
    TripRequestResponse,
    TripSummary,
)


def today_in(timezone: str) -> date:
    return datetime.now(ZoneInfo(timezone)).date()


def round_money(amount: Decimal, currency: Currency) -> Decimal:
    exponent = Decimal(1).scaleb(-MINOR_UNITS[currency])  # 0 -> Decimal("1"), 2 -> Decimal("0.01")
    return amount.quantize(exponent, rounding=ROUND_HALF_UP)


def build_budget_summary(budget: Money, travelers: int, days: int | None) -> BudgetSummary:
    per_person = round_money(budget.amount / travelers, budget.currency)
    per_day = None
    if days:
        daily = round_money(budget.amount / travelers / days, budget.currency)
        per_day = Money(amount=daily, currency=budget.currency)
    return BudgetSummary(
        total=Money(amount=round_money(budget.amount, budget.currency), currency=budget.currency),
        per_person=Money(amount=per_person, currency=budget.currency),
        per_person_per_day=per_day,
    )


def find_missing_information(trip: TripRequestCreate) -> list[MissingInformation]:
    """Datos que el asistente necesitará pedir antes de poder recomendar con criterio."""
    missing: list[MissingInformation] = []

    def add(field: str, reason: str) -> None:
        missing.append(MissingInformation(field=field, reason=reason))

    if trip.destination is None:
        if trip.budget is None:
            add("budget", "Para sugerir destinos necesitamos saber cuánto quieres gastar.")
        if trip.departure_date is None:
            add("departure_date", "Las fechas aproximadas cambian el clima y los precios.")
        if trip.preferred_climate is None:
            add("preferred_climate", "Indica el clima que prefieres para filtrar destinos.")
    if trip.departure_date is None and trip.trip_length_days is None:
        add("trip_length_days", "Sin fechas ni duración no podemos armar un plan diario.")
    elif trip.departure_date and trip.return_date is None and trip.trip_length_days is None:
        add("return_date", "Indica la fecha de regreso o la duración del viaje.")
    return missing


def ai_status(settings: Settings) -> AIStatus:
    if not settings.ai_provider_configured:
        return AIStatus(
            status="not_configured",
            message="La IA todavía no está configurada. No se generó ningún itinerario.",
        )
    return AIStatus(
        status="not_implemented",
        message=(
            "Hay una clave de IA configurada, pero la generación de itinerarios llega en la Fase 4."
        ),
    )


def create_trip_request(trip: TripRequestCreate, settings: Settings) -> TripRequestResponse:
    if trip.departure_date and trip.departure_date < today_in(settings.default_timezone):
        raise AppError("departure_in_past", "La fecha de salida no puede estar en el pasado.", 422)

    nights = None
    if trip.departure_date and trip.return_date:
        nights = (trip.return_date - trip.departure_date).days
    # Un viaje de 3 noches son 4 días (día de llegada + día de regreso).
    days = nights + 1 if nights is not None else trip.trip_length_days

    summary = TripSummary(
        origin=trip.origin,
        destination=trip.destination,
        destination_decided=trip.destination is not None,
        departure_date=trip.departure_date,
        return_date=trip.return_date,
        nights=nights,
        travelers=trip.travelers,
        trip_type=trip.trip_type,
        budget=build_budget_summary(trip.budget, trip.travelers, days) if trip.budget else None,
    )
    return TripRequestResponse(
        request_id=uuid.uuid4(),
        summary=summary,
        missing_information=find_missing_information(trip),
        ai=ai_status(settings),
    )
