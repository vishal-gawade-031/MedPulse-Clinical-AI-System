import React from "react";
import { Activity, ShieldCheck } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-clinical-border mt-auto py-8 text-xs text-slate-500 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-clinical-blue flex items-center justify-center text-white">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800 text-sm">
              MedPulse Clinical AI Systems
            </span>
            <span className="text-slate-300">|</span>
            <span>Version 1.0.0 (Enterprise)</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-clinical-blue" />
            <span>Demonstration Clinical Triage Tool — Not a Diagnostic Device</span>
          </div>

          <div className="text-center md:text-right">
            <p>© {new Date().getFullYear()} MedPulse Hospital Health System. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
