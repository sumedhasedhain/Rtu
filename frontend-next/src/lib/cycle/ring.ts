import { differenceInCalendarDays } from "date-fns";
import type { CyclePhase } from "@/types/api";

export interface RingSegment {
  phase: Exclude<CyclePhase, "unknown">;
  startAngle: number;
  endAngle: number;
}

export interface RingData {
  segments: RingSegment[];
  currentAngle: number;
  cycleLengthDays: number;
}

const DEFAULT_CYCLE_LENGTH_DAYS = 28;

function dayToAngle(day: number, cycleLengthDays: number): number {
  // Day 1 sits at the top (12 o'clock / -90deg in standard SVG angle terms), sweeping
  // clockwise through the cycle.
  return ((day - 1) / cycleLengthDays) * 360;
}

/**
 * Pure geometry for the dashboard's orbital cycle ring: splits a predicted cycle length
 * into menstrual/follicular/fertile/luteal arc segments and locates "today" on the ring.
 * All day numbers are 1-indexed, relative to the cycle's start date.
 */
export function computeRingSegments({
  cycleStart,
  periodLengthDays,
  cycleLengthDays,
  fertileWindowStart,
  fertileWindowEnd,
  today,
}: {
  cycleStart: Date;
  periodLengthDays: number;
  cycleLengthDays: number | null;
  fertileWindowStart: Date | null;
  fertileWindowEnd: Date | null;
  today: Date;
}): RingData {
  const length = cycleLengthDays ?? DEFAULT_CYCLE_LENGTH_DAYS;

  const fertileStartDay = fertileWindowStart
    ? clampDay(differenceInCalendarDays(fertileWindowStart, cycleStart) + 1, length)
    : null;
  const fertileEndDay = fertileWindowEnd
    ? clampDay(differenceInCalendarDays(fertileWindowEnd, cycleStart) + 1, length)
    : null;

  const segments: RingSegment[] = [];
  const menstrualEnd = Math.min(periodLengthDays, length);
  segments.push({ phase: "menstrual", startAngle: 0, endAngle: dayToAngle(menstrualEnd + 1, length) });

  if (fertileStartDay !== null && fertileEndDay !== null) {
    // Clamp so the follicular segment never has negative width if the fertile window
    // (from a still-noisy prediction) overlaps the tail of the period.
    const clampedFertileStart = Math.max(fertileStartDay, menstrualEnd + 1);
    segments.push({
      phase: "follicular",
      startAngle: dayToAngle(menstrualEnd + 1, length),
      endAngle: dayToAngle(clampedFertileStart, length),
    });
    segments.push({
      phase: "fertile",
      startAngle: dayToAngle(clampedFertileStart, length),
      endAngle: dayToAngle(Math.max(fertileEndDay, clampedFertileStart) + 1, length),
    });
    segments.push({
      phase: "luteal",
      startAngle: dayToAngle(Math.max(fertileEndDay, clampedFertileStart) + 1, length),
      endAngle: 360,
    });
  } else {
    segments.push({
      phase: "follicular",
      startAngle: dayToAngle(menstrualEnd + 1, length),
      endAngle: 360,
    });
  }

  const currentDay = clampDay(differenceInCalendarDays(today, cycleStart) + 1, length);

  return { segments, currentAngle: dayToAngle(currentDay, length), cycleLengthDays: length };
}

function clampDay(day: number, cycleLengthDays: number): number {
  return Math.max(1, Math.min(day, cycleLengthDays));
}

export function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

export function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const clampedEnd = endAngle >= 360 ? 359.999 : endAngle;
  const start = polarToCartesian(cx, cy, r, clampedEnd);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = clampedEnd - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}
