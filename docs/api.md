# API (v1)

Base local: `http://localhost:8000`. Documentación interactiva (OpenAPI): `http://localhost:8000/docs`
(se desactiva cuando `APP_ENV=production`).

## `GET /api/v1/health`

Comprueba que la API responde. No revela configuración sensible.

```json
{ "status": "ok", "service": "TripMind AI API", "version": "0.1.0", "environment": "development" }
```

## `POST /api/v1/trip-requests`

Valida un pedido de viaje y devuelve un resumen. **No genera itinerarios ni guarda datos todavía.**
Límite: `RATE_LIMIT_PER_MINUTE` peticiones por minuto e IP (por defecto 20).

### Petición

| Campo | Tipo | Obligatorio | Reglas |
| --- | --- | --- | --- |
| `origin` | string | sí | 2–100 caracteres |
| `destination` | string \| null | no | 2–100; `null` = «aún no sé a dónde ir» |
| `departure_date` / `return_date` | `YYYY-MM-DD` \| null | no | salida ≥ hoy; regreso ≥ salida; máx. 60 días |
| `date_flexibility` | `exact` \| `plus_minus_3_days` \| `flexible_month` | no | |
| `travelers` | entero | sí | 1–20 |
| `trip_type` | `leisure` \| `romantic` \| `family` \| `friends` \| `adventure` \| `backpacking` \| `business` | no | |
| `budget` | `{amount: "3000000", currency: "COP" \| "USD"}` \| null | no | amount > 0, máx. 2 decimales |
| `accommodation` | `any` \| `hotel` \| `hostel` \| `apartment` \| `resort` | no | |
| `interests` | lista | no | máx. 8 de: beach, culture, food, nature, nightlife, shopping, adventure, relax |
| `preferred_climate` | `warm` \| `mild` \| `cold` \| `any` \| null | no | |
| `trip_length_days` | entero \| null | no | 1–60 |
| `notes` | string \| null | no | máx. 500 caracteres |

Campos no listados → `422` («Campo no permitido»).

### Respuesta `201`

```json
{
  "request_id": "6f1c…",
  "summary": {
    "origin": "Bogotá", "destination": "Cartagena", "destination_decided": true,
    "departure_date": "2026-11-14", "return_date": "2026-11-18", "nights": 4,
    "travelers": 2, "trip_type": "romantic",
    "budget": {
      "total": {"amount": "3000000", "currency": "COP"},
      "per_person": {"amount": "1500000", "currency": "COP"},
      "per_person_per_day": {"amount": "300000", "currency": "COP"},
      "source": "user_input"
    }
  },
  "missing_information": [],
  "ai": {"status": "not_configured", "message": "La IA todavía no está configurada. No se generó ningún itinerario."},
  "persisted": false,
  "currency_supported": ["COP", "USD"]
}
```

`per_person_per_day` divide entre días (noches + 1). Es aritmética sobre el presupuesto del usuario,
no una estimación de precios.

## Formato de errores

```json
{
  "error": {
    "code": "validation_error",
    "message": "Algunos datos no son válidos.",
    "request_id": "072f5f5e…",
    "details": [{"field": "travelers", "message": "Debe ser mayor o igual que 1."}]
  }
}
```

| Código HTTP | `code` | Cuándo |
| --- | --- | --- |
| 422 | `validation_error` | Datos con formato o reglas incorrectas |
| 422 | `departure_in_past` | Salida anterior a hoy (zona `DEFAULT_TIMEZONE`) |
| 404 | `http_404` | Ruta inexistente |
| 429 | `http_429` | Límite de peticiones superado (cabecera `Retry-After`) |
| 500 | `internal_error` | Error inesperado (detalle solo en los logs del servidor) |

Cada respuesta incluye la cabecera `X-Request-ID` para relacionarla con los logs.
