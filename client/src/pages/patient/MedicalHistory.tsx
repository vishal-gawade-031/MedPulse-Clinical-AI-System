import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { assessmentService } from "../../services/assessmentService";
import { Assessment } from "../../types";
import { UrgencyBadge } from "../../components/clinical/UrgencyBadge";
import { StatusBadge } from "../../components/clinical/StatusBadge";
import {
  History,
  Search,
  Filter,
  Calendar,
  ChevronRight,
  Stethoscope,
  Activity,
  FileText,
  AlertCircle,
} from "lucide-react";

export const MedicalHistory: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const loadData = () => {
    setLoading(true);
    assessmentService
      .getPatientAssessments({
        urgency: urgencyFilter,
        status: statusFilter,
        search: searchTerm,
      })
      .then((data) => setAssessments(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [urgencyFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-clinical-border rounded-xl p-6 shadow-clinical flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-clinical-blue uppercase tracking-wider">
            Patient Medical Records
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Historical Symptom Assessments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete longitudinal clinical timeline of your past triage sessions.
          </p>
        </div>

        <Link
          to="/assessment"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-clinical-blue hover:bg-clinical-dark text-white text-sm font-bold rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Stethoscope className="w-4 h-4" />
          <span>New Assessment</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-clinical-border rounded-xl p-4 shadow-clinical space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search past assessments by condition, symptom, or specialty..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold">Urgency:</span>
          </div>
          {["All", "High", "Medium", "Low"].map((u) => (
            <button
              key={u}
              onClick={() => setUrgencyFilter(u)}
              className={`px-2.5 py-1 rounded-full font-semibold transition-colors ${
                urgencyFilter === u
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {u}
            </button>
          ))}

          <div className="w-px h-4 bg-slate-200 mx-1 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="font-semibold">Status:</span>
          </div>
          {["All", "AI Analyzed", "Reviewed", "Follow-up Required", "Closed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-full font-semibold transition-colors ${
                statusFilter === st
                  ? "bg-clinical-blue text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-white border border-clinical-border rounded-xl shadow-clinical p-6">
        {loading ? (
          <div className="space-y-4 py-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : assessments.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">
              No previous assessments match criteria
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search filters or start a new assessment session.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {assessments.map((item) => (
              <div key={item._id} className="relative group">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full border-2 border-white shadow-xs flex items-center justify-center text-white ${
                    item.urgency === "High"
                      ? "bg-rose-600"
                      : item.urgency === "Medium"
                      ? "bg-amber-500"
                      : "bg-emerald-600"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                </div>

                {/* Assessment Card */}
                <Link
                  to={`/assessment/result/${item._id}`}
                  className="block p-4 sm:p-5 rounded-xl border border-slate-200 hover:border-clinical-blue bg-white hover:bg-slate-50/60 shadow-xs transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-slate-900 text-base group-hover:text-clinical-blue transition-colors">
                        {item.predictions[0]?.disease}
                      </span>
                      <UrgencyBadge urgency={item.urgency} size="sm" />
                      <StatusBadge status={item.status} />
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}</span>
                      <span>at</span>
                      <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Prediction Distribution & Symptoms */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Top Predicted Conditions
                      </span>
                      <div className="font-medium text-slate-800 mt-0.5">
                        {item.predictions.map((p) => `${p.disease} (${p.confidence}%)`).join(" • ")}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Reported Symptoms ({item.symptoms.length})
                      </span>
                      <div className="text-slate-700 truncate mt-0.5">
                        {item.symptoms.map((s) => s.replace(/_/g, " ")).join(", ")}
                      </div>
                    </div>

                    <div className="sm:text-right flex sm:flex-col justify-between sm:justify-start items-center sm:items-end">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">
                        Specialty Referral
                      </span>
                      <span className="font-bold text-clinical-blue mt-0.5">
                        {item.specialty}
                      </span>
                    </div>
                  </div>

                  {/* Doctor Notes Preview if exists */}
                  {item.doctorNotes && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-blue-900 bg-blue-50/50 p-2.5 rounded-lg flex items-start gap-2">
                      <FileText className="w-4 h-4 text-clinical-blue flex-shrink-0 mt-0.5" />
                      <span className="italic line-clamp-2">
                        Physician Note: "{item.doctorNotes}"
                      </span>
                    </div>
                  )}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
