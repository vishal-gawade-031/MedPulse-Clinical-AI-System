import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Stethoscope,
  FileText,
  ShieldAlert,
} from "lucide-react";

export const AdminLayout: React.FC = () => {
  const location = useLocation();

  const subNavLinks = [
    { label: "Overview Analytics", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Clinical Assessments", path: "/admin/assessments", icon: ClipboardList },
    { label: "Patient Registry", path: "/admin/patients", icon: Users },
    { label: "Hospital Specialists", path: "/admin/doctors", icon: Stethoscope },
    { label: "Audit & Compliance", path: "/admin/audit-logs", icon: FileText },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      {/* Admin Quick Ribbon */}
      <div className="bg-slate-900 text-slate-100 text-xs py-2 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wide uppercase">
              Clinical Administration Console
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300">Live Hospital Triage Node</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span>Hospital Wing: Main Campus</span>
            <span className="hidden sm:inline">Role: Medical Officer / Triage Admin</span>
          </div>
        </div>
      </div>

      {/* Secondary Admin Navigation Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-6 overflow-x-auto py-2.5">
            {subNavLinks.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap px-3 py-1.5 rounded-md transition-colors ${
                    active
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
