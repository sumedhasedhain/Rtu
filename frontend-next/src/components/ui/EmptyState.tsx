"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { fadeRise } from "@/lib/motion/variants";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeRise}
      className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-aurora-rose/20 px-6 py-16 text-center"
    >
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-aurora-teal/15 via-aurora-violet/15 to-aurora-rose/15 text-aurora-violet">
        <span className="absolute inset-0 rounded-full animate-glow-pulse bg-aurora-violet/10 blur-xl" />
        <span className="relative">{icon}</span>
      </div>
      <div>
        <p className="font-medium text-text-primary">{title}</p>
        {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
      </div>
      {action}
    </motion.div>
  );
}
