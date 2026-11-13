# TripMind AI

Asistente de viajes con inteligencia artificial: ayuda a pasar de una idea a un itinerario organizado,
con presupuesto claro y enlaces a proveedores autorizados para reservar.

> Estado: **Fase 1 (fundación funcional)**. La web y la API funcionan en local y se comunican.
> Todavía **no** hay IA conectada, base de datos ni usuarios: la interfaz lo indica claramente.

## Estructura

```
tripmind-ai/
├── apps/
│   ├── web/   Next.js 16 (App Router) + React 19 + TypeScript estricto + Tailwind CSS 4
│   └── api/   FastAPI + Pydantic 2 (Python 3.11+), API REST en /api/v1
├── docs/      Arquitectura, instalación, API, hoja de ruta y registro de tareas
└── README.md
```

## Arranque rápido (Windows, PowerShell)

Necesitas Node.js 22 LTS (o 20.9+), Python 3.11+ y Git. Guía completa: [docs/setup.md](docs/setup.md).

```powershell
# Terminal 1: API
cd apps\api
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000

# Terminal 2: web
cd apps\web
npm install
Copy-Item .env.example .env.local
npm run dev
```

Abre http://localhost:3000 (web) y http://localhost:8000/docs (documentación de la API).

## Comprobaciones

```powershell
cd apps\api;  pytest; ruff check .
cd apps\web;  npm test; npm run lint; npm run typecheck; npm run build
```

## Documentación

- [docs/architecture.md](docs/architecture.md): cómo está pensado el sistema y por qué.
- [docs/setup.md](docs/setup.md): instalación paso a paso en Windows y solución de problemas.
- [docs/api.md](docs/api.md): endpoints, contratos y formato de errores.
- [docs/roadmap.md](docs/roadmap.md): fases, tareas terminadas y pendientes, decisiones abiertas.
- [docs/deployment.md](docs/deployment.md): variables y lista de comprobación para un despliegue seguro.
