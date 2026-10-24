import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import { AuditLogItem } from "../../types";
import { FileText, ShieldCheck, Clock, User, ChevronLeft, ChevronRight } from "lucide-react";

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const loadLogs = () => {
    setLoading(true);
    adminService
      .getAuditLogs({ page, limit: 15 })
      .then((res) => {
        if (res.success) {
          setLogs(res.data);
          setTotal(res.total);
          setTotalPages(res.totalPages);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, [page]);

  const getActionBadge = (action: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      LOGIN: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
      LOGOUT: { bg: "bg-slate-100 border-slate-200", text: "text-slate-600" },
      PROFILE_UPDATED: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
      ASSESSMENT_CREATED: { bg: "bg-sky-50 border-sky-200", text: "text-sky-700" },
      PREDICTION_GENERATED: { bg: "bg-purple-50 border-purple-200", text: "text-purple-700" },
      ASSESSMENT_REVIEWED: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800" },
      FOLLOWUP_REQUESTED: { bg: "bg-amber-50 border-amber-200", text: "text-amber-800" },
      ASSESSMENT_CLOSED: { bg: "bg-slate-100 border-slate-200", text: "text-slate-800" },
    };

    const style = map[action] || { bg: "bg-slate-50 border-slate-200", text: "text-slate-700" };

    return (
      <span
        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${style.bg} ${style.text}`}
      >
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-clinical-blue block mb-1">
          Regulatory Compliance & Oversight
        </span>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Hospital Clinical Audit Trail ({total} Events)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Immutable event telemetry for patient privacy, assessment creations, and doctor sign-offs.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Acting User</th>
                <th className="py-3 px-4">Resource Target</th>
                <th className="py-3 px-4">Metadata Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Loading audit trail records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const user = log.userId;
                  return (
                    <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {user
                            ? `${user.firstName} ${user.lastName}`
                            : "System"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {user?.role || "SYSTEM"}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {log.resourceType} {log.resourceId ? `(#${log.resourceId.slice(-6)})` : ""}
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-500 max-w-sm truncate">
                        {log.metadata ? JSON.stringify(log.metadata) : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {page} of {totalPages}
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
