import { Clock, FlaskConical, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/section-heading";

/*
  Ejemplo ESTÁTICO para mostrar el formato del producto. No contiene precios, horarios
  de apertura ni disponibilidad: solo ilustra cómo se verá un plan diario.
*/
const demoDays = [
  {
    day: "Día 1",
    title: "Centro histórico",
    activities: [
      { time: "Mañana", name: "Recorrido a pie por el centro histórico", duration: "≈ 3 h", place: "Centro" },
      { time: "Tarde", name: "Almuerzo de cocina local", duration: "≈ 1,5 h", place: "Barrio cercano" },
      { time: "Atardecer", name: "Paseo por las murallas", duration: "≈ 1 h", place: "Murallas" },
    ],
  },
  {
    day: "Día 2",
    title: "Islas y playa",
    activities: [
      { time: "Mañana", name: "Excursión en lancha a las islas", duration: "≈ 6 h", place: "Muelle turístico" },
      { time: "Noche", name: "Cena tranquila frente al mar", duration: "≈ 2 h", place: "Zona costera" },
    ],
  },
];

export function DemoItinerary() {
  return (
    <section id="ejemplo" aria-labelledby="demo-title" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <SectionHeading
            id="demo-title"
            eyebrow="Ejemplo"
            title="Así se verá tu plan"
            description="Cada actividad indica si es una recomendación, una estimación o un dato verificado con su fuente."
          />
          <ul className="mt-6 space-y-3 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <Badge tone="brand">Recomendación</Badge> Sugerencia según tus intereses.
            </li>
            <li className="flex items-center gap-2">
              <Badge tone="neutral">Estimación</Badge> Valor aproximado con su fuente y fecha.
            </li>
            <li className="flex items-center gap-2">
              <Badge tone="accent">Verificado</Badge> Confirmado por un proveedor.
            </li>
          </ul>
        </div>

        <div className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-brand-950">Cartagena · 2 días (ejemplo)</p>
            <Badge tone="warning">
              <FlaskConical aria-hidden className="size-3.5" /> Demostración, no son datos reales
            </Badge>
          </div>
          <ol className="mt-5 space-y-6">
            {demoDays.map((day) => (
              <li key={day.day}>
                <h3 className="text-sm font-semibold text-slate-500">
                  {day.day} · <span className="text-brand-900">{day.title}</span>
                </h3>
                <ul className="mt-3 space-y-3 border-l-2 border-accent-100 pl-4">
                  {day.activities.map((activity) => (
                    <li key={activity.name} className="rounded-xl bg-slate-50 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{activity.name}</p>
                        <Badge tone="brand">Recomendación</Badge>
                      </div>
                      <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock aria-hidden className="size-3.5" /> {activity.time} · {activity.duration}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin aria-hidden className="size-3.5" /> {activity.place}
                        </span>
                      </p>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
