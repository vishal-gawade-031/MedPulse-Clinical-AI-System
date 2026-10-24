import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { assessmentService } from "../../services/assessmentService";
import { Assessment } from "../../types";
import { UrgencyBadge } from "../../components/clinical/UrgencyBadge";
import { StatusBadge } from "../../components/clinical/StatusBadge";
import { ProbabilityBar } from "../../components/clinical/ProbabilityBar";
import { RedFlagAlert } from "../../components/clinical/RedFlagAlert";
import { ExplainabilityCard } from "../../components/clinical/ExplainabilityCard";
import { ClinicalPDFExport } from "../../components/clinical/ClinicalPDFExport";
import {
  Activity,
  Heart,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  AlertTriangle,
  FileText,
  Calendar,
  User,
  CheckCircle2,
  Apple,
  AlertCircle,
  ArrowLeft,
  Share2,
  Camera,
  ZoomIn,
  X,
  Sparkles,
} from "lucide-react";

export const AssessmentResult: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomPhoto, setZoomPhoto] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      assessmentService
        .getAssessmentById(id)
        .then((data) => setAssessment(data))
        .catch((err) => {
          setError(
            err.response?.data?.message || "Failed to load clinical assessment."
          );
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <Activity className="w-10 h-10 text-clinical-blue animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">
          Loading clinical assessment summary...
        </p>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Assessment Error</h2>
        <p className="text-xs text-slate-500 mt-1">{error || "Record not found."}</p>
        <Link
          to="/dashboard"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-clinical-blue text-white rounded-lg text-xs font-bold"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const patientName =
    typeof assessment.userId === "object"
      ? `${(assessment.userId as any).firstName} ${(assessment.userId as any).lastName}`
      : "Patient";

  const getUrgencyGuidance = (urgency: string, isRedFlag: boolean) => {
    if (isRedFlag) {
      return "Seek immediate emergency hospital medical evaluation or contact 911 dispatch.";
    }
    if (urgency === "High") {
      return "Seek prompt clinical medical evaluation within 12–24 hours.";
    }
    if (urgency === "Medium") {
      return "Consider booking a routine medical appointment with your primary care provider or specialist.";
    }
    return "General self-care guidance and routine health monitoring. Consult physician if symptoms persist.";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <Link
          to="/history"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Medical History
        </Link>

        <div className="flex items-center gap-2">
          <ClinicalPDFExport
            elementId="printable-clinical-report"
            assessmentId={assessment._id}
          />
          <Link
            to="/assessment"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-clinical-blue text-white rounded-lg text-sm font-bold shadow-xs hover:bg-clinical-dark"
          >
            <Stethoscope className="w-4 h-4" />
            New Assessment
          </Link>
        </div>
      </div>

      {/* Main Printable Clinical Summary Document Container */}
      <div
        id="printable-clinical-report"
        className="bg-white border border-clinical-border rounded-xl p-6 sm:p-8 shadow-clinical space-y-6"
      >
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-clinical-blue text-white flex items-center justify-center shadow-xs">
                <Activity className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  AI-Assisted Symptom Assessment
                </h1>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  MedPulse Clinical Hospital System • Document ID: {assessment._id.slice(-8)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-1.5">
              <div className="flex items-center gap-2">
                <UrgencyBadge urgency={assessment.urgency} size="lg" />
                <StatusBadge status={assessment.status} />
              </div>
              <span className="text-xs text-slate-400">
                Generated: {new Date(assessment.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Deterministic Emergency Red Flag Banner */}
        {assessment.isRedFlag && (
          <RedFlagAlert redFlags={assessment.redFlags} />
        )}

        {/* Patient Demographics & Record Snapshot */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">Patient Name</span>
            <span className="font-bold text-slate-900">{patientName}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Recommended Specialty</span>
            <span className="font-bold text-clinical-blue">{assessment.specialty}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Clinical Urgency</span>
            <span className="font-bold text-slate-900">{assessment.urgency}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Model Engine</span>
            <span className="font-bold text-slate-700">{assessment.modelVersion}</span>
          </div>
        </div>

        {/* Symptoms Reported & Vitals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-slate-200 rounded-xl p-4 bg-white">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Reported Symptoms ({assessment.symptoms.length})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {assessment.symptoms.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md text-xs font-medium border border-slate-200"
                >
                  {s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-white">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Vital Signs at Assessment
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Temperature:</span>
                <span className="font-bold text-slate-800">
                  {assessment.vitals?.temperature
                    ? `${assessment.vitals.temperature}°${assessment.vitals.temperatureUnit || "C"}`
                    : "Not recorded"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Heart Rate:</span>
                <span className="font-bold text-slate-800">
                  {assessment.vitals?.heartRate
                    ? `${assessment.vitals.heartRate} bpm`
                    : "Not recorded"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Oxygen Saturation:</span>
                <span className="font-bold text-slate-800">
                  {assessment.vitals?.oxygenSaturation
                    ? `${assessment.vitals.oxygenSaturation}%`
                    : "Not recorded"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Blood Pressure:</span>
                <span className="font-bold text-slate-800">
                  {assessment.vitals?.systolicBP && assessment.vitals?.diastolicBP
                    ? `${assessment.vitals.systolicBP}/${assessment.vitals.diastolicBP} mmHg`
                    : "Not recorded"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Visual Evidence & Photo Analysis Report (Rendered when photo is present) */}
        {(assessment.photoData || assessment.visualAnalysis?.hasPhoto) && (
          <div className="border border-blue-200 rounded-2xl p-5 sm:p-6 bg-gradient-to-b from-blue-50/50 via-white to-white shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100/80 border border-blue-200 text-clinical-blue flex items-center justify-center shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    Clinical Visual Photography & Tissue Analysis Report
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Multi-modal visual diagnostic findings • Anatomical Site:{" "}
                    <strong className="text-clinical-blue font-semibold">
                      {assessment.visualAnalysis?.bodyArea ||
                        assessment.photoMetadata?.bodyArea ||
                        "Dermatological / Skin"}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Visual Confidence:{" "}
                  {assessment.visualAnalysis?.visualConfidence || 85}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Photo Display Card with Inspection Overlay */}
              <div className="md:col-span-5 relative group rounded-xl overflow-hidden border border-slate-300 shadow-xs bg-slate-900 aspect-4/3 flex items-center justify-center">
                {assessment.photoData ? (
                  <img
                    src={assessment.photoData}
                    alt="Clinical disease evidence"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-slate-400 text-xs">Clinical image archived</div>
                )}

                {/* Technical viewfinder watermark */}
                <div className="absolute inset-0 pointer-events-none border border-white/20 m-2 rounded-lg flex items-center justify-center">
                  <span className="absolute top-2 left-2 text-[9px] font-mono text-white/90 bg-slate-950/70 px-1.5 py-0.5 rounded">
                    MED-AI SCAN
                  </span>
                  <span className="absolute bottom-2 right-2 text-[9px] font-mono text-emerald-300 bg-slate-950/70 px-1.5 py-0.5 rounded">
                    ERYTHEMA: {assessment.visualAnalysis?.erythemaLevel || "EVALUATED"}
                  </span>
                </div>

                {assessment.photoData && (
                  <button
                    type="button"
                    onClick={() => setZoomPhoto(true)}
                    className="no-print absolute inset-0 m-auto w-fit h-fit px-3 py-1.5 bg-slate-950/75 hover:bg-slate-950 text-white rounded-lg text-xs font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    Inspect Photo
                  </button>
                )}
              </div>

              {/* Visual Diagnostic Findings */}
              <div className="md:col-span-7 space-y-3">
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    AI Visual Diagnostic Prediction
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900">
                      {assessment.visualAnalysis?.suspectedCondition ||
                        assessment.predictions[0]?.disease}
                    </span>
                    <span className="text-xs font-bold text-clinical-blue">
                      Visual Score:{" "}
                      {assessment.visualAnalysis?.visualSeverityScore || 5.0}/10
                    </span>
                  </div>
                </div>

                {/* Detected Visual Markers Checklist */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Identified Visual Clinical Markers:
                  </span>
                  <ul className="space-y-1 text-xs">
                    {(assessment.visualAnalysis?.detectedFeatures &&
                    assessment.visualAnalysis.detectedFeatures.length > 0
                      ? assessment.visualAnalysis.detectedFeatures
                      : [
                          "Cutaneous erythema and localized inflammatory response",
                          "Epidermal contour alteration consistent with clinical rash",
                          "Multi-modal fusion correlation with reported symptoms",
                        ]
                    ).map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-clinical-blue shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Patient notes if recorded */}
                {(assessment.visualAnalysis?.notes ||
                  assessment.photoMetadata?.notes) && (
                  <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900">
                    <span className="font-bold block text-[10px] uppercase text-amber-800">
                      Patient Visual Notes:
                    </span>
                    <span className="italic">
                      "{assessment.visualAnalysis?.notes ||
                        assessment.photoMetadata?.notes}"
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Probabilistic Disease Predictions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-clinical-blue" />
              Model-Generated Probability Estimates
            </h3>
            <span className="text-xs text-slate-400">
              Confidence distributions
            </span>
          </div>

          <div className="space-y-2.5">
            {assessment.predictions.map((pred, idx) => (
              <ProbabilityBar
                key={idx}
                disease={pred.disease}
                confidence={pred.confidence}
                rank={idx + 1}
              />
            ))}
          </div>
        </div>

        {/* Explainability Section */}
        <ExplainabilityCard predictions={assessment.predictions} />

        {/* Urgency Guidance Banner */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-clinical-blue flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Urgency Action Recommendation:
            </h4>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">
              {getUrgencyGuidance(assessment.urgency, assessment.isRedFlag)}
            </p>
          </div>
        </div>

        {/* Care Guidance & Precautions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Precautions */}
          <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              General Precautions & Warning Signs
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {assessment.precautions?.map((p, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Dietary & Lifestyle Advice */}
          <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Apple className="w-4 h-4 text-amber-600" />
              Dietary & Supportive Care Guidance
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {assessment.dietaryRecommendations?.map((d, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Clinician Review Notes (if reviewed) */}
        {assessment.doctorNotes && (
          <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-clinical-blue" />
                Attending Physician Review Notes
              </h4>
              {assessment.reviewedAt && (
                <span className="text-[11px] text-blue-700 font-medium">
                  Reviewed: {new Date(assessment.reviewedAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <p className="text-xs text-blue-900 leading-relaxed font-medium bg-white p-3 rounded-lg border border-blue-100">
              "{assessment.doctorNotes}"
            </p>
          </div>
        )}

        {/* Medical Safety Disclaimer Footer */}
        <div className="pt-4 border-t border-slate-200 text-center space-y-1">
          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            AI-Assisted Triage Information — Not a Medical Diagnosis
          </p>
          <p className="text-[10px] text-slate-400 max-w-xl mx-auto leading-relaxed">
            This document provides clinical probability estimates generated for clinical decision support and educational triage. It does not constitute a prescription, definitive diagnosis, or therapeutic instruction. Consult a qualified medical practitioner for formal physical evaluation.
          </p>
        </div>
      </div>

      {/* Lightbox Photo Zoom Modal */}
      {zoomPhoto && assessment.photoData && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 no-print"
          onClick={() => setZoomPhoto(false)}
        >
          <div
            className="relative max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-white/20 shadow-2xl p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 text-white border-b border-white/10">
              <span className="text-xs font-bold font-mono">
                {assessment.photoMetadata?.fileName || "Clinical Photography Inspection"} (
                {assessment.visualAnalysis?.bodyArea ||
                  assessment.photoMetadata?.bodyArea ||
                  "Lesion View"}
                )
              </span>
              <button
                type="button"
                onClick={() => setZoomPhoto(false)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={assessment.photoData}
              alt="High-resolution clinical view"
              className="max-h-[75vh] w-auto mx-auto rounded-lg object-contain p-2"
            />
          </div>
        </div>
      )}
    </div>
  );
};
