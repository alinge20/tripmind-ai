"use client";

import { ArrowRight, Building2, Landmark, Mountain, Palmtree, Trees, Waves } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { usePlanner } from "@/features/trip-planner/planner-context";

// Sin fotos por ahora: las imágenes se añadirán cuando tengamos una fuente con licencia clara.
const destinations = [
  { name: "Cartagena", country: "Colombia", tags: "Playa · Historia", icon: Palmtree, tone: "bg-accent-50 text-accent-700" },
  { name: "Medellín", country: "Colombia", tags: "Ciudad · Gastronomía", icon: Building2, tone: "bg-brand-50 text-brand-700" },
  { name: "Cusco", country: "Perú", tags: "Cultura · Montaña", icon: Mountain, tone: "bg-amber-50 text-amber-800" },
  { name: "Ciudad de México", country: "México", tags: "Cultura · Comida", icon: Landmark, tone: "bg-rose-50 text-rose-700" },
  { name: "Florianópolis", country: "Brasil", tags: "Playa · Naturaleza", icon: Waves, tone: "bg-sky-50 text-sky-700" },
  { name: "Eje Cafetero", country: "Colombia", tags: "Naturaleza · Relax", icon: Trees, tone: "bg-emerald-50 text-emerald-700" },
];

export function Destinations() {
  const { startPlanning } = usePlanner();

  return (
    <section id="destinos" aria-labelledby="destinations-title" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="destinations-title"
          eyebrow="Inspiración"
          title="Descubre destinos"
          description="Elige uno para empezar a planificar con el destino ya escrito."
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <li key={destination.name}>
              <button
                type="button"
                onClick={() => startPlanning({ mode: "decided", destination: `${destination.name}, ${destination.country}` })}
                className="group flex w-full items-center gap-4 rounded-[var(--radius-card)] border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md motion-reduce:hover:translate-y-0"
              >
                <span className={`grid size-14 shrink-0 place-items-center rounded-2xl ${destination.tone}`}>
                  <destination.icon aria-hidden className="size-7" />
                </span>
                <span className="flex-1">
                  <span className="block font-semibold text-brand-950">{destination.name}</span>
                  <span className="block text-sm text-slate-500">
                    {destination.country} · {destination.tags}
                  </span>
                </span>
                <ArrowRight aria-hidden className="size-5 text-slate-400 transition group-hover:text-brand-700" />
                <span className="sr-only">Planificar un viaje a {destination.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
