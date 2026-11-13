import { ButtonLink } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section aria-labelledby="cta-title" className="px-4 pb-16 sm:px-6 sm:pb-24">
      <div className="mx-auto max-w-6xl rounded-[2rem] bg-brand-800 px-6 py-12 text-center text-white sm:px-12 sm:py-16">
        <h2 id="cta-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
          ¿Listo para tu próximo viaje?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-brand-100">
          Empieza con lo que sepas. TripMind AI te ayuda a completar el resto.
        </p>
        <ButtonLink href="/#planificar" variant="light" size="lg" className="mt-8">
          Comenzar a planificar
        </ButtonLink>
      </div>
    </section>
  );
}
