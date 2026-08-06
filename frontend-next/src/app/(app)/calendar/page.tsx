"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { listCycles } from "@/lib/api/cycles";
import { determinePhase } from "@/lib/cycle/phase";
import { fadeRise } from "@/lib/motion/variants";
import type { Cycle, CyclePhase } from "@/types/api";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const PHASE_STYLE: Record<Exclude<CyclePhase, "unknown">, { dot: string; tone: "rose" | "teal" | "gold" | "violet" }> = {
  menstrual: { dot: "bg-phase-menstrual", tone: "rose" },
  follicular: { dot: "bg-phase-follicular", tone: "teal" },
  fertile: { dot: "bg-phase-fertile", tone: "gold" },
  luteal: { dot: "bg-phase-luteal", tone: "violet" },
};

export default function CalendarPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [monthAnchor, setMonthAnchor] = useState(() => new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    listCycles()
      .then(setCycles)
      .finally(() => setIsLoading(false));
  }, []);

  const days = useMemo(() => {
    const monthStart = startOfMonth(monthAnchor);
    const monthEnd = endOfMonth(monthAnchor);
    return eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(monthEnd) });
  }, [monthAnchor]);

  return (
    <div className="pb-10">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeRise}
        className="mb-6 flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <p className="text-sm text-text-tertiary">Your cycle, by day</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-text-primary">Calendar</h1>
        </div>
        <div className="glass flex items-center gap-1 rounded-md p-1">
          <button
            onClick={() => setMonthAnchor((d) => subMonths(d, 1))}
            className="aurora-ring-focus rounded-sm p-2 text-text-secondary hover:text-text-primary"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-32 text-center text-sm font-medium text-text-primary">
            {format(monthAnchor, "MMMM yyyy")}
          </span>
          <button
            onClick={() => setMonthAnchor((d) => addMonths(d, 1))}
            className="aurora-ring-focus rounded-sm p-2 text-text-secondary hover:text-text-primary"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeRise} transition={{ delay: 0.05 }} className="mb-5 flex flex-wrap gap-2">
        {(Object.entries(PHASE_STYLE) as [Exclude<CyclePhase, "unknown">, typeof PHASE_STYLE[keyof typeof PHASE_STYLE]][]).map(
          ([phase, style]) => (
            <Badge key={phase} tone={style.tone} className="capitalize">
              {phase}
            </Badge>
          ),
        )}
      </motion.div>

      {isLoading ? (
        <Skeleton className="h-[32rem] w-full" />
      ) : (
        <GlassPanel className="p-4 sm:p-6">
          <div className="mb-3 grid grid-cols-7 gap-1.5">
            {WEEKDAY_LABELS.map((label, i) => (
              <div key={i} className="py-1 text-center text-xs font-medium text-text-tertiary">
                {label}
              </div>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={monthAnchor.toISOString()}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-7 gap-1.5"
            >
              {days.map((day) => {
                const inMonth = isSameMonth(day, monthAnchor);
                const phase = determinePhase(day, cycles);
                const today = isToday(day);

                return (
                  <div
                    key={day.toISOString()}
                    className={`relative flex aspect-square flex-col items-center justify-center rounded-sm border transition-colors ${
                      today ? "border-aurora-teal/60" : "border-aurora-rose/8"
                    } ${inMonth ? "bg-aurora-rose/4" : "bg-transparent opacity-30"}`}
                  >
                    <span className={`text-sm ${today ? "font-semibold text-text-primary" : "text-text-secondary"}`}>
                      {format(day, "d")}
                    </span>
                    {phase !== "unknown" && (
                      <span
                        className={`absolute bottom-1.5 h-1.5 w-1.5 rounded-full ${PHASE_STYLE[phase].dot}`}
                      />
                    )}
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </GlassPanel>
      )}

      {!isLoading && cycles.length === 0 && (
        <p className="mt-4 text-center text-sm text-text-tertiary">
          Log your first period to see phase predictions on the calendar.
        </p>
      )}
    </div>
  );
}
