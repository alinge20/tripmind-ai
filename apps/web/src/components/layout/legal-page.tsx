import type { ReactNode } from "react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-bold text-brand-950">{title}</h1>
        <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
          Borrador: este texto es provisional y debe revisarlo un profesional legal antes del lanzamiento.
        </div>
        <div className="mt-8 space-y-4 text-slate-700">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
