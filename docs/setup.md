# Instalación y ejecución en Windows

Esta guía usa **PowerShell** (Inicio → escribe «PowerShell»). Cada bloque indica en qué carpeta ejecutarlo.

## 1. Requisitos

Comprueba qué tienes instalado:

```powershell
node -v      # necesitas v20.9 o superior (recomendado: 22 LTS)
npm -v
py --version # necesitas Python 3.11 o superior
git --version
```

Si falta algo:

- Node.js 22 LTS: https://nodejs.org (instalador «LTS»).
- Python 3.12 o 3.13: https://www.python.org/downloads/ — marca **«Add python.exe to PATH»**.
- Git: https://git-scm.com/download/win

> `py` es el lanzador de Python para Windows. Si no existe, usa `python` en su lugar.

## 2. Backend (FastAPI) — Terminal 1

```powershell
cd C:\ruta\a\tripmind-ai\apps\api

# Entorno virtual: una carpeta .venv con las librerías de este proyecto, aislada del resto del sistema.
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Si aparece *«la ejecución de scripts está deshabilitada en este sistema»*, permite scripts firmados
solo para tu usuario (una vez) y repite la activación:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
.\.venv\Scripts\Activate.ps1
```

Con el entorno activo verás `(.venv)` al inicio de la línea. Instala dependencias, crea tu `.env` y arranca:

```powershell
python -m pip install --upgrade pip
pip install -e ".[dev]"
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```

Comprueba en el navegador:

- http://localhost:8000/api/v1/health → `{"status":"ok", ...}`
- http://localhost:8000/docs → documentación interactiva (puedes probar los endpoints desde ahí)

`--reload` reinicia la API al guardar cambios. Para detenerla: `Ctrl + C`.

## 3. Frontend (Next.js) — Terminal 2

```powershell
cd C:\ruta\a\tripmind-ai\apps\web
npm install
Copy-Item .env.example .env.local
npm run dev
```

Abre http://localhost:3000. Prueba el formulario: con la API encendida verás el resumen validado; si
detienes la API verás el mensaje «No pudimos conectar con el servidor de TripMind».

## 4. Pruebas y comprobaciones

```powershell
# Backend (con .venv activo)
cd apps\api
pytest            # pruebas automáticas
ruff check .      # estilo y errores comunes
ruff format .     # formatea el código

# Frontend
cd apps\web
npm test          # pruebas (Vitest)
npm run lint      # ESLint
npm run typecheck # TypeScript estricto
npm run build     # compilación de producción
```

## 5. Variables de entorno

| Archivo | Variable | Para qué sirve |
| --- | --- | --- |
| `apps/api/.env` | `APP_ENV` | `development` o `production` (en producción se oculta `/docs`). |
| | `CORS_ORIGINS` | Orígenes del navegador permitidos, separados por comas. |
| | `DEFAULT_TIMEZONE` | Zona horaria para decidir qué es «hoy». |
| | `RATE_LIMIT_PER_MINUTE` | POST por minuto e IP. |
| | `OPENAI_API_KEY` | Vacía hasta la Fase 4. |
| `apps/web/.env.local` | `NEXT_PUBLIC_API_URL` | URL de la API. **Visible en el navegador: nunca pongas secretos aquí.** |

### Cómo guardar una clave secreta (por ejemplo, la de OpenAI en la Fase 4)

1. Abre `apps\api\.env` con tu editor (`code apps\api\.env` si usas VS Code).
2. Pega la clave después de `OPENAI_API_KEY=` y guarda.
3. Reinicia la API.

`.env` está en `.gitignore`, así que Git no lo sube. No pegues claves en el chat, en el código ni en
la documentación. Si una clave se filtra, revócala en el panel del proveedor y crea otra.

## 6. Problemas frecuentes

| Síntoma | Solución |
| --- | --- |
| `Port 3000/8000 is already in use` | `netstat -ano \| findstr :8000` muestra el PID; ciérralo con `taskkill /PID <pid> /F` o usa otro puerto. |
| La web dice que no puede conectar con la API | Comprueba que la Terminal 1 sigue abierta y que `NEXT_PUBLIC_API_URL` coincide con el puerto. Reinicia `npm run dev` tras cambiar `.env.local`. |
| Error de CORS en la consola del navegador | Añade el origen exacto de la web (p. ej. `http://localhost:3001`) a `CORS_ORIGINS` y reinicia la API. |
| `uvicorn` no se reconoce | El entorno virtual no está activo: `.\.venv\Scripts\Activate.ps1`. |
| `npm install` muestra «vulnerabilities» | Ver la nota de dependencias en `docs/roadmap.md`. No ejecutes `npm audit fix --force`: degrada Next.js. |
