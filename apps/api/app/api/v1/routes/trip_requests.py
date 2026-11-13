from fastapi import APIRouter, Depends, status

from app.core.config import SettingsDep
from app.core.rate_limit import enforce_rate_limit
from app.schemas.common import ErrorResponse
from app.schemas.trip_request import TripRequestCreate, TripRequestResponse
from app.services.trip_request_service import create_trip_request

router = APIRouter(prefix="/trip-requests", tags=["trip-requests"])


@router.post(
    "",
    response_model=TripRequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Valida un pedido de viaje y devuelve su resumen",
    description=(
        "Valida los datos del formulario, calcula noches y presupuesto por persona, "
        "y lista la información que falta. No genera itinerarios ni guarda datos todavía."
    ),
    dependencies=[Depends(enforce_rate_limit)],
    responses={422: {"model": ErrorResponse}, 429: {"model": ErrorResponse}},
)
def post_trip_request(payload: TripRequestCreate, settings: SettingsDep) -> TripRequestResponse:
    return create_trip_request(payload, settings)
