import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Benefits } from "@/features/home/benefits";
import { CtaBanner } from "@/features/home/cta-banner";
import { DemoItinerary } from "@/features/home/demo-itinerary";
import { Destinations } from "@/features/home/destinations";
import { Hero } from "@/features/home/hero";
import { HowItWorks } from "@/features/home/how-it-works";
import { PlannerSection } from "@/features/home/planner-section";
import { PlannerProvider } from "@/features/trip-planner/planner-context";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      {/* PlannerProvider comparte el estado del formulario entre el hero, el formulario y los destinos. */}
      <PlannerProvider>
        <main id="contenido">
          <Hero />
          <PlannerSection />
          <HowItWorks />
          <DemoItinerary />
          <Benefits />
          <Destinations />
          <CtaBanner />
        </main>
      </PlannerProvider>
      <SiteFooter />
    </>
  );
}
