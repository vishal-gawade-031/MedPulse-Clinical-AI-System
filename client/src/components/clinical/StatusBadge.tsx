import React from "react";

interface StatusBadgeProps {
  status: "Submitted" | "AI Analyzed" | "Reviewed" | "Follow-up Required" | "Closed" | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const configs: Record<string, { bg: string; text: string; border: string }> = {
    Submitted: {
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-200",
    },
    "AI Analyzed": {
      bg: "bg-sky-50",
      text: "text-sky-700",
      border: "border-sky-200",
    },
    Reviewed: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    "Follow-up Required": {
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
    },
    Closed: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
  };

  const current = configs[status] || configs["AI Analyzed"];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.bg} ${current.text} ${current.border}`}
    >
      {status}
    </span>
  );
};
