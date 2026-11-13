import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TripMind AI · Planifica tu viaje con inteligencia artificial",
    template: "%s · TripMind AI",
  },
  description:
    "Asistente de viajes que te ayuda a pasar de una idea a un itinerario organizado, con presupuesto claro y opciones para reservar.",
};

export const viewport: Viewport = {
  themeColor: "#12325d",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        {/* Primer elemento enfocable: permite saltar la navegación con el teclado. */}
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-brand-800 focus:shadow"
        >
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
