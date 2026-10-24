import React from "react";
import { PhoneCall, AlertOctagon } from "lucide-react";

export const EmergencyBar: React.FC = () => {
  const hotline = import.meta.env.VITE_EMERGENCY_HOTLINE || "911";

  return (
    <div className="bg-rose-950 text-rose-100 text-xs py-2 px-4 border-b border-rose-900">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-rose-400 flex-shrink-0 animate-pulse" />
          <span className="font-semibold text-rose-200 uppercase tracking-wide">
            Medical Emergency Alert:
          </span>
          <span className="text-rose-100">
            If you are experiencing severe chest pain, extreme breathlessness, sudden numbness, or loss of consciousness:
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`tel:${hotline}`}
            className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1 rounded shadow text-xs transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call {hotline} Immediately</span>
          </a>
        </div>
      </div>
    </div>
  );
};
