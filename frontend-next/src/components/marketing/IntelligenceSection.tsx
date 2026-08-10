"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { Badge } from "@/components/ui/Badge";
import { useScrollReveal } from "@/lib/motion/useScrollReveal";

export function IntelligenceSection() {
  const copyRef = useScrollReveal<HTMLDivElement>();
  const cardRef = useScrollReveal<HTMLDivElement>({ delay: 0.15, y: 60 });

  return (
    <section id="intelligence" className="relative mx-auto max-w-6xl px-6 py-32">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <div ref={copyRef}>
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-aurora-teal">
            The prediction engine
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            How predictions are calculated
          </h2>
          <p className="mt-5 text-text-secondary leading-relaxed">
            Most trackers assume a flat 28-day cycle. Rtu weights your most recent
            cycles more heavily, derives a real standard deviation from your history,
            and shows a confidence range that reflects it — narrow when you&rsquo;re
            consistent, wide when you&rsquo;re not, and honest about which is true.
          </p>
          <dl className="mt-8 space-y-5">
            {[
              ["Recency-weighted average", "Recent cycles count more than old ones."],
              ["Statistical confidence range", "Not a guess — a range derived from variance."],
              ["Phase-aware, not date-aware", "Menstrual, follicular, fertile, luteal — computed."],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-4">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-aurora-teal to-aurora-violet" />
                <div>
                  <dt className="font-medium text-text-primary">{title}</dt>
                  <dd className="text-sm text-text-secondary">{desc}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <div ref={cardRef}>
          <GlassPanel interactive glow="violet" className="p-8">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Next period prediction</span>
              <Badge tone="teal" dot>
                High confidence
              </Badge>
            </div>
            <p className="mt-6 font-mono text-4xl font-medium text-text-primary">Apr 23</p>
            <p className="mt-1 text-sm text-text-tertiary">± 1 day · based on 3 cycles</p>

            <div className="mt-8 h-2 rounded-pill bg-void-3">
              <div className="h-full w-[86%] rounded-pill bg-gradient-to-r from-aurora-teal via-aurora-violet to-aurora-rose" />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[
                ["28.2", "avg length"],
                ["0.8", "std dev"],
                ["regular", "status"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-md bg-aurora-rose/6 py-3">
                  <p className="font-mono text-lg text-text-primary">{value}</p>
                  <p className="text-[11px] uppercase tracking-wide text-text-tertiary">{label}</p>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </section>
  );
}
