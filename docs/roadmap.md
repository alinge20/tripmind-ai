# Hoja de ruta y registro de tareas

## Fase 0 — Auditoría (terminada, 2026-10-15)

- Carpeta de trabajo vacía: no había código previo que conservar.
- Equipo del usuario: Windows x64. Sin repositorio de GitHub para TripMind todavía.
- Entorno de construcción: Node 22.22, npm 10.9, Python 3.13, Git 2.43.
- Versiones elegidas (estables actuales): Next.js 16.4.1, React 19.3, TypeScript 5, Tailwind CSS 4,
  Zod 4, lucide-react (iconos), Vitest 5; FastAPI 0.143, Pydantic 2.14, pydantic-settings 2.16,
  Uvicorn 0.54, pytest 9, Ruff 0.17.

## Fase 1 — Fundación funcional (terminada)

- [x] Monorepositorio `apps/web` + `apps/api` + `docs`.
- [x] API FastAPI versionada (`/api/v1`): salud, pedido de viaje, OpenAPI.
- [x] Configuración por variables de entorno, CORS restringido, límite de peticiones, errores uniformes.
- [x] Esquemas Pydantic con dinero en `Decimal` y moneda, validación de fechas y coherencia.
- [x] Página de inicio responsive: navegación, hero con buscador, formulario, alternativa «no sé a dónde
      ir», cómo funciona, ejemplo de itinerario marcado como demostración, beneficios, destinos, CTA, footer.
- [x] Formulario con validación (Zod), errores por campo, estados vacío/carga/error/éxito, accesible por teclado.
- [x] Comunicación web → API verificada en navegador (escritorio y móvil).
- [x] Páginas legales en borrador (términos, privacidad, contacto).
- [x] Pruebas: 24 backend (pytest) y 20 frontend (Vitest).

### Criterios de aceptación de la Fase 1

| Criterio | Cómo se comprobó |
| --- | --- |
| El frontend arranca en local | `npm run build` + `next start`, la página responde 200 |
| El backend arranca en local | `uvicorn`, `/api/v1/health` responde `ok` |
| Responsive móvil/escritorio | Playwright a 390 px y 1366 px, sin desbordamiento horizontal |
| El formulario valida | Pruebas Vitest + envío vacío en navegador muestra errores |
| Comunicación web–API | Envío real desde el navegador devuelve el resumen calculado por la API |
| Errores comprensibles | API caída, validación del servidor (422) y límite (429) probados |
| Pruebas pasan | pytest 24/24, Vitest 20/20, ESLint, TypeScript y Ruff sin errores |
| Sin secretos en el repositorio | Solo `.env.example` con valores vacíos o ficticios; `.env` ignorado |
| Documentación de instalación | `docs/setup.md` |

## Fase 2 — Flujo de planificación (siguiente)

- [ ] Página `/planificar/[id]` con el resultado del pedido y la estructura de días/actividades.
- [ ] Contrato `Itinerary` → `ItineraryDay` → `Activity` con `verification_status`
      (`recommendation` | `estimate` | `verified`), fuente, fecha de consulta y precio opcional con moneda.
- [ ] Presupuesto por categorías (transporte internacional/local, alojamiento, alimentación,
      actividades, seguros/otros, contingencia) con origen del importe (`provider` | `estimate` | `user_input`).
- [ ] Generador de itinerarios detrás de una interfaz `ItineraryGenerator`; implementación de
      demostración claramente etiquetada hasta tener IA.
- [ ] Tipos TypeScript generados desde OpenAPI para no mantenerlos a mano.

Criterios: ver un plan de demostración etiquetado como tal, sin precios inventados; la API rechaza
salidas del generador que no cumplan el esquema.

## Fase 3 — Supabase y usuarios

- [ ] Proyecto Supabase (requiere cuenta del usuario) y CLI local.
- [ ] Migraciones: `profiles`, `trips`, `itinerary_days`, `activities`, `budget_items`,
      `flight_searches`, `affiliate_clicks`, `subscriptions` con RLS.
- [ ] Registro e inicio de sesión con `@supabase/ssr`; verificación JWT (JWKS) en FastAPI.
- [ ] Prueba: un usuario no puede leer ni modificar viajes de otro.

## Fase 4 — IA · Fase 5 — Proveedores · Fase 6 — Monetización · Fase 7 — Lanzamiento

Según el documento de requisitos. Antes de la Fase 5 hay que investigar acceso y condiciones de
Amadeus, Skyscanner y Booking.com (afiliación, entornos de prueba, reglas de visualización).

## Decisiones y pendientes que requieren al usuario

1. **Repositorio GitHub** para versionar el proyecto (recomendado: privado, `tripmind-ai`).
2. **Cuenta de Supabase** (plan gratuito suficiente para el MVP) — Fase 3.
3. **Clave de OpenAI** con límite de gasto configurado en su panel — Fase 4.
4. **Solicitudes de acceso** a programas de afiliados/APIs de viajes — Fase 5.
5. **Imágenes de destinos**: elegir fuente con licencia clara (p. ej. fotos propias o bancos con
   licencia comercial). Hasta entonces se usan iconos.
6. **Textos legales** revisados por un profesional antes del lanzamiento.

## Notas técnicas

- `npm audit` informa 5 vulnerabilidades «high» en `braces`/`micromatch`, que llegan a través de
  `eslint-config-next` (herramienta de desarrollo; no se incluye en la web publicada). La «solución»
  automática degrada a Next 14, así que no se aplica. Revisar en cada actualización de Next.js.
- El límite de peticiones está en memoria: no sirve con varios procesos/servidores (moverlo a Redis en la Fase 7).
