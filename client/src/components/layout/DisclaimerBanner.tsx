import React, { useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";

export const DisclaimerBanner: React.FC = () => {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <div className="bg-sky-50 border-b border-sky-200 text-sky-950 text-xs py-2 px-4 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div className="flex items-start sm:items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-700 flex-shrink-0 mt-0.5 sm:mt-0" />
          <p className="font-medium">
            <span className="font-bold text-sky-900">CLINICAL NOTICE:</span> MedPulse Clinical AI is an AI-assisted symptom triage & educational tool. It does NOT provide a confirmed medical diagnosis or replace licensed physician judgment.
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sky-700 hover:text-sky-900 font-semibold underline text-[11px] self-end sm:self-auto flex items-center gap-0.5"
        >
          {expanded ? "Show less" : "Read policy"}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-sky-200 text-[11px] text-sky-900 leading-relaxed space-y-1">
          <p>
            • Probabilities displayed in this portal represent algorithmic estimations derived from demonstration machine learning models and deterministic safety protocols.
          </p>
          <p>
            • Never delay seeking professional medical diagnosis, advice, or treatment because of information received through this application.
          </p>
          <p>
            • If you believe you are suffering an acute medical emergency, contact local emergency dispatch (911) or proceed immediately to the nearest hospital emergency room.
          </p>
        </div>
      )}
    </div>
  );
};
