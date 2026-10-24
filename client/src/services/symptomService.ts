import { api } from "./api";
import { Symptom } from "../types";

export const symptomService = {
  async getAllSymptoms(params?: {
    category?: string;
    search?: string;
  }): Promise<Symptom[]> {
    const res = await api.get<{ success: boolean; data: Symptom[] }>("/symptoms", {
      params,
    });
    return res.data.data;
  },
};
