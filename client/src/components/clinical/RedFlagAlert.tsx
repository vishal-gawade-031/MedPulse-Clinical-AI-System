import React from "react";
import { AlertOctagon, PhoneCall, Hospital } from "lucide-react";

interface RedFlagAlertProps {
  redFlags: string[];
}

export const RedFlagAlert: React.FC<RedFlagAlertProps> = ({ redFlags }) => {
  const hotline = import.meta.env.VITE_EMERGENCY_HOTLINE || "911";

  if (!redFlags || redFlags.length === 0) return null;

  return (
    <div className="bg-rose-50 border-2 border-rose-600 rounded-xl p-5 shadow-clinical-md my-6">
      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-rose-600 text-white rounded-lg flex-shrink-0 animate-bounce">
          <AlertOctagon className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-black text-rose-950 uppercase tracking-wide">
              URGENT MEDICAL ATTENTION MAY BE REQUIRED
            </h3>
            <span className="bg-rose-700 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Safety Override Active
            </span>
          </div>

          <p className="mt-1.5 text-sm font-medium text-rose-900 leading-relaxed">
            Deterministic safety rules flagged critical physiological indicators that warrant immediate clinical evaluation. Machine learning estimates cannot rule out life-threatening conditions.
          </p>

          <div className="mt-3 bg-white/80 border border-rose-200 rounded-lg p-3">
            <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider mb-1.5">
              Triggered Red-Flag Indicators:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-rose-900 font-medium">
              {redFlags.map((flag, idx) => (
                <li key={idx}>{flag}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a
              href={`tel:${hotline}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              Call Emergency Services ({hotline})
            </a>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-900">
              <Hospital className="w-4 h-4 text-rose-700" />
              Proceed to the nearest Emergency Department immediately
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
