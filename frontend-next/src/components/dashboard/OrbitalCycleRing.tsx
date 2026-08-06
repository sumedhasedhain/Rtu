"use client";

import { motion } from "motion/react";
import { computeRingSegments, describeArc, polarToCartesian } from "@/lib/cycle/ring";
import type { CyclePhase } from "@/types/api";

const PHASE_COLOR: Record<Exclude<CyclePhase, "unknown">, string> = {
  menstrual: "var(--phase-menstrual)",
  follicular: "var(--phase-follicular)",
  fertile: "var(--phase-fertile)",
  luteal: "var(--phase-luteal)",
};

const PHASE_LABEL: Record<CyclePhase, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  fertile: "Fertile window",
  luteal: "Luteal",
  unknown: "—",
};

interface OrbitalCycleRingProps {
  cycleStart: Date;
  periodLengthDays: number;
  cycleLengthDays: number | null;
  fertileWindowStart: Date | null;
  fertileWindowEnd: Date | null;
  today: Date;
  currentPhase: CyclePhase;
  currentCycleDay: number | null;
}

const SIZE = 280;
const CENTER = SIZE / 2;
const RADIUS = 108;
const STROKE = 14;

export function OrbitalCycleRing({
  cycleStart,
  periodLengthDays,
  cycleLengthDays,
  fertileWindowStart,
  fertileWindowEnd,
  today,
  currentPhase,
  currentCycleDay,
}: OrbitalCycleRingProps) {
  const { segments, currentAngle, cycleLengthDays: resolvedLength } = computeRingSegments({
    cycleStart,
    periodLengthDays,
    cycleLengthDays,
    fertileWindowStart,
    fertileWindowEnd,
    today,
  });

  const markerPos = polarToCartesian(CENTER, CENTER, RADIUS, currentAngle);

  return (
    <div className="relative flex flex-col items-center">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="overflow-visible">
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={STROKE}
        />

        {segments.map((segment, i) => (
          <motion.path
            key={`${segment.phase}-${i}`}
            d={describeArc(CENTER, CENTER, RADIUS, segment.startAngle, segment.endAngle)}
            fill="none"
            stroke={PHASE_COLOR[segment.phase]}
            strokeWidth={STROKE}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.85 }}
            transition={{ duration: 1.1, delay: 0.15 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}

        <motion.circle
          cx={markerPos.x}
          cy={markerPos.y}
          r={7}
          fill="var(--void-0)"
          stroke={PHASE_COLOR[currentPhase === "unknown" ? "menstrual" : currentPhase]}
          strokeWidth={3}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1.1, ease: "backOut" }}
        />
        <motion.circle
          cx={markerPos.x}
          cy={markerPos.y}
          r={7}
          fill={PHASE_COLOR[currentPhase === "unknown" ? "menstrual" : currentPhase]}
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 2.4 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 1.3 }}
        />
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="font-mono text-5xl font-medium text-text-primary"
        >
          {currentCycleDay ?? "—"}
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-1 text-xs uppercase tracking-[0.2em] text-text-tertiary"
        >
          Day of {resolvedLength}
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-3 rounded-pill px-3 py-1 text-xs font-medium"
          style={{
            color: PHASE_COLOR[currentPhase === "unknown" ? "menstrual" : currentPhase],
            backgroundColor: `color-mix(in srgb, ${PHASE_COLOR[currentPhase === "unknown" ? "menstrual" : currentPhase]} 15%, transparent)`,
          }}
        >
          {PHASE_LABEL[currentPhase]}
        </motion.span>
      </div>
    </div>
  );
}
