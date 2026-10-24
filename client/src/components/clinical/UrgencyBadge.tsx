import React from "react";
import { AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";

interface UrgencyBadgeProps {
  urgency: "Low" | "Medium" | "High";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({
  urgency,
  size = "md",
  showIcon = true,
}) => {
  const configs = {
    Low: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      icon: CheckCircle,
      label: "LOW URGENCY",
      subtext: "Routine care / Self-monitoring",
    },
    Medium: {
      bg: "bg-amber-50 text-amber-800 border-amber-200",
      dot: "bg-amber-500",
      icon: AlertTriangle,
      label: "MEDIUM URGENCY",
      subtext: "Clinical evaluation recommended",
    },
    High: {
      bg: "bg-rose-50 text-rose-700 border-rose-200 animate-pulse",
      dot: "bg-rose-600",
      icon: ShieldAlert,
      label: "HIGH URGENCY",
      subtext: "Seek prompt / urgent medical care",
    },
  };

  const config = configs[urgency] || configs.Medium;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3.5 py-1.5 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-full border shadow-xs tracking-wider uppercase ${config.bg} ${sizeClasses[size]}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{config.label}</span>
    </span>
  );
};
