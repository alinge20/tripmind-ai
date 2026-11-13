"""Manejo uniforme de errores.

Cualquier error sale con la misma forma JSON:

    {"error": {"code": "...", "message": "...", "details": [...], "request_id": "..."}}

Así el frontend siempre sabe cómo leerlo, y nunca enviamos trazas internas al usuario.
"""

import logging
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("tripmind.errors")


class AppError(Exception):
    """Error de negocio controlado, con un código estable que el frontend puede interpretar."""

    def __init__(self, code: str, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def _error_body(
    request: Request, code: str, message: str, details: list[dict[str, Any]] | None = None
) -> dict[str, Any]:
    body: dict[str, Any] = {
        "code": code,
        "message": message,
        "request_id": getattr(request.state, "request_id", None),
    }
    if details:
        body["details"] = details
    return {"error": body}


# Traducción de los errores más comunes de Pydantic (vienen en inglés) a mensajes para el usuario.
_VALIDATION_MESSAGES: dict[str, str] = {
    "missing": "Este campo es obligatorio.",
    "string_too_short": "Debe tener al menos {min_length} caracteres.",
    "string_too_long": "Debe tener como máximo {max_length} caracteres.",
    "too_long": "Hay demasiados elementos (máximo {max_length}).",
    "greater_than": "Debe ser mayor que {gt}.",
    "greater_than_equal": "Debe ser mayor o igual que {ge}.",
    "less_than_equal": "Debe ser menor o igual que {le}.",
    "enum": "Valor no permitido. Opciones: {expected}.",
    "extra_forbidden": "Campo no permitido.",
    "int_parsing": "Debe ser un número entero.",
    "decimal_parsing": "Debe ser un número.",
    "decimal_max_digits": "El número es demasiado grande.",
    "decimal_max_places": "Demasiados decimales.",
    "date_from_datetime_parsing": "Fecha no válida (formato AAAA-MM-DD).",
    "date_parsing": "Fecha no válida (formato AAAA-MM-DD).",
}


def _translate(err: dict[str, Any]) -> str:
    template = _VALIDATION_MESSAGES.get(str(err.get("type")))
    if template:
        try:
            return template.format(**err.get("ctx", {}))
        except (KeyError, IndexError):
            pass
    # Pydantic antepone "Value error, " a los mensajes de nuestros propios validadores.
    return str(err.get("msg", "")).removeprefix("Value error, ")


def _field_path(loc: tuple[Any, ...]) -> str:
    # loc llega como ("body", "budget", "amount"); al frontend solo le interesa "budget.amount".
    parts = [str(part) for part in loc if part != "body"]
    return ".".join(parts) or "body"


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(request: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code, content=_error_body(request, exc.code, exc.message)
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        details = [
            {
                "field": _field_path(tuple(err.get("loc", ()))),
                "message": _translate(err),
            }
            for err in exc.errors()
        ]
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content=_error_body(
                request, "validation_error", "Algunos datos no son válidos.", details
            ),
        )

    @app.exception_handler(StarletteHTTPException)
    async def handle_http_error(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        messages = {
            404: "El recurso solicitado no existe.",
            405: "Método no permitido para esta ruta.",
            429: "Demasiadas peticiones. Espera un momento e inténtalo de nuevo.",
        }
        message = messages.get(exc.status_code, "No se pudo procesar la petición.")
        return JSONResponse(
            status_code=exc.status_code,
            content=_error_body(request, f"http_{exc.status_code}", message),
            headers=getattr(exc, "headers", None),
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
        # La traza completa queda en el log del servidor, nunca en la respuesta.
        request_id = getattr(request.state, "request_id", None)
        logger.exception("Unhandled error (request_id=%s)", request_id)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=_error_body(
                request, "internal_error", "Ocurrió un error inesperado. Inténtalo más tarde."
            ),
        )
