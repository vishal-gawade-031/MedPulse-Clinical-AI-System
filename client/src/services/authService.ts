import { api } from "./api";
import { User, PatientProfile } from "../types";

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface MeResponse {
  success: boolean;
  user: User;
  profile?: PatientProfile;
}

export const authService = {
  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role?: "PATIENT" | "ADMIN";
  }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/auth/register", data);
    return res.data;
  },

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/auth/login", credentials);
    return res.data;
  },

  async getMe(): Promise<MeResponse> {
    const res = await api.get<MeResponse>("/auth/me");
    return res.data;
  },
};
