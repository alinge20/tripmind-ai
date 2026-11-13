import type { AccommodationType, Climate, Currency, DateFlexibility, Interest, TripType } from "@/types/api";

// Etiquetas en español para los valores (en inglés) que entiende la API.
export const tripTypeOptions: { value: TripType; label: string }[] = [
  { value: "leisure", label: "Descanso / ocio" },
  { value: "romantic", label: "Romántico" },
  { value: "family", label: "En familia" },
  { value: "friends", label: "Con amigos" },
  { value: "adventure", label: "Aventura" },
  { value: "backpacking", label: "Mochilero / económico" },
  { value: "business", label: "Trabajo" },
];

export const flexibilityOptions: { value: DateFlexibility; label: string }[] = [
  { value: "exact", label: "Fechas exactas" },
  { value: "plus_minus_3_days", label: "± 3 días" },
  { value: "flexible_month", label: "Cualquier día del mes" },
];

export const accommodationOptions: { value: AccommodationType; label: string }[] = [
  { value: "any", label: "Me da igual" },
  { value: "hotel", label: "Hotel" },
  { value: "hostel", label: "Hostal" },
  { value: "apartment", label: "Apartamento" },
  { value: "resort", label: "Resort / todo incluido" },
];

export const interestOptions: { value: Interest; label: string }[] = [
  { value: "beach", label: "Playa" },
  { value: "culture", label: "Cultura e historia" },
  { value: "food", label: "Gastronomía" },
  { value: "nature", label: "Naturaleza" },
  { value: "nightlife", label: "Vida nocturna" },
  { value: "shopping", label: "Compras" },
  { value: "adventure", label: "Aventura" },
  { value: "relax", label: "Relax" },
];

export const climateOptions: { value: Climate; label: string }[] = [
  { value: "warm", label: "Cálido" },
  { value: "mild", label: "Templado" },
  { value: "cold", label: "Frío" },
  { value: "any", label: "Me da igual" },
];

export const currencyOptions: { value: Currency; label: string }[] = [
  { value: "COP", label: "COP · Peso colombiano" },
  { value: "USD", label: "USD · Dólar estadounidense" },
];

export function labelFor<T extends string>(options: { value: T; label: string }[], value: T) {
  return options.find((option) => option.value === value)?.label ?? value;
}
