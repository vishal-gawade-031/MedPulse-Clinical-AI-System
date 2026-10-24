import React from "react";

interface ProbabilityBarProps {
  disease: string;
  confidence: number;
  rank: number;
}

export const ProbabilityBar: React.FC<ProbabilityBarProps> = ({
  disease,
  confidence,
  rank,
}) => {
  // Clinical color gradation depending on probability magnitude
  const getBarColor = (conf: number, r: number) => {
    if (r === 1) {
      if (conf > 70) return "bg-clinical-blue";
      return "bg-sky-600";
    }
    if (r === 2) return "bg-slate-500";
    return "bg-slate-400";
  };

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-4 hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
            {rank}
          </span>
          <span className="font-semibold text-slate-900 text-sm sm:text-base">
            {disease}
          </span>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-slate-900">
            {confidence.toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-500 block uppercase tracking-wider">
            Probability
          </span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-700 ease-out ${getBarColor(
            confidence,
            rank
          )}`}
          style={{ width: `${Math.min(100, Math.max(5, confidence))}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-slate-500">
        <span>Model-generated probabilistic estimate</span>
        <span>Confidence index: {confidence >= 70 ? "Strong" : confidence >= 40 ? "Moderate" : "Low"}</span>
      </div>
    </div>
  );
};
