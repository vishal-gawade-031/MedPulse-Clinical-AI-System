import React from "react";
import { CheckCircle2, HelpCircle } from "lucide-react";
import { PredictionItem } from "../../types";

interface ExplainabilityCardProps {
  predictions: PredictionItem[];
}

export const ExplainabilityCard: React.FC<ExplainabilityCardProps> = ({
  predictions,
}) => {
  if (!predictions || predictions.length === 0) return null;

  return (
    <div className="bg-white border border-clinical-border rounded-xl p-6 shadow-clinical">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-clinical-blue" />
            Why These Conditions Were Considered
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Contributing clinical features identified during inference
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {predictions.map((item, idx) => (
          <div
            key={idx}
            className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
              <span className="font-semibold text-slate-800 text-sm">
                {item.disease}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                {item.confidence.toFixed(1)}%
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Relevant Contributing Symptoms:
              </span>
              {item.relevantSymptoms && item.relevantSymptoms.length > 0 ? (
                item.relevantSymptoms.map((sym, sIdx) => (
                  <div
                    key={sIdx}
                    className="flex items-center gap-2 text-xs font-medium text-slate-700"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-clinical-blue flex-shrink-0" />
                    <span>{sym}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic">
                  Secondary symptom patterns
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500 italic flex items-center gap-1.5">
        <span>*</span>
        <span>
          These are contributing symptoms considered by the demonstration model and do not confirm a clinical diagnosis. Final clinical assessment requires examination by a licensed medical practitioner.
        </span>
      </div>
    </div>
  );
};
