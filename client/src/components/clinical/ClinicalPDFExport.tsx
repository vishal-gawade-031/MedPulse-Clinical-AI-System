import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { generateAssessmentPDF } from "../../utils/pdfGenerator";
import { useToast } from "../../context/ToastContext";

interface ClinicalPDFExportProps {
  elementId: string;
  assessmentId: string;
}

export const ClinicalPDFExport: React.FC<ClinicalPDFExportProps> = ({
  elementId,
  assessmentId,
}) => {
  const [downloading, setDownloading] = useState<boolean>(false);
  const { showToast } = useToast();

  const handleDownload = async () => {
    try {
      setDownloading(true);
      showToast("Rendering clinical summary PDF document...", "info");
      await generateAssessmentPDF(
        elementId,
        `MedPulse_Clinical_Report_${assessmentId.slice(-6)}.pdf`
      );
      showToast("Clinical summary PDF successfully downloaded!", "success");
    } catch (err: any) {
      console.error(err);
      showToast("Failed to generate PDF document. Please try again.", "error");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-clinical-border hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-lg shadow-xs hover:border-slate-300 disabled:opacity-50 transition-colors"
      title="Download Clinical Summary PDF"
    >
      {downloading ? (
        <Loader2 className="w-4 h-4 animate-spin text-clinical-blue" />
      ) : (
        <Download className="w-4 h-4 text-clinical-blue" />
      )}
      <span>{downloading ? "Generating PDF..." : "Download Clinical Summary"}</span>
    </button>
  );
};
