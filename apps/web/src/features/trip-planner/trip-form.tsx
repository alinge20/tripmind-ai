"use client";

import { AlertCircle, Loader2, MapPinned, Sparkles } from "lucide-react";
import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import type { TripRequestResponse } from "@/types/api";
import { submitTripRequest } from "./api";
import { Field, inputClasses, Select } from "./form-fields";
import {
  accommodationOptions,
  climateOptions,
  currencyOptions,
  flexibilityOptions,
  interestOptions,
  tripTypeOptions,
} from "./options";
import { usePlanner } from "./planner-context";
import { localToday, mapApiField, validateTripForm, type TripFormErrors, type TripFormValues } from "./schema";
import { TripResult } from "./trip-result";

const noopSubscribe = () => () => {};

/**
 * "Hoy" solo se calcula en el navegador. En el servidor la página se pre-renderiza una vez
 * y una fecha calculada allí quedaría congelada; por eso el servidor devuelve undefined.
 */
function useLocalToday() {
  return useSyncExternalStore(noopSubscribe, () => localToday(), () => undefined);
}

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; data: TripRequestResponse }
  | { status: "error"; message: string };

export function TripForm() {
  const { values, setValues } = usePlanner();
  const [errors, setErrors] = useState<TripFormErrors>({});
  const [submit, setSubmit] = useState<SubmitState>({ status: "idle" });
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const today = useLocalToday();
  const discovering = values.mode === "discover";

  function update<K extends keyof TripFormValues>(field: K, value: TripFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    // Al corregir un campo, quitamos su error para no castigar al usuario mientras escribe.
    if (field in errors) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function toggleInterest(interest: TripFormValues["interests"][number]) {
    const next = values.interests.includes(interest)
      ? values.interests.filter((item) => item !== interest)
      : [...values.interests, interest];
    update("interests", next);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateTripForm(values, localToday());
    if (!validation.success) {
      setErrors(validation.errors);
      setSubmit({ status: "idle" });
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    setErrors({});
    setSubmit({ status: "submitting" });
    try {
      const data = await submitTripRequest(validation.payload);
      setSubmit({ status: "success", data });
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch (error) {
      if (error instanceof ApiError) {
        // Los errores de validación del servidor se colocan junto a su campo.
        const fieldErrors: TripFormErrors = {};
        for (const detail of error.details) {
          const field = mapApiField(detail.field);
          if (field) fieldErrors[field] = detail.message;
        }
        setErrors(fieldErrors);
        setSubmit({ status: "error", message: error.message });
      } else {
        setSubmit({ status: "error", message: "Ocurrió un error inesperado. Inténtalo de nuevo." });
      }
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
    }
  }

  const errorCount = Object.values(errors).filter(Boolean).length;
  const submitting = submit.status === "submitting";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
      <form
        noValidate
        onSubmit={handleSubmit}
        aria-describedby="trip-form-intro"
        className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
      >
        <p id="trip-form-intro" className="sr-only">
          Formulario para planificar un viaje. Los campos marcados como opcionales se pueden dejar vacíos.
        </p>

        <fieldset>
          <legend className="text-sm font-semibold text-slate-800">¿Ya sabes a dónde quieres ir?</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            {(
              [
                { value: "decided", label: "Sí, tengo destino", icon: MapPinned },
                { value: "discover", label: "Aún no sé a dónde ir", icon: Sparkles },
              ] as const
            ).map(({ value, label, icon: Icon }) => (
              <label
                key={value}
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-center text-sm font-semibold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-accent-500 ${
                  values.mode === value ? "bg-white text-brand-800 shadow-sm" : "text-slate-600 hover:text-brand-800"
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  value={value}
                  checked={values.mode === value}
                  onChange={() => update("mode", value)}
                  className="sr-only"
                />
                <Icon aria-hidden className="size-4 shrink-0" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {errorCount > 0 || submit.status === "error" ? (
          <div
            ref={errorSummaryRef}
            tabIndex={-1}
            role="alert"
            className="mt-6 flex gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800 ring-1 ring-red-200"
          >
            <AlertCircle aria-hidden className="mt-0.5 size-5 shrink-0" />
            <p>
              {submit.status === "error" ? submit.message : null}
              {submit.status !== "error" && errorCount > 0
                ? `Revisa ${errorCount === 1 ? "el campo marcado" : `los ${errorCount} campos marcados`} antes de continuar.`
                : null}
            </p>
          </div>
        ) : null}

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field id="origin" label="Origen" error={errors.origin} hint="Ciudad o aeropuerto. Ej.: Bogotá (BOG)">
            {(describedBy) => (
              <input
                id="origin"
                name="origin"
                autoComplete="off"
                value={values.origin}
                onChange={(e) => update("origin", e.target.value)}
                aria-invalid={Boolean(errors.origin)}
                aria-describedby={describedBy}
                className={inputClasses(Boolean(errors.origin))}
                required
              />
            )}
          </Field>

          {discovering ? (
            <Field id="preferredClimate" label="Clima que prefieres" error={errors.preferredClimate}>
              {(describedBy) => (
                <Select
                  id="preferredClimate"
                  value={values.preferredClimate}
                  onChange={(e) => update("preferredClimate", e.target.value as TripFormValues["preferredClimate"])}
                  options={[{ value: "", label: "Elige una opción" }, ...climateOptions]}
                  aria-describedby={describedBy}
                  hasError={Boolean(errors.preferredClimate)}
                />
              )}
            </Field>
          ) : (
            <Field id="destination" label="Destino" error={errors.destination} hint="Ciudad, país o región">
              {(describedBy) => (
                <input
                  id="destination"
                  name="destination"
                  autoComplete="off"
                  value={values.destination}
                  onChange={(e) => update("destination", e.target.value)}
                  aria-invalid={Boolean(errors.destination)}
                  aria-describedby={describedBy}
                  className={inputClasses(Boolean(errors.destination))}
                />
              )}
            </Field>
          )}

          <Field id="departureDate" label="Salida" optional error={errors.departureDate}>
            {(describedBy) => (
              <input
                id="departureDate"
                type="date"
                min={today}
                value={values.departureDate}
                onChange={(e) => update("departureDate", e.target.value)}
                aria-invalid={Boolean(errors.departureDate)}
                aria-describedby={describedBy}
                className={inputClasses(Boolean(errors.departureDate))}
              />
            )}
          </Field>

          <Field id="returnDate" label="Regreso" optional error={errors.returnDate}>
            {(describedBy) => (
              <input
                id="returnDate"
                type="date"
                min={values.departureDate || today}
                value={values.returnDate}
                onChange={(e) => update("returnDate", e.target.value)}
                aria-invalid={Boolean(errors.returnDate)}
                aria-describedby={describedBy}
                className={inputClasses(Boolean(errors.returnDate))}
              />
            )}
          </Field>

          <Field id="dateFlexibility" label="Flexibilidad de fechas" error={errors.dateFlexibility}>
            {(describedBy) => (
              <Select
                id="dateFlexibility"
                value={values.dateFlexibility}
                onChange={(e) => update("dateFlexibility", e.target.value as TripFormValues["dateFlexibility"])}
                options={flexibilityOptions}
                aria-describedby={describedBy}
              />
            )}
          </Field>

          <Field
            id="tripLengthDays"
            label="Duración (días)"
            optional
            error={errors.tripLengthDays}
            hint="Útil si aún no tienes fechas"
          >
            {(describedBy) => (
              <input
                id="tripLengthDays"
                inputMode="numeric"
                value={values.tripLengthDays}
                onChange={(e) => update("tripLengthDays", e.target.value)}
                aria-invalid={Boolean(errors.tripLengthDays)}
                aria-describedby={describedBy}
                className={inputClasses(Boolean(errors.tripLengthDays))}
              />
            )}
          </Field>

          <Field id="travelers" label="Viajeros" error={errors.travelers}>
            {(describedBy) => (
              <input
                id="travelers"
                type="number"
                min={1}
                max={20}
                inputMode="numeric"
                value={values.travelers}
                onChange={(e) => update("travelers", e.target.value)}
                aria-invalid={Boolean(errors.travelers)}
                aria-describedby={describedBy}
                className={inputClasses(Boolean(errors.travelers))}
                required
              />
            )}
          </Field>

          <Field id="tripType" label="Tipo de viaje" error={errors.tripType}>
            {(describedBy) => (
              <Select
                id="tripType"
                value={values.tripType}
                onChange={(e) => update("tripType", e.target.value as TripFormValues["tripType"])}
                options={tripTypeOptions}
                aria-describedby={describedBy}
              />
            )}
          </Field>

          <Field id="budgetAmount" label="Presupuesto total" optional error={errors.budgetAmount} hint="Para todo el grupo">
            {(describedBy) => (
              <input
                id="budgetAmount"
                inputMode="decimal"
                placeholder={values.currency === "COP" ? "3.000.000" : "1,500"}
                value={values.budgetAmount}
                onChange={(e) => update("budgetAmount", e.target.value)}
                aria-invalid={Boolean(errors.budgetAmount)}
                aria-describedby={describedBy}
                className={inputClasses(Boolean(errors.budgetAmount))}
              />
            )}
          </Field>

          <Field id="currency" label="Moneda" error={errors.currency}>
            {(describedBy) => (
              <Select
                id="currency"
                value={values.currency}
                onChange={(e) => update("currency", e.target.value as TripFormValues["currency"])}
                options={currencyOptions}
                aria-describedby={describedBy}
              />
            )}
          </Field>

          <Field id="accommodation" label="Alojamiento preferido" error={errors.accommodation} className="sm:col-span-2">
            {(describedBy) => (
              <Select
                id="accommodation"
                value={values.accommodation}
                onChange={(e) => update("accommodation", e.target.value as TripFormValues["accommodation"])}
                options={accommodationOptions}
                aria-describedby={describedBy}
              />
            )}
          </Field>

          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-sm font-semibold text-slate-800">
              Intereses <span className="font-normal text-slate-500">(opcional)</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((option) => {
                const checked = values.interests.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-accent-500 ${
                      checked
                        ? "border-accent-500 bg-accent-50 text-accent-700"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggleInterest(option.value)}
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <Field
            id="notes"
            label="Restricciones o comentarios"
            optional
            error={errors.notes}
            hint={`${values.notes.length}/500 · Ej.: viajo con un bebé, no como carne, movilidad reducida`}
            className="sm:col-span-2"
          >
            {(describedBy) => (
              <textarea
                id="notes"
                rows={3}
                maxLength={500}
                value={values.notes}
                onChange={(e) => update("notes", e.target.value)}
                aria-invalid={Boolean(errors.notes)}
                aria-describedby={describedBy}
                className={inputClasses(Boolean(errors.notes))}
              />
            )}
          </Field>
        </div>

        <Button type="submit" size="lg" className="mt-8 w-full" disabled={submitting} aria-busy={submitting}>
          {submitting ? (
            <>
              <Loader2 aria-hidden className="size-5 animate-spin motion-reduce:animate-none" />
              Validando tu viaje…
            </>
          ) : (
            "Crear mi plan de viaje"
          )}
        </Button>
      </form>

      <div ref={resultRef} tabIndex={-1} aria-live="polite" className="focus:outline-none">
        <TripResult state={submit.status === "success" ? submit.data : null} loading={submitting} />
      </div>
    </div>
  );
}
