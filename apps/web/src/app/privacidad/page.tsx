import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = { title: "Privacidad" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Política de privacidad">
      <p>
        En esta versión de desarrollo, los datos del formulario se envían a nuestra API solo para validarlos y no se
        almacenan.
      </p>
      <p>
        Cuando se active el registro de usuarios, esta política describirá qué datos guardamos, con qué finalidad y
        cómo ejercer tus derechos según la normativa colombiana de protección de datos (Ley 1581 de 2012).
      </p>
    </LegalPage>
  );
}
