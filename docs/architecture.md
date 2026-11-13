# Arquitectura

## Visión general

```
Navegador ──► apps/web (Next.js) ──HTTP JSON──► apps/api (FastAPI) ──► IA / proveedores / Supabase
```

- **apps/web** se encarga de la experiencia: páginas, formularios, estados de carga/error y, desde la
  Fase 3, la sesión del usuario con Supabase (cookies del lado del servidor).
- **apps/api** es el único lugar con reglas de negocio e integraciones de terceros (IA, vuelos,
  alojamiento, pagos). Así las claves privadas nunca llegan al navegador y la lógica no se duplica.
- **Supabase (Fase 3)** guardará usuarios, viajes, itinerarios y presupuestos con Row Level Security.

### ¿Por qué validar en los dos lados?

El formulario valida en el navegador (Zod) para dar respuestas inmediatas, pero **la API vuelve a
validarlo todo** (Pydantic). Cualquiera puede enviar peticiones a la API sin pasar por la web, así que
la validación del servidor es la que protege los datos. Las reglas duplicadas son solo de formato; las
decisiones de negocio (cálculos, permisos, premium) viven únicamente en la API.

## Backend por capas (`apps/api/app`)

| Carpeta | Responsabilidad |
| --- | --- |
| `api/v1/routes/` | Rutas HTTP. Reciben, delegan y responden. Sin lógica de negocio. |
| `schemas/` | Contratos Pydantic: qué entra y qué sale de la API. |
| `services/` | Lógica de negocio. Se prueba sin HTTP. |
| `core/` | Configuración, errores, middleware, límite de peticiones. |

Las carpetas `repositories/` (acceso a datos) y `models/` se crearán en la Fase 3, cuando exista base
de datos; crearlas vacías ahora no aportaría nada.

## Frontend por funcionalidades (`apps/web/src`)

| Carpeta | Contenido |
| --- | --- |
| `app/` | Rutas de Next.js (página de inicio y páginas legales). |
| `components/` | Piezas reutilizables sin lógica de negocio (botones, badges, header, footer). |
| `features/` | Código agrupado por funcionalidad: `home/` (secciones) y `trip-planner/` (formulario). |
| `lib/` | Utilidades transversales: configuración y cliente HTTP. |
| `types/` | Tipos TypeScript de los contratos de la API. |

## Decisiones clave

1. **Importes con `Decimal` y como texto en JSON.** Un `float` no representa exactamente 0,1; en dinero
   eso produce errores de redondeo. COP se redondea a 0 decimales y USD a 2.
2. **Cada importe lleva su moneda** (`Money = {amount, currency}`) y su fuente (`source`). La API no suma
   monedas distintas; la conversión llegará con un tipo de cambio identificado y fechado.
3. **Honestidad de datos.** La respuesta indica `ai.status = not_configured` y `persisted = false`. La
   interfaz muestra «Configuración pendiente» en lugar de inventar un itinerario.
4. **Errores uniformes.** Todos los errores tienen la forma `{"error": {code, message, details, request_id}}`.
   Nunca se envían trazas internas; el `request_id` permite buscar el error en los logs.
5. **`extra="forbid"`.** La API rechaza campos desconocidos: un cliente no puede colar `is_premium: true`.
6. **CORS restringido** a los orígenes de `CORS_ORIGINS` (nunca `*`).
7. **Límite de peticiones** en memoria por IP en los POST. Válido para un proceso; en producción se
   moverá a Redis o al gateway.
8. **«Hoy» depende de la zona horaria.** La API usa `DEFAULT_TIMEZONE` (America/Bogota); el navegador
   usa su hora local y solo la calcula en el cliente (si se calculara al pre-renderizar quedaría fija).
9. **Estado del planificador compartido** con un contexto de React, para que el buscador del hero y las
   tarjetas de destinos puedan rellenar el formulario sin depender de la URL.

## Identidad del usuario entre web y API (diseño para la Fase 3)

1. El usuario inicia sesión con Supabase Auth desde Next.js (`@supabase/ssr`, cookies httpOnly).
2. Para llamar a la API, la web envía `Authorization: Bearer <access_token de Supabase>`.
3. FastAPI verifica la firma del JWT con las claves públicas (JWKS) del proyecto Supabase, comprueba
   `exp`, `aud` e `iss`, y obtiene el `user_id` del claim `sub`. **Nunca** se acepta un `user_id`
   enviado en el cuerpo.
4. Las consultas a Supabase desde la API usan el token del usuario para que también apliquen las
   políticas RLS (defensa en profundidad). La clave `service_role` solo se usará en tareas internas.
