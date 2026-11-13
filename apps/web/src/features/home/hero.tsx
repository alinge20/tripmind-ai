"use client";

import { ArrowRight, Search, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { usePlanner } from "@/features/trip-planner/planner-context";

export function Hero() {
  const { startPlanning } = usePlanner();
  const [destination, setDestination] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startPlanning({ mode: "decided", destination: destination.trim() });
  }

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-brand-950 text-white">
      <RouteIllustration />
      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:pb-28">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-accent-100">
          <Sparkles aria-hidden className="size-4" /> Asistente de viajes con IA
        </p>
        <h1 id="hero-title" className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          De una idea a un viaje bien organizado.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-brand-100">
          Cuéntanos a dónde quieres ir, con quién y cuánto quieres gastar. TripMind AI te ayuda a armar el
          itinerario, ordenar el presupuesto y encontrar dónde reservar.
        </p>

        <form
          onSubmit={handleSubmit}
          role="search"
          aria-label="Empezar a planificar"
          className="mt-10 flex max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl sm:flex-row"
        >
          <label htmlFor="hero-destination" className="sr-only">
            ¿A dónde quieres viajar?
          </label>
          <div className="flex flex-1 items-center gap-2 px-3">
            <Search aria-hidden className="size-5 shrink-0 text-slate-400" />
            <input
              id="hero-destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="¿A dónde quieres viajar?"
              className="w-full bg-transparent py-3 text-slate-900 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          <Button type="submit" size="lg">
            Empezar a planificar <ArrowRight aria-hidden className="size-5" />
          </Button>
        </form>

        <button
          type="button"
          onClick={() => startPlanning({ mode: "discover" })}
          className="mt-4 inline-flex items-center gap-1 rounded-lg px-1 text-sm font-semibold text-accent-100 underline-offset-4 hover:underline"
        >
          ¿Aún no sabes a dónde ir? Te ayudamos a elegir <ArrowRight aria-hidden className="size-4" />
        </button>
      </div>
    </section>
  );
}

/** Ilustración decorativa (SVG propio, sin licencias de terceros). */
function RouteIllustration() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute -right-24 top-0 h-full w-[48rem] max-w-none opacity-40 lg:right-0"
      viewBox="0 0 600 500"
      fill="none"
    >
      <circle cx="420" cy="250" r="220" stroke="#2f6bb8" strokeOpacity=".35" />
      <circle cx="420" cy="250" r="150" stroke="#2f6bb8" strokeOpacity=".35" />
      <path
        d="M140 400 C 260 380, 280 220, 400 220 S 540 120, 560 70"
        stroke="#13a89e"
        strokeWidth="3"
        strokeDasharray="8 10"
        strokeLinecap="round"
      />
      <circle cx="140" cy="400" r="9" fill="#13a89e" />
      <circle cx="400" cy="220" r="7" fill="#c6f2ea" />
      <circle cx="560" cy="70" r="11" fill="#13a89e" />
    </svg>
  );
}
