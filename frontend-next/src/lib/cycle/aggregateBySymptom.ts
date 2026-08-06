import type { SymptomFrequencyEntry } from "@/types/api";

export function aggregateBySymptom(entries: SymptomFrequencyEntry[]) {
  const bySymptom = new Map<string, Record<string, number | string>>();
  for (const entry of entries) {
    const row = bySymptom.get(entry.symptom_name) ?? { symptom_name: entry.symptom_name };
    row[entry.phase] = entry.count;
    bySymptom.set(entry.symptom_name, row);
  }
  return Array.from(bySymptom.values());
}
