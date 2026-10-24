import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../services/adminService";
import { DashboardStats } from "../../types";
import { UrgencyBadge } from "../../components/clinical/UrgencyBadge";
import { StatusBadge } from "../../components/clinical/StatusBadge";
import { AssessmentVolumeChart } from "../../components/charts/AssessmentVolumeChart";
import { RiskDonutChart } from "../../components/charts/RiskDonutChart";
import { CommonSymptomsChart } from "../../components/charts/CommonSymptomsChart";
import { ConditionsChart } from "../../components/charts/ConditionsChart";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Users,
  ClipboardList,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  PieChart,
  BarChart3,
  Calendar,
  Building,
} from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    adminService
      .getDashboardStats()
      .then((data) => setStats(data))
      .catch((err) => console.error("Failed to load admin stats:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <Activity className="w-10 h-10 text-clinical-blue animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">
          Aggregating clinical triage telemetry & analytics...
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center text-slate-500">
        Unable to load clinical administration metrics.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-clinical-blue block mb-1">
            Clinical Governance & Analytics Board
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Hospital Triage Operations 
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time population health surveillance, risk stratifications, and clinical review workflows.
          </p>
        </div>

        <Link
          to="/admin/assessments"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <ClipboardList className="w-4 h-4" />
          <span>Open Triage Queue</span>
        </Link>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Submissions
            </span>
            <ClipboardList className="w-4 h-4 text-clinical-blue" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">
              {stats.totalAssessments}
            </div>
            <span className="text-[11px] text-slate-400">All-time assessments</span>
          </div>
        </div>

        <div className="bg-white border border-rose-200 bg-rose-50/20 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              High Risk / Critical
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-rose-700">
              {stats.highRiskCount}
            </div>
            <span className="text-[11px] text-rose-600/80 font-medium">Urgent clinical review</span>
          </div>
        </div>

        <div className="bg-white border border-amber-200 bg-amber-50/20 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Medium Urgency
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-amber-700">
              {stats.mediumRiskCount}
            </div>
            <span className="text-[11px] text-amber-600/80 font-medium">Appointment follow-up</span>
          </div>
        </div>

        <div className="bg-white border border-emerald-200 bg-emerald-50/20 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Low Urgency
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-emerald-700">
              {stats.lowRiskCount}
            </div>
            <span className="text-[11px] text-emerald-600/80 font-medium">Routine self-monitoring</span>
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Registered Patients
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">
              {stats.totalPatients}
            </div>
            <span className="text-[11px] text-slate-400">Active hospital profiles</span>
          </div>
        </div>
      </div>

      {/* Analytics Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assessment Volume Trend Line Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-clinical-blue" />
                Assessment Triage Volume (30-Day Trend)
              </h2>
              <p className="text-[11px] text-slate-400">
                Daily submission volume vs high-urgency cases
              </p>
            </div>
          </div>
          <AssessmentVolumeChart data={stats.volumeData} />
        </div>

        {/* Risk Distribution Donut Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-rose-600" />
                Clinical Risk Stratification Distribution
              </h2>
              <p className="text-[11px] text-slate-400">
                Proportional breakdown of triage classifications
              </p>
            </div>
          </div>
          <RiskDonutChart data={stats.riskDistribution} />
        </div>

        {/* Most Common Symptoms Reported Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-clinical-blue" />
                Most Frequently Reported Clinical Symptoms
              </h2>
              <p className="text-[11px] text-slate-400">
                Top physiological indicators in submitted triage cases
              </p>
            </div>
          </div>
          <CommonSymptomsChart data={stats.symptomStats} />
        </div>

        {/* Most Frequently Predicted Conditions Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-700" />
                Most Frequently Predicted Pathological Conditions
              </h2>
              <p className="text-[11px] text-slate-400">
                Top machine-learning estimated condition diagnoses
              </p>
            </div>
          </div>
          <ConditionsChart data={stats.conditionStats} />
        </div>
      </div>

      {/* Recent Critical Cases Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              Recent High-Risk & Emergency Red-Flag Triage Cases
            </h2>
            <p className="text-xs text-slate-500">
              Immediate physician oversight and clinical follow-up required
            </p>
          </div>
          <Link
            to="/admin/assessments?urgency=High"
            className="text-xs font-bold text-rose-700 hover:underline flex items-center gap-1"
          >
            <span>View all critical cases</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Symptoms</th>
                <th className="py-3 px-4">Top AI Prediction</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {stats.recentCriticalCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No active high-risk cases pending
                  </td>
                </tr>
              ) : (
                stats.recentCriticalCases.map((c) => {
                  const patient = typeof c.userId === "object" ? c.userId : null;
                  return (
                    <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {patient ? `${(patient as any).firstName} ${(patient as any).lastName}` : "Patient"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {patient ? (patient as any).email : ""}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <UrgencyBadge urgency={c.urgency} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
                        {c.symptoms.map((s) => s.replace(/_/g, " ")).join(", ")}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {c.predictions[0]?.disease} ({c.predictions[0]?.confidence}%)
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/admin/assessments/${c._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-clinical-blue hover:bg-clinical-dark text-white rounded text-xs font-bold transition-colors shadow-xs"
                        >
                          Review Case
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
