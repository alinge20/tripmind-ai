import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = { title: "Términos de uso" };

export default function TermsPage() {
  return (
    <LegalPage title="Términos de uso">
      <p>
        TripMind AI ofrece recomendaciones de planificación. Las sugerencias generadas no constituyen reservas ni
        garantizan precios, horarios o disponibilidad.
      </p>
      <p>Antes de pagar cualquier servicio, confirma las condiciones directamente con el proveedor.</p>
    </LegalPage>
  );
}
