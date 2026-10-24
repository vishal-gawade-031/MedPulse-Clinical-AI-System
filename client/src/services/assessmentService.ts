import { api } from "./api";
import { Assessment, SeverityItem, VitalsData, ClinicalContext, PhotoMetadata } from "../types";

export interface CreateAssessmentPayload {
  symptoms: string[];
  severityData: SeverityItem[];
  vitals?: VitalsData;
  context?: ClinicalContext;
  photoData?: string;
  photoMetadata?: PhotoMetadata;
}

export const assessmentService = {
  async createAssessment(payload: CreateAssessmentPayload): Promise<Assessment> {
    const res = await api.post<{ success: boolean; data: Assessment }>(
      "/assessments",
      payload
    );
    return res.data.data;
  },

  async getPatientAssessments(params?: {
    urgency?: string;
    status?: string;
    search?: string;
  }): Promise<Assessment[]> {
    const res = await api.get<{ success: boolean; data: Assessment[] }>(
      "/assessments",
      { params }
    );
    return res.data.data;
  },

  async getAssessmentById(id: string): Promise<Assessment> {
    const res = await api.get<{ success: boolean; data: Assessment }>(
      `/assessments/${id}`
    );
    return res.data.data;
  },
};
