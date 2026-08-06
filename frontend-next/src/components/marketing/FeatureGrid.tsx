"use client";

import { TrendingUp, Layers, CalendarRange, ShieldCheck, type LucideIcon } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useScrollReveal } from "@/lib/motion/useScrollReveal";

interface Feature {
  icon: LucideIcon;
  glow: "teal" | "violet" | "rose" | "gold";
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: TrendingUp,
    glow: "violet",
    title: "Predictions you can trust",
    description:
      "A recency-weighted model forecasts your next period and fertile window, with a confidence range that widens honestly when your cycle is irregular.",
  },
  {
    icon: Layers,
    glow: "teal",
    title: "Every signal, one timeline",
    description:
      "Periods, symptoms, basal temperature, cervical mucus, and ovulation tests — logged separately, understood together.",
  },
  {
    icon: CalendarRange,
    glow: "gold",
    title: "A calendar that understands phases",
    description:
      "Menstrual, follicular, fertile, luteal — color-coded across the month, derived from your actual history, not a generic 28-day guess.",
  },
  {
    icon: ShieldCheck,
    glow: "rose",
    title: "Your data, always yours",
    description:
      "Export everything to CSV or PDF whenever you want. Delete your account and every entry vanishes — no dark patterns, no retention tricks.",
  },
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const ref = useScrollReveal<HTMLDivElement>({ delay: index * 0.08 });
  const Icon = feature.icon;

  return (
    <div ref={ref}>
      <GlassPanel interactive glow={feature.glow} className="h-full p-7">
        <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-md bg-aurora-rose/8">
          <Icon className="h-5 w-5 text-text-primary" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-medium text-text-primary">{feature.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">{feature.description}</p>
      </GlassPanel>
    </div>
  );
}

export function FeatureGrid() {
  const headingRef = useScrollReveal<HTMLDivElement>();

  return (
    <section id="features" className="relative mx-auto max-w-6xl px-6 py-32">
      <div ref={headingRef} className="mx-auto mb-16 max-w-xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          Built like software, not a spreadsheet
        </h2>
        <p className="mt-4 text-text-secondary">
          Every piece of this app — the prediction engine, the calendar, the charts — was
          designed to earn your trust with your most personal data.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature, i) => (
          <FeatureCard key={feature.title} feature={feature} index={i} />
        ))}
      </div>
    </section>
  );
}
