/*
  Contratos de la API (deben coincidir con apps/api/app/schemas).
  Los importes viajan como string para no perder precisión decimal.
*/

export type Currency = "COP" | "USD";
export type TripType = "leisure" | "romantic" | "family" | "friends" | "adventure" | "backpacking" | "business";
export type DateFlexibility = "exact" | "plus_minus_3_days" | "flexible_month";
export type AccommodationType = "any" | "hotel" | "hostel" | "apartment" | "resort";
export type Interest = "beach" | "culture" | "food" | "nature" | "nightlife" | "shopping" | "adventure" | "relax";
export type Climate = "warm" | "mild" | "cold" | "any";

export type Money = { amount: string; currency: Currency };

export type TripRequestPayload = {
  origin: string;
  destination: string | null;
  departure_date: string | null;
  return_date: string | null;
  date_flexibility: DateFlexibility;
  travelers: number;
  trip_type: TripType;
  budget: Money | null;
  accommodation: AccommodationType;
  interests: Interest[];
  preferred_climate: Climate | null;
  trip_length_days: number | null;
  notes: string | null;
};

export type TripRequestResponse = {
  request_id: string;
  summary: {
    origin: string;
    destination: string | null;
    destination_decided: boolean;
    departure_date: string | null;
    return_date: string | null;
    nights: number | null;
    travelers: number;
    trip_type: TripType;
    budget: {
      total: Money;
      per_person: Money;
      per_person_per_day: Money | null;
      source: "user_input";
    } | null;
  };
  missing_information: { field: string; reason: string }[];
  ai: { status: "not_configured" | "not_implemented"; message: string };
  persisted: false;
};

export type ApiErrorDetail = { field: string; message: string };

export type ApiErrorResponse = {
  error: { code: string; message: string; request_id?: string | null; details?: ApiErrorDetail[] };
};
