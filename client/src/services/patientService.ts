import { api } from "./api";
import { PatientProfile, User } from "../types";

export interface PatientProfileResponse {
  success: boolean;
  data: PatientProfile;
  user: User;
}

export const patientService = {
  async getProfile(): Promise<PatientProfileResponse> {
    const res = await api.get<PatientProfileResponse>("/patients/profile");
    return res.data;
  },

  async updateProfile(data: Partial<PatientProfile> & { firstName?: string; lastName?: string; phone?: string }): Promise<PatientProfile> {
    const res = await api.put<{ success: boolean; data: PatientProfile }>(
      "/patients/profile",
      data
    );
    return res.data.data;
  },
};
