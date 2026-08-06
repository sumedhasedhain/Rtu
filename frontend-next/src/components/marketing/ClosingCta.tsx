"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useScrollReveal } from "@/lib/motion/useScrollReveal";

export function ClosingCta() {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <section className="relative mx-auto max-w-4xl px-6 py-24">
      <div ref={ref}>
        <GlassPanel glow="teal" className="flex flex-col items-center gap-8 px-10 py-16 text-center">
          <div className="flex flex-col gap-3">
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
              Start understanding your cycle today.
            </h2>
            <p className="max-w-md text-balance text-text-secondary">
              Your first prediction is a few logged periods away.
            </p>
          </div>
          <Button size="lg" className="mt-3" asChild>
            <Link href="/register">
              Create your account
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </Button>
        </GlassPanel>
      </div>
    </section>
  );
}
