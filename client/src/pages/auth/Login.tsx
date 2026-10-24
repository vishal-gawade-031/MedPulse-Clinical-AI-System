import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Activity, Lock, Mail, ShieldAlert, ArrowRight, UserCheck } from "lucide-react";

export const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please enter both email and password.", "warning");
      return;
    }

    try {
      setLoading(true);
      const user = await login({ email, password });
      showToast(`Welcome back, ${user.firstName}!`, "success");
      if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid login credentials.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // Demo one-click credentials filler
  const fillDemoAccount = (role: "PATIENT" | "ADMIN") => {
    if (role === "PATIENT") {
      setEmail("patient@hospital.org");
      setPassword("Password123!");
    } else {
      setEmail("admin@hospital.org");
      setPassword("AdminPass123!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-clinical-blue flex items-center justify-center text-white shadow-md">
            <Activity className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          MedPulse Clinical Portal
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 uppercase tracking-wider font-semibold">
          Hospital AI Triage & Disease Prediction System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-clinical-md border border-clinical-border sm:rounded-xl sm:px-10">
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Hospital Portal Email
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. patient@hospital.org"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-clinical-blue focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-clinical-blue focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-clinical-blue hover:bg-clinical-dark focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-clinical-blue disabled:opacity-50 transition-colors"
              >
                {loading ? "Authenticating..." : "Sign in to Clinical Portal"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
              Quick Demo Access (1-Click Fill)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount("PATIENT")}
                className="flex items-center justify-center gap-1.5 py-2 px-3 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-xs font-semibold text-emerald-800 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Patient Demo</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount("ADMIN")}
                className="flex items-center justify-center gap-1.5 py-2 px-3 border border-sky-200 bg-sky-50 hover:bg-sky-100 rounded-lg text-xs font-semibold text-sky-800 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Doctor / Admin</span>
              </button>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 text-center">
              Patient: patient@hospital.org / Password123!<br />
              Admin: admin@hospital.org / AdminPass123!
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{" "}
            <Link
              to="/register"
              className="font-bold text-clinical-blue hover:text-clinical-dark"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
