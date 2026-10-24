import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

// Layouts
import { PatientLayout } from "./layouts/PatientLayout";
import { AdminLayout } from "./layouts/AdminLayout";

// Auth Pages
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";

// Patient Pages
import { Dashboard } from "./pages/patient/Dashboard";
import { Profile } from "./pages/patient/Profile";
import { AssessmentWizard } from "./pages/patient/AssessmentWizard";
import { AssessmentResult } from "./pages/patient/AssessmentResult";
import { MedicalHistory } from "./pages/patient/MedicalHistory";
import { DoctorDirectory } from "./pages/patient/DoctorDirectory";
import { Notifications } from "./pages/patient/Notifications";

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminAssessments } from "./pages/admin/AdminAssessments";
import { AdminAssessmentDetail } from "./pages/admin/AdminAssessmentDetail";
import { AdminPatients } from "./pages/admin/AdminPatients";
import { AdminDoctors } from "./pages/admin/AdminDoctors";
import { AdminAuditLogs } from "./pages/admin/AdminAuditLogs";

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredRole?: "PATIENT" | "ADMIN";
}> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-clinical-blue animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    if (user.role === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Root index redirect
const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Root Route */}
            <Route path="/" element={<RootRedirect />} />

            {/* Protected Patient Routes */}
            <Route
              element={
                <ProtectedRoute requiredRole="PATIENT">
                  <PatientLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/assessment" element={<AssessmentWizard />} />
              <Route path="/assessment/result/:id" element={<AssessmentResult />} />
              <Route path="/history" element={<MedicalHistory />} />
              <Route path="/history/:id" element={<AssessmentResult />} />
              <Route path="/doctors" element={<DoctorDirectory />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/assessments" element={<AdminAssessments />} />
              <Route path="/admin/assessments/:id" element={<AdminAssessmentDetail />} />
              <Route path="/admin/patients" element={<AdminPatients />} />
              <Route path="/admin/doctors" element={<AdminDoctors />} />
              <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
