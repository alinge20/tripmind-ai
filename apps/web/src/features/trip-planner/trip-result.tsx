import { CalendarDays, CircleDashed, ClipboardList, Info, Users, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TripRequestResponse } from "@/types/api";
import { formatDate, formatMoney } from "./format";
import { labelFor, tripTypeOptions } from "./options";

const missingFieldLabels: Record<string, string> = {
  budget: "Presupuesto",
  departure_date: "Fechas aproximadas",
  return_date: "Fecha de regreso o duración",
  preferred_climate: "Clima preferido",
  trip_length_days: "Duración del viaje",
};

type TripResultProps = { state: TripRequestResponse | null; loading: boolean };

export function TripResult({ state, loading }: TripResultProps) {
  if (loading) {
    return (
      <div className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-6 sm:p-8" aria-busy="true">
        <p className="sr-only">Validando tu viaje…</p>
        <div className="animate-pulse space-y-4 motion-reduce:animate-none">
          <div className="h-5 w-1/2 rounded bg-slate-200" />
          <div className="h-20 rounded-xl bg-slate-100" />
          <div className="h-20 rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="flex h-full flex-col justify-center rounded-[var(--radius-card)] border border-dashed border-slate-300 bg-white/60 p-6 text-center sm:p-8">
        <ClipboardList aria-hidden className="mx-auto size-10 text-brand-200" />
        <h3 className="mt-4 text-lg font-semibold text-brand-950">Tu resumen aparecerá aquí</h3>
        <p className="mt-2 text-sm text-slate-600">
          Completa el formulario. Validaremos tus datos, calcularemos el presupuesto por persona y te diremos qué
          información falta para armar el itinerario.
        </p>
      </div>
    );
  }

  const { summary, missing_information: missing, ai } = state;

  return (
    <article className="space-y-5 rounded-[var(--radius-card)] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <header>
        <Badge tone="accent">Datos validados por la API</Badge>
        <h3 className="mt-3 text-xl font-bold text-brand-950">
          {summary.origin} → {summary.destination ?? "Destino por descubrir"}
        </h3>
        <p className="mt-1 text-sm text-slate-600">{labelFor(tripTypeOptions, summary.trip_type)}</p>
      </header>

      <dl className="grid gap-3 sm:grid-cols-2">
        <SummaryItem icon={<CalendarDays aria-hidden className="size-4" />} label="Fechas">
          {summary.departure_date ? formatDate(summary.departure_date) : "Sin definir"}
          {summary.return_date ? ` – ${formatDate(summary.return_date)}` : ""}
          {summary.nights !== null ? ` · ${summary.nights} ${summary.nights === 1 ? "noche" : "noches"}` : ""}
        </SummaryItem>
        <SummaryItem icon={<Users aria-hidden className="size-4" />} label="Viajeros">
          {summary.travelers} {summary.travelers === 1 ? "persona" : "personas"}
        </SummaryItem>
      </dl>

      {summary.budget ? (
        <section aria-labelledby="budget-heading" className="rounded-xl bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 id="budget-heading" className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Wallet aria-hidden className="size-4" /> Presupuesto
            </h4>
            <Badge>Valor introducido por ti</Badge>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-slate-500">Total</dt>
              <dd className="font-semibold text-slate-900">{formatMoney(summary.budget.total)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Por persona</dt>
              <dd className="font-semibold text-slate-900">{formatMoney(summary.budget.per_person)}</dd>
            </div>
            {summary.budget.per_person_per_day ? (
              <div>
                <dt className="text-slate-500">Por persona y día</dt>
                <dd className="font-semibold text-slate-900">{formatMoney(summary.budget.per_person_per_day)}</dd>
              </div>
            ) : null}
          </dl>
          <p className="mt-3 text-xs text-slate-500">
            Es una división de tu presupuesto, no una estimación de precios reales.
          </p>
        </section>
      ) : null}

      {missing.length > 0 ? (
        <section aria-labelledby="missing-heading">
          <h4 id="missing-heading" className="text-sm font-semibold text-slate-800">
            Para armar tu itinerario nos falta saber
          </h4>
          <ul className="mt-2 space-y-2">
            {missing.map((item) => (
              <li key={item.field} className="flex gap-2 text-sm text-slate-700">
                <CircleDashed aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-600" />
                <span>
                  <strong className="font-semibold">{missingFieldLabels[item.field] ?? item.field}:</strong> {item.reason}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div role="status" className="flex gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
        <Info aria-hidden className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-semibold">Configuración pendiente</p>
          <p className="mt-1">{ai.message}</p>
          <p className="mt-1">Este pedido todavía no se guarda en tu cuenta.</p>
        </div>
      </div>
    </article>
  );
}

function SummaryItem({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{children}</dd>
    </div>
  );
}
