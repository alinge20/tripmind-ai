import { BadgeCheck, Coins, Route, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

const benefits = [
  { icon: Route, title: "Personalizado de verdad", text: "El plan se adapta a tu ritmo, intereses y restricciones." },
  { icon: Coins, title: "Presupuesto claro", text: "Gastos por categoría y por persona, en COP o USD, sin mezclar monedas." },
  { icon: BadgeCheck, title: "Información honesta", text: "Separamos lo recomendado de lo verificado. Nunca inventamos precios." },
  { icon: ShieldCheck, title: "Tus datos protegidos", text: "Solo tú puedes ver y editar tus viajes guardados." },
];

export function Benefits() {
  return (
    <section aria-labelledby="benefits-title" className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading id="benefits-title" eyebrow="Beneficios" title="Planificar sin estrés" align="center" />
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <li key={benefit.title} className="text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-accent-50 text-accent-700">
                <benefit.icon aria-hidden className="size-6" />
              </span>
              <h3 className="mt-4 font-semibold text-brand-950">{benefit.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{benefit.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
