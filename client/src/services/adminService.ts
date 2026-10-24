import { api } from "./api";
import { DashboardStats, Assessment, User, AuditLogItem } from "../types";

export interface PaginatedAssessmentsResponse {
  success: boolean;
  total: number;
  page: number;
  totalPages: number;
  data: Assessment[];
}

export interface PaginatedAuditLogsResponse {
  success: boolean;
  total: number;
  page: number;
  totalPages: number;
  data: AuditLogItem[];
}

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await api.get<{ success: boolean; data: DashboardStats }>(
      "/admin/dashboard"
    );
    return res.data.data;
  },

  async getAllAssessments(params?: {
    urgency?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedAssessmentsResponse> {
    const res = await api.get<PaginatedAssessmentsResponse>(
      "/admin/assessments",
      { params }
    );
    return res.data;
  },

  async getAssessmentById(id: string): Promise<Assessment> {
    const res = await api.get<{ success: boolean; data: Assessment }>(
      `/admin/assessments/${id}`
    );
    return res.data.data;
  },

  async updateAssessmentStatus(
    id: string,
    status: string,
    doctorNotes?: string
  ): Promise<Assessment> {
    const res = await api.patch<{ success: boolean; data: Assessment }>(
      `/admin/assessments/${id}/status`,
      { status, doctorNotes }
    );
    return res.data.data;
  },

  async addDoctorNotes(id: string, doctorNotes: string, status?: string): Promise<Assessment> {
    const res = await api.post<{ success: boolean; data: Assessment }>(
      `/admin/assessments/${id}/notes`,
      { doctorNotes, status }
    );
    return res.data.data;
  },

  async getPatients(): Promise<any[]> {
    const res = await api.get<{ success: boolean; data: any[] }>(
      "/admin/patients"
    );
    return res.data.data;
  },

  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedAuditLogsResponse> {
    const res = await api.get<PaginatedAuditLogsResponse>("/admin/audit-logs", {
      params,
    });
    return res.data;
  },
};
