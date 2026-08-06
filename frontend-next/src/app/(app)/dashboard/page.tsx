"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { parseISO } from "date-fns";
import { motion } from "motion/react";
import { Droplet, CalendarClock, Activity, Sparkles } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { OrbitalCycleRing } from "@/components/dashboard/OrbitalCycleRing";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  getDashboardSummary,
  getFertileWindowPrediction,
  getNextPeriodPrediction,
  listCycles,
} from "@/lib/api/cycles";
import { useAuth } from "@/lib/auth/useAuth";
import { fadeRise } from "@/lib/motion/variants";
import type {
  Cycle,
  DashboardSummary,
  FertileWindowPrediction,
  NextPeriodPrediction,
} from "@/types/api";

const CONFIDENCE_TONE = { high: "success", medium: "gold", low: "neutral" } as const;

const REGULARITY_LABEL: Record<string, string> = {
  regular: "Regular",
  irregular: "Irregular",
  insufficient_data: "Building your history",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [nextPeriod, setNextPeriod] = useState<NextPeriodPrediction | null>(null);
  const [fertileWindow, setFertileWindow] = useState<FertileWindowPrediction | null>(null);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getDashboardSummary(), getNextPeriodPrediction(), getFertileWindowPrediction(), listCycles()])
      .then(([summaryData, nextPeriodData, fertileWindowData, cyclesData]) => {
        setSummary(summaryData);
        setNextPeriod(nextPeriodData);
        setFertileWindow(fertileWindowData);
        setCycles(cyclesData);
      })
      .catch(() => setError("Couldn't load your dashboard. Try refreshing."))
      .finally(() => setIsLoading(false));
  }, []);

  const firstName = user?.email.split("@")[0];
  const currentCycle = cycles.at(-1);

  return (
    <div className="pb-10">
      <motion.div initial="hidden" animate="visible" variants={fadeRise} className="mb-8">
        <p className="text-sm text-text-tertiary">Welcome back{firstName ? `, ${firstName}` : ""}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-text-primary">
          Your dashboard
        </h1>
      </motion.div>

      {error && (
        <div className="mb-6 rounded-md border border-state-danger/30 bg-state-danger/10 px-4 py-3 text-sm text-state-danger">
          {error}
        </div>
      )}

      {isLoading ? (
        <DashboardSkeleton />
      ) : !currentCycle || !summary ? (
        <EmptyState
          icon={<Droplet className="h-6 w-6" />}
          title="Log your first period to get started"
          description="Once you've logged a period, Rtu starts learning your rhythm and can predict what's next."
          action={
            <Button asChild>
              <Link href="/log">Log a period</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <GlassPanel glow="violet" className="flex flex-col items-center justify-center p-8 lg:col-span-2">
            <OrbitalCycleRing
              cycleStart={parseISO(currentCycle.start_date)}
              periodLengthDays={currentCycle.period_length_days}
              cycleLengthDays={
                nextPeriod?.average_cycle_length_days
                  ? Math.round(nextPeriod.average_cycle_length_days)
                  : null
              }
              fertileWindowStart={
                fertileWindow?.fertile_window_start ? parseISO(fertileWindow.fertile_window_start) : null
              }
              fertileWindowEnd={
                fertileWindow?.fertile_window_end ? parseISO(fertileWindow.fertile_window_end) : null
              }
              today={new Date()}
              currentPhase={summary.current_phase}
              currentCycleDay={summary.current_cycle_day}
            />
          </GlassPanel>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-3">
            <StatCard
              label="Days until next period"
              value={summary.days_until_next_period ?? "—"}
              sub={nextPeriod?.predicted_date ? `Predicted ${nextPeriod.predicted_date}` : "Not enough data yet"}
              glow="rose"
              delay={0.05}
            />
            <StatCard
              label="Prediction confidence"
              value={
                <Badge tone={CONFIDENCE_TONE[nextPeriod?.confidence_level ?? "low"]} dot>
                  {nextPeriod?.confidence_level ?? "low"}
                </Badge>
              }
              sub={
                nextPeriod?.confidence_range
                  ? `${nextPeriod.confidence_range.earliest} – ${nextPeriod.confidence_range.latest}`
                  : undefined
              }
              delay={0.1}
            />
            <StatCard
              label="Cycle regularity"
              value={REGULARITY_LABEL[summary.cycle_regularity]}
              sub={`Based on ${nextPeriod?.based_on_cycles ?? 0} completed cycle${nextPeriod?.based_on_cycles === 1 ? "" : "s"}`}
              glow="teal"
              delay={0.15}
            />
            <StatCard
              label="Fertile window"
              value={
                fertileWindow?.fertile_window_start
                  ? `${fertileWindow.fertile_window_start} → ${fertileWindow.fertile_window_end}`
                  : "—"
              }
              sub={fertileWindow?.ovulation_date ? `Ovulation ~${fertileWindow.ovulation_date}` : undefined}
              glow="gold"
              delay={0.2}
            />

            {nextPeriod?.message && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeRise}
                transition={{ delay: 0.25 }}
                className="sm:col-span-2"
              >
                <GlassPanel className="flex items-start gap-3 p-5">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-aurora-teal" />
                  <p className="text-sm text-text-secondary">{nextPeriod.message}</p>
                </GlassPanel>
              </motion.div>
            )}
          </div>
        </div>
      )}

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeRise}
        transition={{ delay: 0.3 }}
        className="mt-8 flex flex-wrap gap-3"
      >
        <Button variant="glass" asChild>
          <Link href="/log">
            <Droplet className="h-4 w-4" />
            Log an entry
          </Link>
        </Button>
        <Button variant="glass" asChild>
          <Link href="/calendar">
            <CalendarClock className="h-4 w-4" />
            View calendar
          </Link>
        </Button>
        <Button variant="glass" asChild>
          <Link href="/trends">
            <Activity className="h-4 w-4" />
            See trends
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <Skeleton className="h-80 lg:col-span-2" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  );
}
