import { apiRequest } from "@/lib/api/client";
import type { TripRequestPayload, TripRequestResponse } from "@/types/api";

export function submitTripRequest(payload: TripRequestPayload) {
  return apiRequest<TripRequestResponse>("/api/v1/trip-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
