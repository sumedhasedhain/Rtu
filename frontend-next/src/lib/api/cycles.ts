import { apiClient } from "./client";
import type {
  Cycle,
  CycleLengthTrendPoint,
  DashboardSummary,
  FertileWindowPrediction,
  NextPeriodPrediction,
  SymptomFrequencyEntry,
} from "@/types/api";

export async function listCycles(): Promise<Cycle[]> {
  const { data } = await apiClient.get<Cycle[]>("/cycles");
  return data;
}

export async function getNextPeriodPrediction(): Promise<NextPeriodPrediction> {
  const { data } = await apiClient.get<NextPeriodPrediction>("/predictions/next-period");
  return data;
}

export async function getFertileWindowPrediction(): Promise<FertileWindowPrediction> {
  const { data } = await apiClient.get<FertileWindowPrediction>("/predictions/fertile-window");
  return data;
}

export async function getCycleLengthTrend(): Promise<CycleLengthTrendPoint[]> {
  const { data } = await apiClient.get<CycleLengthTrendPoint[]>("/insights/cycle-length-trend");
  return data;
}

export async function getSymptomFrequency(phase?: string): Promise<SymptomFrequencyEntry[]> {
  const { data } = await apiClient.get<SymptomFrequencyEntry[]>("/insights/symptom-frequency", {
    params: { phase },
  });
  return data;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await apiClient.get<DashboardSummary>("/dashboard/summary");
  return data;
}

export async function downloadExport(format: "csv" | "pdf"): Promise<void> {
  const response = await apiClient.get(`/export/${format}`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = `cycle_tracker_export.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function deleteAccount(): Promise<void> {
  await apiClient.delete("/account");
}
