import type { Money } from "@/types/api";

export function formatMoney({ amount, currency }: Money) {
  // Number() solo se usa para mostrar el valor; los cálculos se hacen en la API con Decimal.
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "COP" ? 0 : 2,
  }).format(Number(amount));
}

export function formatDate(isoDate: string) {
  // Se interpreta como fecha de calendario (sin hora) para evitar desfases por zona horaria.
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
}
