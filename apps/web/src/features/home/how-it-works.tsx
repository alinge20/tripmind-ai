import { CalendarCheck, MessagesSquare, SlidersHorizontal, Ticket } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

const steps = [
  {
    icon: MessagesSquare,
    title: "Cuéntanos tu idea",
    text: "Destino, fechas, presupuesto o simplemente lo que te apetece. Si falta algo, te lo preguntamos.",
  },
  {
    icon: CalendarCheck,
    title: "Recibe un plan día a día",
    text: "Actividades ordenadas, tiempos estimados y recomendaciones según tus intereses.",
  },
  {
    icon: SlidersHorizontal,
    title: "Ajústalo conversando",
    text: "«Más económico», «añade un día de playa», «quita lo nocturno». El plan cambia solo donde hace falta.",
  },
  {
    icon: Ticket,
    title: "Reserva con proveedores reales",
    text: "Te llevamos a opciones de vuelos y alojamiento de proveedores autorizados para confirmar precio y disponibilidad.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" aria-labelledby="how-title" className="scroll-mt-20 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading id="how-title" eyebrow="Cómo funciona" title="Tu viaje, en cuatro pasos" />
        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-[var(--radius-card)] border border-slate-200 p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <step.icon aria-hidden className="size-5" />
                </span>
                <span className="text-sm font-semibold text-slate-400">Paso {index + 1}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-brand-950">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
