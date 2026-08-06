import { Hero } from "@/components/marketing/Hero";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { IntelligenceSection } from "@/components/marketing/IntelligenceSection";
import { ClosingCta } from "@/components/marketing/ClosingCta";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <FeatureGrid />
      <IntelligenceSection />
      <ClosingCta />
    </>
  );
}
