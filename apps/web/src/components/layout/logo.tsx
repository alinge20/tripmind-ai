import { Compass } from "lucide-react";
import Link from "next/link";

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2 rounded-lg" aria-label="TripMind AI, ir al inicio">
      <span className="grid size-9 place-items-center rounded-xl bg-brand-700 text-white">
        <Compass aria-hidden className="size-5" />
      </span>
      <span className={`text-lg font-bold tracking-tight ${inverted ? "text-white" : "text-brand-950"}`}>
        TripMind <span className="text-accent-500">AI</span>
      </span>
    </Link>
  );
}
