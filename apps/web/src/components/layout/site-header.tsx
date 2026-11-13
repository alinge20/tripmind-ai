import { ButtonLink } from "@/components/ui/button";
import { Logo } from "./logo";

const navLinks = [
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#ejemplo", label: "Ejemplo" },
  { href: "/#destinos", label: "Destinos" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-brand-900"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <ButtonLink href="/#planificar" size="md">
          Planificar viaje
        </ButtonLink>
      </div>
    </header>
  );
}
