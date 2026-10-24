import { api } from "./api";
import { Specialist } from "../types";

export const specialistService = {
  async getAllSpecialists(specialty?: string): Promise<Specialist[]> {
    const res = await api.get<{ success: boolean; data: Specialist[] }>(
      "/specialists",
      { params: { specialty } }
    );
    return res.data.data;
  },
};
