import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { adminService } from "../../services/adminService";
import { Assessment } from "../../types";
import { UrgencyBadge } from "../../components/clinical/UrgencyBadge";
import { StatusBadge } from "../../components/clinical/StatusBadge";
import {
  ClipboardList,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

export const AdminAssessments: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialUrgency = searchParams.get("urgency") || "All";

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [urgencyFilter, setUrgencyFilter] = useState<string>(initialUrgency);
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const loadData = () => {
    setLoading(true);
    adminService
      .getAllAssessments({
        page,
        limit: 10,
        urgency: urgencyFilter,
        status: statusFilter,
        search: searchTerm,
      })
      .then((res) => {
        if (res.success) {
          setAssessments(res.data);
          setTotal(res.total);
          setTotalPages(res.totalPages);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [page, urgencyFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-clinical-blue block mb-1">
            Clinical Triage Queue
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Patient Assessment Submissions ({total})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Filter, search, and manage clinical cases for medical oversight and doctor sign-off.
          </p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by condition, symptom, or patient details..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="font-semibold text-slate-500">Urgency:</span>
          {["All", "High", "Medium", "Low"].map((u) => (
            <button
              key={u}
              onClick={() => {
                setUrgencyFilter(u);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                urgencyFilter === u
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {u}
            </button>
          ))}

          <span className="font-semibold text-slate-500 ml-3">Status:</span>
          {["All", "AI Analyzed", "Reviewed", "Follow-up Required", "Closed"].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-full font-semibold transition-colors ${
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

      {/* Assessments Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Submission Date</th>
                <th className="py-3 px-4">Urgency</th>
                <th className="py-3 px-4">Reported Symptoms</th>
                <th className="py-3 px-4">Top AI Estimation</th>
                <th className="py-3 px-4">Specialty</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading triage submissions...
                  </td>
                </tr>
              ) : assessments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No clinical assessments found matching filters.
                  </td>
                </tr>
              ) : (
                assessments.map((a) => {
                  const patient = typeof a.userId === "object" ? a.userId : null;
                  return (
                    <tr key={a._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {patient
                            ? `${(patient as any).firstName} ${(patient as any).lastName}`
                            : "Patient"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {patient ? (patient as any).email : ""}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <UrgencyBadge urgency={a.urgency} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
                        {a.symptoms.map((s) => s.replace(/_/g, " ")).join(", ")}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {a.predictions[0]?.disease} ({a.predictions[0]?.confidence}%)
                      </td>
                      <td className="py-3 px-4 text-clinical-blue font-semibold">
                        {a.specialty}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/admin/assessments/${a._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-clinical-blue hover:bg-clinical-dark text-white rounded text-xs font-bold transition-colors shadow-xs"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing page {page} of {totalPages} ({total} total records)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
