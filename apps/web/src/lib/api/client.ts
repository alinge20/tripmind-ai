import { API_BASE_URL } from "@/lib/config";
import type { ApiErrorDetail, ApiErrorResponse } from "@/types/api";

export type ApiErrorKind = "network" | "timeout" | "validation" | "rate_limited" | "server" | "unknown";

/** Error normalizado: la interfaz solo necesita mirar `kind` para decidir qué mostrar. */
export class ApiError extends Error {
  constructor(
    public readonly kind: ApiErrorKind,
    message: string,
    public readonly status?: number,
    public readonly details: ApiErrorDetail[] = [],
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  timeoutMs?: number;
  baseUrl?: string;
  fetchImpl?: typeof fetch; // inyectable para las pruebas
};

function kindForStatus(status: number): ApiErrorKind {
  if (status === 422 || status === 400) return "validation";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "server";
  return "unknown";
}

async function readErrorBody(response: Response): Promise<ApiErrorResponse | null> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === "object" && "error" in body) return body as ApiErrorResponse;
  } catch {
    // Respuesta sin JSON (por ejemplo un proxy caído): se trata como error genérico.
  }
  return null;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = 15_000, baseUrl = API_BASE_URL, fetchImpl = fetch } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetchImpl(`${baseUrl}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", Accept: "application/json", ...init.headers },
      signal: controller.signal,
    });
  } catch {
    if (controller.signal.aborted) {
      throw new ApiError("timeout", "El servidor tardó demasiado en responder. Inténtalo de nuevo.");
    }
    throw new ApiError(
      "network",
      "No pudimos conectar con el servidor de TripMind. Comprueba que la API esté en marcha.",
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new ApiError(
      kindForStatus(response.status),
      body?.error.message ?? "No se pudo completar la petición.",
      response.status,
      body?.error.details ?? [],
      body?.error.request_id ?? undefined,
    );
  }

  return (await response.json()) as T;
}
