import { apiClient } from "./client";
import type {
  BBTLog,
  CervicalMucusLog,
  OvulationTestLog,
  PeriodEntry,
  Symptom,
  SymptomLog,
} from "../types/api";

function createLogApi<TRead>(resourcePath: string) {
  return {
    list: async (start?: string, end?: string): Promise<TRead[]> => {
      const { data } = await apiClient.get<TRead[]>(resourcePath, { params: { start, end } });
      return data;
    },
    create: async (payload: Record<string, unknown>): Promise<TRead> => {
      const { data } = await apiClient.post<TRead>(resourcePath, payload);
      return data;
    },
    update: async (id: string, payload: Record<string, unknown>): Promise<TRead> => {
      const { data } = await apiClient.put<TRead>(`${resourcePath}/${id}`, payload);
      return data;
    },
    remove: async (id: string): Promise<void> => {
      await apiClient.delete(`${resourcePath}/${id}`);
    },
  };
}

export const periodsApi = createLogApi<PeriodEntry>("/periods");
export const bbtApi = createLogApi<BBTLog>("/bbt");
export const cervicalMucusApi = createLogApi<CervicalMucusLog>("/cervical-mucus");
export const ovulationTestsApi = createLogApi<OvulationTestLog>("/ovulation-tests");
export const symptomLogsApi = createLogApi<SymptomLog>("/symptom-logs");

export async function listSymptomTypes(): Promise<Symptom[]> {
  const { data } = await apiClient.get<Symptom[]>("/symptoms");
  return data;
}
