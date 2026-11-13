import { describe, expect, it } from "vitest";
import {
  initialTripFormValues,
  localToday,
  mapApiField,
  normalizeAmount,
  validateTripForm,
  type TripFormValues,
} from "@/features/trip-planner/schema";

const TODAY = "2026-10-15";

function values(overrides: Partial<TripFormValues> = {}): TripFormValues {
  return { ...initialTripFormValues, origin: "Bogotá", destination: "Cartagena", ...overrides };
}

describe("normalizeAmount", () => {
  it("acepta separadores de miles en COP", () => {
    expect(normalizeAmount("3.000.000", "COP")).toBe("3000000");
    expect(normalizeAmount("$ 3,000,000", "COP")).toBe("3000000");
  });

  it("conserva centavos en USD", () => {
    expect(normalizeAmount("1,250.50", "USD")).toBe("1250.50");
  });

  it("devuelve null si está vacío e 'invalid' si no es un número", () => {
    expect(normalizeAmount("  ", "COP")).toBeNull();
    expect(normalizeAmount("mucho", "USD")).toBe("invalid");
    expect(normalizeAmount("12.345", "USD")).toBe("invalid");
  });
});

describe("validateTripForm", () => {
  it("convierte un formulario válido en el payload de la API", () => {
    const result = validateTripForm(
      values({ departureDate: "2026-11-01", returnDate: "2026-11-05", budgetAmount: "3.000.000", interests: ["beach"] }),
      TODAY,
    );
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.payload).toMatchObject({
      origin: "Bogotá",
      destination: "Cartagena",
      departure_date: "2026-11-01",
      return_date: "2026-11-05",
      travelers: 2,
      budget: { amount: "3000000", currency: "COP" },
      interests: ["beach"],
      notes: null,
    });
  });

  it("exige origen", () => {
    const result = validateTripForm(values({ origin: " " }), TODAY);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.origin).toBeDefined();
  });

  it("exige destino solo si el usuario dice que ya lo tiene", () => {
    expect(validateTripForm(values({ destination: "" }), TODAY).success).toBe(false);
    const discover = validateTripForm(values({ mode: "discover", destination: "" }), TODAY);
    expect(discover.success).toBe(true);
    if (discover.success) expect(discover.payload.destination).toBeNull();
  });

  it("rechaza fechas pasadas y regreso antes de salida", () => {
    const past = validateTripForm(values({ departureDate: "2026-10-01" }), TODAY);
    expect(!past.success && past.errors.departureDate).toBeTruthy();
    const inverted = validateTripForm(values({ departureDate: "2026-11-10", returnDate: "2026-11-01" }), TODAY);
    expect(!inverted.success && inverted.errors.returnDate).toBeTruthy();
  });

  it("rechaza viajes de más de 60 días", () => {
    const result = validateTripForm(values({ departureDate: "2026-11-01", returnDate: "2027-01-15" }), TODAY);
    expect(!result.success && result.errors.returnDate).toBeTruthy();
  });

  it.each(["0", "21", "2.5", "dos"])("rechaza %s viajeros", (travelers) => {
    const result = validateTripForm(values({ travelers }), TODAY);
    expect(!result.success && result.errors.travelers).toBeTruthy();
  });

  it("rechaza presupuesto no numérico o cero", () => {
    expect(validateTripForm(values({ budgetAmount: "abc" }), TODAY).success).toBe(false);
    expect(validateTripForm(values({ budgetAmount: "0" }), TODAY).success).toBe(false);
  });
});

describe("helpers", () => {
  it("mapea los campos de error de la API a los del formulario", () => {
    expect(mapApiField("budget.amount")).toBe("budgetAmount");
    expect(mapApiField("departure_date")).toBe("departureDate");
    expect(mapApiField("body")).toBeNull();
  });

  it("calcula la fecha local sin pasar por UTC", () => {
    expect(localToday(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
  });
});
