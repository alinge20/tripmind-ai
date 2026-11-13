"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { initialTripFormValues, type TripFormValues } from "./schema";

/*
  El estado del formulario vive aquí (y no dentro del formulario) para que otras secciones
  de la página —el buscador del hero o las tarjetas de destinos— puedan rellenarlo.
*/

type PlannerContextValue = {
  values: TripFormValues;
  setValues: React.Dispatch<React.SetStateAction<TripFormValues>>;
  startPlanning: (prefill: Partial<TripFormValues>) => void;
};

const PlannerContext = createContext<PlannerContextValue | null>(null);

export const PLANNER_SECTION_ID = "planificar";

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [values, setValues] = useState<TripFormValues>(initialTripFormValues);

  const startPlanning = useCallback((prefill: Partial<TripFormValues>) => {
    setValues((current) => ({ ...current, ...prefill }));
    document.getElementById(PLANNER_SECTION_ID)?.scrollIntoView({ block: "start" });
    // Llevamos el foco al primer campo para que teclado y lectores de pantalla sigan el flujo.
    requestAnimationFrame(() => document.getElementById("origin")?.focus({ preventScroll: true }));
  }, []);

  const value = useMemo(() => ({ values, setValues, startPlanning }), [values, startPlanning]);
  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner() {
  const context = useContext(PlannerContext);
  if (!context) throw new Error("usePlanner debe usarse dentro de <PlannerProvider>.");
  return context;
}
