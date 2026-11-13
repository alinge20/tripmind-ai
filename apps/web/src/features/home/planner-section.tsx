import { SectionHeading } from "@/components/ui/section-heading";
import { PLANNER_SECTION_ID } from "@/features/trip-planner/planner-context";
import { TripForm } from "@/features/trip-planner/trip-form";

export function PlannerSection() {
  return (
    <section id={PLANNER_SECTION_ID} aria-labelledby="planner-title" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="planner-title"
          eyebrow="Planifica"
          title="Cuéntanos sobre tu viaje"
          description="Solo el origen y el número de viajeros son obligatorios. Cuanto más nos cuentes, mejor será tu plan."
        />
        <div className="mt-10">
          <TripForm />
        </div>
      </div>
    </section>
  );
}
