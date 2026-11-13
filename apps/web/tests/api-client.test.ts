import { describe, expect, it } from "vitest";
import { ApiError, apiRequest } from "@/lib/api/client";

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

describe("apiRequest", () => {
  it("devuelve el JSON cuando la respuesta es correcta", async () => {
    const fetchImpl = async () => jsonResponse(200, { status: "ok" });
    await expect(apiRequest("/health", {}, { baseUrl: "http://api", fetchImpl })).resolves.toEqual({ status: "ok" });
  });

  it("convierte un 422 en un ApiError de validación con detalles", async () => {
    const fetchImpl = async () =>
      jsonResponse(422, {
        error: { code: "validation_error", message: "Algunos datos no son válidos.", details: [{ field: "travelers", message: "x" }] },
      });
    const error = await apiRequest("/x", {}, { baseUrl: "http://api", fetchImpl }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).kind).toBe("validation");
    expect((error as ApiError).details).toHaveLength(1);
  });

  it("identifica el límite de peticiones", async () => {
    const fetchImpl = async () => jsonResponse(429, { error: { code: "http_429", message: "Demasiadas peticiones." } });
    const error = (await apiRequest("/x", {}, { baseUrl: "http://api", fetchImpl }).catch((e: unknown) => e)) as ApiError;
    expect(error.kind).toBe("rate_limited");
  });

  it("da un mensaje claro si el servidor no está disponible", async () => {
    const fetchImpl = async () => {
      throw new TypeError("fetch failed");
    };
    const error = (await apiRequest("/x", {}, { baseUrl: "http://api", fetchImpl }).catch((e: unknown) => e)) as ApiError;
    expect(error.kind).toBe("network");
    expect(error.message).toMatch(/API/);
  });

  it("corta la petición si supera el tiempo máximo", async () => {
    const fetchImpl = (_: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
      });
    const error = (await apiRequest("/x", {}, { baseUrl: "http://api", fetchImpl, timeoutMs: 10 }).catch(
      (e: unknown) => e,
    )) as ApiError;
    expect(error.kind).toBe("timeout");
  });
});
