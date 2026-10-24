import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { assessmentService } from "../../services/assessmentService";
import { Assessment } from "../../types";
import { UrgencyBadge } from "../../components/clinical/UrgencyBadge";
import { StatusBadge } from "../../components/clinical/StatusBadge";
import {
  Stethoscope,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  User,
  Heart,
  Calendar,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    assessmentService
      .getPatientAssessments()
      .then((data) => {
        setAssessments(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const latestAssessment = assessments[0];

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6">
      {/* Patient Welcome Header */}
      <div className="bg-white border border-clinical-border rounded-xl p-6 shadow-clinical flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-clinical-blue block mb-1">
            Clinical Patient Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {getGreeting()},{" "}
            <span className="text-clinical-blue">{user?.firstName || "Patient"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access AI-assisted triage insights, review historical assessments, or initiate a new diagnostic evaluation.
          </p>
        </div>

        {/* Main CTA */}
        <Link
          to="/assessment"
          className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-clinical-blue hover:bg-clinical-dark text-white font-bold rounded-xl shadow-clinical-md hover:shadow-clinical-lg transition-all transform hover:-translate-y-0.5"
        >
          <Stethoscope className="w-5 h-5" />
          <span>Start New Symptom Assessment</span>
        </Link>
      </div>

      {/* Clinical Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Latest Condition Estimate */}
        <div className="bg-white border border-clinical-border rounded-xl p-4 shadow-clinical">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Latest Evaluation
            </span>
            <Sparkles className="w-4 h-4 text-clinical-blue" />
          </div>
          <div className="mt-2.5">
            <div className="text-lg font-bold text-slate-900 truncate">
              {latestAssessment ? latestAssessment.predictions[0]?.disease : "No assessments yet"}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {latestAssessment
                ? `Estimated confidence: ${latestAssessment.predictions[0]?.confidence}%`
                : "Initiate your first evaluation"}
            </div>
          </div>
        </div>

        {/* Current Risk Level */}
        <div className="bg-white border border-clinical-border rounded-xl p-4 shadow-clinical">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Current Triage Urgency
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2.5">
            {latestAssessment ? (
              <div className="flex items-center gap-2">
                <UrgencyBadge urgency={latestAssessment.urgency} size="sm" />
              </div>
            ) : (
              <span className="text-sm font-semibold text-slate-400">Baseline</span>
            )}
            <div className="text-xs text-slate-500 mt-1">
              {latestAssessment
                ? latestAssessment.isRedFlag
                  ? "Emergency indicators flagged"
                  : "Clinical urgency index"
                : "No active risk records"}
            </div>
          </div>
        </div>

        {/* Last Assessment Date */}
        <div className="bg-white border border-clinical-border rounded-xl p-4 shadow-clinical">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Last Evaluated
            </span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2.5">
            <div className="text-lg font-bold text-slate-900">
              {latestAssessment
                ? new Date(latestAssessment.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Never"}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {latestAssessment
                ? new Date(latestAssessment.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Available 24/7"}
            </div>
          </div>
        </div>

        {/* Recommended Specialty */}
        <div className="bg-white border border-clinical-border rounded-xl p-4 shadow-clinical">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Recommended Specialty
            </span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2.5">
            <div className="text-lg font-bold text-slate-900 truncate">
              {latestAssessment ? latestAssessment.specialty : "General Medicine"}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              <Link to="/doctors" className="text-clinical-blue hover:underline">
                View hospital specialists →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Assessments List */}
        <div className="lg:col-span-2 bg-white border border-clinical-border rounded-xl shadow-clinical p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent Clinical Assessments
              </h2>
              <p className="text-xs text-slate-500">
                Chronological list of your symptom evaluations
              </p>
            </div>
            <Link
              to="/history"
              className="text-xs font-bold text-clinical-blue hover:text-clinical-dark flex items-center gap-1"
            >
              <span>View all ({assessments.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : assessments.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
              <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No assessments found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                You have not run any symptom evaluations yet. Start your first triage assessment today.
              </p>
              <Link
                to="/assessment"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-clinical-blue text-white rounded-lg text-xs font-bold"
              >
                Start Assessment
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {assessments.slice(0, 4).map((item) => (
                <Link
                  key={item._id}
                  to={`/assessment/result/${item._id}`}
                  className="block p-3.5 rounded-lg border border-slate-200 hover:border-clinical-blue hover:bg-slate-50/70 transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 group-hover:text-clinical-blue transition-colors">
                          {item.predictions[0]?.disease}
                        </span>
                        <UrgencyBadge urgency={item.urgency} size="sm" />
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>
                          {item.symptoms.length} symptom{item.symptoms.length !== 1 ? "s" : ""}:{" "}
                          <span className="text-slate-700 font-medium">
                            {item.symptoms.slice(0, 3).join(", ").replace(/_/g, " ")}
                            {item.symptoms.length > 3 ? "..." : ""}
                          </span>
                        </span>
                        <span>•</span>
                        <span>Specialty: {item.specialty}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right self-end sm:self-auto">
                      <span className="text-xs text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-clinical-blue group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Patient Health Profile Summary */}
        <div className="space-y-6">
          <div className="bg-white border border-clinical-border rounded-xl shadow-clinical p-6">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-clinical-blue" />
                Health Profile Summary
              </h2>
              <Link
                to="/profile"
                className="text-xs font-bold text-clinical-blue hover:underline"
              >
                Edit
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Blood Group</span>
                <span className="font-bold text-slate-800">
                  {profile?.bloodGroup || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Body Mass Index (BMI)</span>
                <span className="font-bold text-slate-800">
                  {profile?.bmi ? `${profile.bmi} (${profile.bmiCategory})` : "Not calculated"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Height / Weight</span>
                <span className="font-bold text-slate-800">
                  {profile?.height || 170} cm / {profile?.weight || 70} kg
                </span>
              </div>
              <div className="py-1">
                <span className="text-slate-500 block mb-1">Chronic Conditions</span>
                <div className="flex flex-wrap gap-1">
                  {profile?.chronicConditions && profile.chronicConditions.length > 0 ? (
                    profile.chronicConditions.map((c, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium"
                      >
                        {c}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">None reported</span>
                  )}
                </div>
              </div>
              <div className="py-1">
                <span className="text-slate-500 block mb-1">Known Allergies</span>
                <div className="flex flex-wrap gap-1">
                  {profile?.allergies && profile.allergies.length > 0 ? (
                    profile.allergies.map((a, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[11px] font-medium"
                      >
                        {a}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">No allergies recorded</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Care Recommendation Box */}
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-5">
            <h3 className="text-xs font-bold text-sky-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-700" />
              Continuous Clinical Care Notice
            </h3>
            <p className="text-xs text-sky-900 leading-relaxed">
              If your symptoms change abruptly, new red flags develop (e.g. chest pressure, sudden numbness), or high fever persists past 48 hours, seek prompt physical medical evaluation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
