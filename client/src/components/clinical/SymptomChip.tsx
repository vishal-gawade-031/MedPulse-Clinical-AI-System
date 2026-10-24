import React from "react";
import { X, AlertCircle } from "lucide-react";
import { Symptom } from "../../types";

interface SymptomChipProps {
  symptom: Symptom | { symptomId: string; displayName: string; category?: string; isRedFlagIndicator?: boolean };
  onRemove?: () => void;
  onClick?: () => void;
  selected?: boolean;
}

export const SymptomChip: React.FC<SymptomChipProps> = ({
  symptom,
  onRemove,
  onClick,
  selected = false,
}) => {
  const isRed = symptom.isRedFlagIndicator;

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
        selected
          ? isRed
            ? "bg-rose-100 text-rose-800 border border-rose-300 shadow-xs"
            : "bg-clinical-blue text-white shadow-xs"
          : isRed
          ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer"
          : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 cursor-pointer"
      }`}
    >
      {isRed && <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />}
      <span>{symptom.displayName}</span>
      {symptom.category && (
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            selected
              ? "bg-white/20 text-white"
              : "bg-slate-200 text-slate-600"
          }`}
        >
          {symptom.category}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 p-0.5 rounded-full hover:bg-black/10 transition-colors"
          title="Remove symptom"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </span>
  );
};
