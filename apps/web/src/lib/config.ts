// Solo las variables con prefijo NEXT_PUBLIC_ llegan al navegador. Nunca pongas secretos en ellas.
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
