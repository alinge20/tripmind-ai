# Despliegue seguro

TripMind está preparado para demostración local. Antes de publicar una instancia se deben configurar explícitamente estas variables:

- API: `APP_ENV=production`, `CORS_ORIGINS` con el dominio exacto de la web y `OPENAI_API_KEY` solo en el proveedor de despliegue.
- Web: `NEXT_PUBLIC_API_URL` con la URL HTTPS de la API. Las variables `NEXT_PUBLIC_*` son visibles en el navegador y nunca deben contener secretos.
- Operación: mantener `.env` y `.env.local` fuera de Git, habilitar HTTPS y usar un limitador compartido (Redis o gateway) si se ejecuta más de una instancia.

No publiques una clave de OpenAI, una cadena de conexión o tokens en el repositorio. Revoca inmediatamente cualquier secreto que llegue a un commit.
