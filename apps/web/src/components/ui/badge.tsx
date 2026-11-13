import type { ReactNode } from "react";

type Tone = "neutral" | "accent" | "warning" | "brand";

const tones: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  accent: "bg-accent-50 text-accent-700",
  warning: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  brand: "bg-brand-50 text-brand-700",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
