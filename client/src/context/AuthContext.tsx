import React, { createContext, useContext, useState, useEffect } from "react";
import { User, PatientProfile } from "../types";
import { authService } from "../services/authService";

interface AuthContextType {
  user: User | null;
  token: string | null;
  profile: PatientProfile | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role?: "PATIENT" | "ADMIN";
  }) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfileState: (updated: PatientProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("medpulse_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("medpulse_token")
  );
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const curToken = localStorage.getItem("medpulse_token");
    if (!curToken) {
      setLoading(false);
      return;
    }
    try {
      const res = await authService.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        setProfile(res.profile || null);
        localStorage.setItem("medpulse_user", JSON.stringify(res.user));
      }
    } catch (err) {
      console.warn("Session restore failed, logging out...");
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: { email: string; password: string }): Promise<User> => {
    const res = await authService.login(credentials);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem("medpulse_token", res.token);
    localStorage.setItem("medpulse_user", JSON.stringify(res.user));
    await refreshUser();
    return res.user;
  };

  const register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role?: "PATIENT" | "ADMIN";
  }): Promise<User> => {
    const res = await authService.register(data);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem("medpulse_token", res.token);
    localStorage.setItem("medpulse_user", JSON.stringify(res.user));
    await refreshUser();
    return res.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setProfile(null);
    localStorage.removeItem("medpulse_token");
    localStorage.removeItem("medpulse_user");
  };

  const updateProfileState = (updated: PatientProfile) => {
    setProfile(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        profile,
        loading,
        login,
        register,
        logout,
        refreshUser,
        updateProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
