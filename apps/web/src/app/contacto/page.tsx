import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = { title: "Contacto" };

export default function ContactPage() {
  return (
    <LegalPage title="Contacto">
      <p>El canal oficial de contacto todavía no está definido. Lo publicaremos aquí antes del lanzamiento.</p>
    </LegalPage>
  );
}
