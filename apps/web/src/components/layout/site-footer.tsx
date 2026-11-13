import Link from "next/link";
import { Logo } from "./logo";

const legalLinks = [
  { href: "/terminos", label: "Términos de uso" },
  { href: "/privacidad", label: "Privacidad" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-brand-950 text-brand-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Logo inverted />
          <p className="mt-4 text-sm text-brand-200">
            Asistente de planificación de viajes. Los precios y la disponibilidad siempre se confirman con el
            proveedor antes de reservar.
          </p>
        </div>
        <nav aria-label="Legal y contacto">
          <ul className="flex flex-col gap-2 text-sm">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="rounded hover:text-white hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-brand-200 sm:px-6">
          TripMind AI es un nombre provisional. Proyecto en desarrollo.
        </p>
      </div>
    </footer>
  );
}
