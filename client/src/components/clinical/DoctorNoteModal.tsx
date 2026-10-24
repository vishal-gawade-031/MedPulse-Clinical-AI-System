import React, { useState } from "react";
import { X, FileText, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Assessment } from "../../types";

interface DoctorNoteModalProps {
  assessment: Assessment;
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: string, status: string) => Promise<void>;
}

export const DoctorNoteModal: React.FC<DoctorNoteModalProps> = ({
  assessment,
  isOpen,
  onClose,
  onSave,
}) => {
  const [notes, setNotes] = useState<string>(assessment.doctorNotes || "");
  const [status, setStatus] = useState<string>(
    assessment.status === "AI Analyzed" ? "Reviewed" : assessment.status
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(notes, status);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-clinical-lg border border-clinical-border overflow-hidden">
        <div className="px-6 py-4 border-b border-clinical-border flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-clinical-blue" />
            <h3 className="font-bold text-slate-900 text-base">
              Physician Clinical Triage Review
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-md p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Update Assessment Lifecycle Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: "Reviewed", label: "Reviewed", icon: CheckCircle2, color: "hover:border-blue-300" },
                { val: "Follow-up Required", label: "Follow-up", icon: AlertTriangle, color: "hover:border-amber-300" },
                { val: "Closed", label: "Close Case", icon: Clock, color: "hover:border-emerald-300" },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = status === opt.val;
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setStatus(opt.val)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold transition-all ${
                      isSelected
                        ? "border-clinical-blue bg-clinical-light text-clinical-blue shadow-xs"
                        : `border-slate-200 text-slate-600 bg-white ${opt.color}`
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Doctor / Triage Notes
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter clinical observations, ECG or lab results, instructions for patient follow-up, or rationale..."
              className="w-full text-sm rounded-lg border border-slate-300 p-3 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-clinical-blue focus:border-transparent"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-bold text-white bg-clinical-blue hover:bg-clinical-dark rounded-lg shadow-sm disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Saving..." : "Save Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
