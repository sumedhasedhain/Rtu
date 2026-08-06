"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlassTooltip } from "@/components/charts/GlassTooltip";
import { getCycleLengthTrend, getSymptomFrequency } from "@/lib/api/cycles";
import { aggregateBySymptom } from "@/lib/cycle/aggregateBySymptom";
import { fadeRise } from "@/lib/motion/variants";
import type { CycleLengthTrendPoint, SymptomFrequencyEntry } from "@/types/api";
import { LineChart as LineChartIcon } from "lucide-react";

const PHASE_BAR_COLORS: Record<string, string> = {
  menstrual: "var(--phase-menstrual)",
  follicular: "var(--phase-follicular)",
  fertile: "var(--phase-fertile)",
  luteal: "var(--phase-luteal)",
};

export default function TrendsPage() {
  const [trend, setTrend] = useState<CycleLengthTrendPoint[]>([]);
  const [symptomFrequency, setSymptomFrequency] = useState<SymptomFrequencyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCycleLengthTrend(), getSymptomFrequency()])
      .then(([trendData, symptomData]) => {
        setTrend(trendData);
        setSymptomFrequency(symptomData);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const symptomChartData = aggregateBySymptom(symptomFrequency);

  return (
    <div className="pb-10">
      <motion.div initial="hidden" animate="visible" variants={fadeRise} className="mb-6">
        <p className="text-sm text-text-tertiary">Patterns over time</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-text-primary">Trends</h1>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div initial="hidden" animate="visible" variants={fadeRise} transition={{ delay: 0.05 }}>
          <GlassPanel className="p-6">
            <h2 className="mb-1 font-medium text-text-primary">Cycle length over time</h2>
            <p className="mb-6 text-sm text-text-tertiary">Days between each logged period start</p>
            {isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : trend.length === 0 ? (
              <EmptyState
                icon={<LineChartIcon className="h-6 w-6" />}
                title="Not enough completed cycles yet"
                description="Log a couple more periods to see this chart."
              />
            ) : (
              <ResponsiveContainer width="100%" height={288}>
                <LineChart data={trend}>
                  <defs>
                    <linearGradient id="cycleLengthLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="var(--aurora-teal)" />
                      <stop offset="100%" stopColor="var(--aurora-violet)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="cycle_number"
                    tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  />
                  <YAxis
                    tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={32}
                  />
                  <Tooltip content={<GlassTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />
                  <Line
                    type="monotone"
                    dataKey="cycle_length_days"
                    name="length"
                    stroke="url(#cycleLengthLine)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "var(--aurora-violet)", strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </GlassPanel>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeRise} transition={{ delay: 0.1 }}>
          <GlassPanel className="p-6">
            <h2 className="mb-1 font-medium text-text-primary">Symptom frequency by phase</h2>
            <p className="mb-6 text-sm text-text-tertiary">Which phase each symptom tends to show up in</p>
            {isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : symptomChartData.length === 0 ? (
              <EmptyState
                icon={<LineChartIcon className="h-6 w-6" />}
                title="No symptoms logged yet"
                description="Log a few symptoms to see this chart."
              />
            ) : (
              <ResponsiveContainer width="100%" height={288}>
                <BarChart data={symptomChartData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="symptom_name"
                    tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={28}
                  />
                  <Tooltip content={<GlassTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-tertiary)" }} />
                  {Object.entries(PHASE_BAR_COLORS).map(([phase, color]) => (
                    <Bar key={phase} dataKey={phase} name={phase} stackId="phase" fill={color} radius={[3, 3, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </GlassPanel>
        </motion.div>
      </div>
    </div>
  );
}
