// Mirrors backend/app/schemas/*.py

export interface User {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export type FlowIntensity = "spotting" | "light" | "medium" | "heavy";

export interface PeriodEntry {
  id: string;
  date: string;
  flow_intensity: FlowIntensity;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type SymptomCategory = "physical" | "emotional";

export interface Symptom {
  id: string;
  name: string;
  category: SymptomCategory;
}

export interface SymptomLog {
  id: string;
  date: string;
  symptom_id: string;
  severity: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BBTLog {
  id: string;
  date: string;
  temperature_celsius: number;
  time_recorded: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type CervicalMucusType = "dry" | "sticky" | "creamy" | "watery" | "egg_white";

export interface CervicalMucusLog {
  id: string;
  date: string;
  type: CervicalMucusType;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type OvulationTestResult = "negative" | "positive" | "peak";

export interface OvulationTestLog {
  id: string;
  date: string;
  result: OvulationTestResult;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Cycle {
  cycle_number: number;
  start_date: string;
  end_date: string | null;
  period_length_days: number;
  cycle_length_days: number | null;
  is_ongoing: boolean;
  is_irregular: boolean;
}

export type ConfidenceLevel = "low" | "medium" | "high";

export interface ConfidenceRange {
  earliest: string;
  latest: string;
}

export interface NextPeriodPrediction {
  predicted_date: string | null;
  confidence_range: ConfidenceRange | null;
  confidence_level: ConfidenceLevel;
  based_on_cycles: number;
  average_cycle_length_days: number | null;
  message: string | null;
}

export interface FertileWindowPrediction {
  ovulation_date: string | null;
  fertile_window_start: string | null;
  fertile_window_end: string | null;
  confidence_level: ConfidenceLevel;
  based_on_cycles: number;
  message: string | null;
}

export interface CycleLengthTrendPoint {
  cycle_number: number;
  start_date: string;
  cycle_length_days: number;
}

export interface SymptomFrequencyEntry {
  symptom_name: string;
  phase: string;
  count: number;
}

export type CyclePhase = "menstrual" | "follicular" | "fertile" | "luteal" | "unknown";
export type CycleRegularity = "regular" | "irregular" | "insufficient_data";

export interface DashboardSummary {
  today: string;
  current_cycle_day: number | null;
  current_phase: CyclePhase;
  is_on_period: boolean;
  last_period_start: string | null;
  predicted_next_period_date: string | null;
  days_until_next_period: number | null;
  cycle_regularity: CycleRegularity;
}
