import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Activity,
  User as UserIcon,
  LogOut,
  Bell,
  Stethoscope,
  ClipboardList,
  History,
  LayoutDashboard,
  Users,
  ShieldAlert,
  FileText,
  Menu,
  X,
} from "lucide-react";
import { notificationService } from "../../services/notificationService";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    if (user && user.role === "PATIENT") {
      notificationService
        .getNotifications()
        .then((res) => {
          if (res.success) {
            setUnreadCount(res.unreadCount);
          }
        })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  const patientNavLinks = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "New Assessment", path: "/assessment", icon: Stethoscope },
    { label: "History", path: "/history", icon: History },
    { label: "Doctors", path: "/doctors", icon: Users },
    { label: "Profile", path: "/profile", icon: UserIcon },
  ];

  const adminNavLinks = [
    { label: "Triage Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Assessments", path: "/admin/assessments", icon: ClipboardList },
    { label: "Patients", path: "/admin/patients", icon: Users },
    { label: "Doctors", path: "/admin/doctors", icon: Stethoscope },
    { label: "Audit Logs", path: "/admin/audit-logs", icon: FileText },
  ];

  const navLinks = user?.role === "ADMIN" ? adminNavLinks : patientNavLinks;

  return (
    <header className="bg-white border-b border-clinical-border sticky top-0 z-40 shadow-clinical">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Clinical Brand */}
          <div className="flex items-center">
            <Link
              to={user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-clinical-blue flex items-center justify-center text-white shadow-sm">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  MedPulse <span className="text-clinical-blue font-semibold">Clinical AI</span>
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 block -mt-1">
                  Enterprise Hospital Triage
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {user &&
              navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? "bg-clinical-light text-clinical-blue font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
          </nav>

          {/* Right Header: User info, notifications, logout */}
          <div className="flex items-center gap-3">
            {user && user.role === "PATIENT" && (
              <Link
                to="/notifications"
                className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-semibold text-slate-800">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    {user.role === "ADMIN" ? (
                      <span className="text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">
                        Clinician / Admin
                      </span>
                    ) : (
                      <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        Patient
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>

                {/* Mobile hamburger */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 text-sm font-medium text-white bg-clinical-blue hover:bg-clinical-dark rounded-md shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && user && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
                  active
                    ? "bg-clinical-light text-clinical-blue font-semibold"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
