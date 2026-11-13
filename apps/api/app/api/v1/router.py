from fastapi import APIRouter

from app.api.v1.routes import health, trip_requests

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router)
api_router.include_router(trip_requests.router)
