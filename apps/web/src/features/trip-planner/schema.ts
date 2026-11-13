import { z } from "zod";
import type { AccommodationType, Climate, Currency, DateFlexibility, Interest, TripRequestPayload, TripType } from "@/types/api";

/*
  Validación del formulario en el navegador.
  Sirve para dar respuestas inmediatas al usuario; la API vuelve a validar todo,
  porque cualquier petición puede manipularse fuera del navegador.
*/

export const MAX_TRIP_DAYS = 60;
export const MAX_TRAVELERS = 20;

export type PlannerMode = "decided" | "discover";

export type TripFormValues = {
  mode: PlannerMode;
  origin: string;
  destination: string;
  departureDate: string; // "YYYY-MM-DD", formato nativo de <input type="date">
  returnDate: string;
  dateFlexibility: DateFlexibility;
  travelers: string;
  tripType: TripType;
  budgetAmount: string;
  currency: Currency;
  accommodation: AccommodationType;
  interests: Interest[];
  preferredClimate: Climate | "";
  tripLengthDays: string;
  notes: string;
};

export type TripFormField = Exclude<keyof TripFormValues, "mode">;
export type TripFormErrors = Partial<Record<TripFormField, string>>;

export const initialTripFormValues: TripFormValues = {
  mode: "decided",
  origin: "",
  destination: "",
  departureDate: "",
  returnDate: "",
  dateFlexibility: "exact",
  travelers: "2",
  tripType: "leisure",
  budgetAmount: "",
  currency: "COP",
  accommodation: "any",
  interests: [],
  preferredClimate: "",
  tripLengthDays: "",
  notes: "",
};

/**
 * Convierte lo que escribe el usuario en un decimal con punto.
 * COP no usa centavos, así que "3.000.000" o "3,000,000" significan tres millones.
 * En USD el punto es decimal y la coma separa miles: "1,250.50".
 */
export function normalizeAmount(raw: string, currency: Currency): string | null {
  const compact = raw.replace(/[\s$]/g, "");
  if (compact === "") return null;
  const normalized = currency === "COP" ? compact.replace(/[.,]/g, "") : compact.replace(/,/g, "");
  return /^\d+(\.\d{1,2})?$/.test(normalized) ? normalized.replace(/^0+(?=\d)/, "") : "invalid";
}

function daysBetween(start: string, end: string) {
  return Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000);
}

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

export function buildTripFormSchema(today: string) {
  return z
    .object({
      mode: z.enum(["decided", "discover"]),
      origin: z.string().trim().min(2, "Indica tu ciudad o aeropuerto de origen.").max(100, "Máximo 100 caracteres."),
      destination: z.string().trim().max(100, "Máximo 100 caracteres."),
      departureDate: z.string().refine((v) => v === "" || isoDate.test(v), "Fecha no válida."),
      returnDate: z.string().refine((v) => v === "" || isoDate.test(v), "Fecha no válida."),
      dateFlexibility: z.enum(["exact", "plus_minus_3_days", "flexible_month"]),
      travelers: z
        .string()
        .regex(/^\d+$/, "Escribe un número entero.")
        .refine((v) => Number(v) >= 1 && Number(v) <= MAX_TRAVELERS, `Entre 1 y ${MAX_TRAVELERS} viajeros.`),
      tripType: z.enum(["leisure", "romantic", "family", "friends", "adventure", "backpacking", "business"]),
      budgetAmount: z.string(),
      currency: z.enum(["COP", "USD"]),
      accommodation: z.enum(["any", "hotel", "hostel", "apartment", "resort"]),
      interests: z.array(z.enum(["beach", "culture", "food", "nature", "nightlife", "shopping", "adventure", "relax"])).max(8),
      preferredClimate: z.enum(["", "warm", "mild", "cold", "any"]),
      tripLengthDays: z
        .string()
        .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= MAX_TRIP_DAYS), `Entre 1 y ${MAX_TRIP_DAYS} días.`),
      notes: z.string().max(500, "Máximo 500 caracteres."),
    })
    .superRefine((values, ctx) => {
      const fail = (path: TripFormField, message: string) => ctx.addIssue({ code: "custom", path: [path], message });

      if (values.mode === "decided" && values.destination.trim().length < 2) {
        fail("destination", "Escribe el destino o elige «Aún no sé a dónde ir».");
      }
      if (values.departureDate && values.departureDate < today) {
        fail("departureDate", "La fecha de salida no puede estar en el pasado.");
      }
      if (values.returnDate && !values.departureDate) {
        fail("departureDate", "Indica también la fecha de salida.");
      }
      if (values.departureDate && values.returnDate) {
        const days = daysBetween(values.departureDate, values.returnDate);
        if (days < 0) fail("returnDate", "El regreso no puede ser antes de la salida.");
        else if (days > MAX_TRIP_DAYS) fail("returnDate", `Por ahora planificamos viajes de hasta ${MAX_TRIP_DAYS} días.`);
      }
      const amount = normalizeAmount(values.budgetAmount, values.currency);
      if (amount === "invalid") fail("budgetAmount", "Escribe solo números, por ejemplo 3.000.000.");
      else if (amount !== null && Number(amount) <= 0) fail("budgetAmount", "El presupuesto debe ser mayor que cero.");
    });
}

export type TripFormValidation =
  | { success: true; payload: TripRequestPayload }
  | { success: false; errors: TripFormErrors };

export function validateTripForm(values: TripFormValues, today: string): TripFormValidation {
  const result = buildTripFormSchema(today).safeParse(values);
  if (!result.success) {
    const errors: TripFormErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as TripFormField | undefined;
      if (field && !errors[field]) errors[field] = issue.message;
    }
    return { success: false, errors };
  }
  return { success: true, payload: toPayload(result.data) };
}

const emptyToNull = (value: string) => (value.trim() === "" ? null : value.trim());

export function toPayload(values: TripFormValues): TripRequestPayload {
  const discovering = values.mode === "discover";
  const amount = normalizeAmount(values.budgetAmount, values.currency);
  return {
    origin: values.origin.trim(),
    destination: discovering ? null : emptyToNull(values.destination),
    departure_date: emptyToNull(values.departureDate),
    return_date: emptyToNull(values.returnDate),
    date_flexibility: values.dateFlexibility,
    travelers: Number(values.travelers),
    trip_type: values.tripType,
    budget: amount && amount !== "invalid" ? { amount, currency: values.currency } : null,
    accommodation: values.accommodation,
    interests: values.interests,
    preferred_climate: values.preferredClimate === "" ? null : values.preferredClimate,
    trip_length_days: values.tripLengthDays ? Number(values.tripLengthDays) : null,
    notes: emptyToNull(values.notes),
  };
}

/** Traduce los nombres de campo de la API (snake_case) a los del formulario. */
const apiFieldMap: Record<string, TripFormField> = {
  origin: "origin",
  destination: "destination",
  departure_date: "departureDate",
  return_date: "returnDate",
  date_flexibility: "dateFlexibility",
  travelers: "travelers",
  trip_type: "tripType",
  budget: "budgetAmount",
  accommodation: "accommodation",
  interests: "interests",
  preferred_climate: "preferredClimate",
  trip_length_days: "tripLengthDays",
  notes: "notes",
};

export function mapApiField(apiField: string): TripFormField | null {
  return apiFieldMap[apiField.split(".")[0]] ?? null;
}

/** Fecha local del navegador en formato YYYY-MM-DD (no UTC, para no adelantar un día de noche). */
export function localToday(now = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
