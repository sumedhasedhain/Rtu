"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { GlassPanel, type GlassPanelProps } from "@/components/ui/GlassPanel";
import { fadeRise } from "@/lib/motion/variants";

interface StatCardProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  glow?: GlassPanelProps["glow"];
  delay?: number;
}

export function StatCard({ label, value, sub, glow = "none", delay = 0 }: StatCardProps) {
  return (
    <motion.div initial="hidden" animate="visible" variants={fadeRise} transition={{ delay }}>
      <GlassPanel interactive glow={glow} className="h-full p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">{label}</p>
        <p className="mt-3 font-mono text-3xl font-medium text-text-primary">{value}</p>
        {sub && <p className="mt-1.5 text-sm text-text-secondary">{sub}</p>}
      </GlassPanel>
    </motion.div>
  );
}
