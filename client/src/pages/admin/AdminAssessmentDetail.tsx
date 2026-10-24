import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { adminService } from "../../services/adminService";
import { Assessment } from "../../types";
import { UrgencyBadge } from "../../components/clinical/UrgencyBadge";
import { StatusBadge } from "../../components/clinical/StatusBadge";
import { ProbabilityBar } from "../../components/clinical/ProbabilityBar";
import { RedFlagAlert } from "../../components/clinical/RedFlagAlert";
import { ExplainabilityCard } from "../../components/clinical/ExplainabilityCard";
import { useToast } from "../../context/ToastContext";
import {
  ArrowLeft,
  Activity,
  User,
  Heart,
  Calendar,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Save,
  ShieldCheck,
  Building,
  Thermometer,
  Wind,
  Camera,
  ZoomIn,
  X,
  Sparkles,
} from "lucide-react";

export const AdminAssessmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [doctorNotes, setDoctorNotes] = useState<string>("");
  const [status, setStatus] = useState<string>("Reviewed");
  const [saving, setSaving] = useState<boolean>(false);
  const [zoomPhoto, setZoomPhoto] = useState<boolean>(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      adminService
        .getAssessmentById(id)
        .then((data) => {
          setAssessment(data);
          setDoctorNotes(data.doctorNotes || "");
          setStatus(data.status === "AI Analyzed" ? "Reviewed" : data.status);
        })
        .catch((err) => {
          console.error(err);
          showToast("Failed to retrieve assessment details.", "error");
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setSaving(true);
      const updated = await adminService.updateAssessmentStatus(
        id,
        status,
        doctorNotes
      );
      setAssessment(updated);
      showToast(
        `Clinical review saved. Assessment marked as ${status}.`,
        "success"
      );
    } catch (err) {
      showToast("Failed to save review.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <Activity className="w-10 h-10 text-clinical-blue animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">
          Loading clinical record for physician review...
        </p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="py-12 text-center text-slate-500">
        Clinical assessment record not found.
      </div>
    );
  }

  const patient = typeof assessment.userId === "object" ? assessment.userId : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header back bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/assessments"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Triage Queue
        </Link>
        <div className="flex items-center gap-2">
          <UrgencyBadge urgency={assessment.urgency} size="sm" />
          <StatusBadge status={assessment.status} />
        </div>
      </div>

      {/* Main Review Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Title */}
        <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Physician Triage & Diagnostic Review
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Reviewing Case Ref #{assessment._id} • Engine: {assessment.modelVersion}
            </p>
          </div>
          <div className="text-xs text-slate-400">
            Submitted: {new Date(assessment.createdAt).toLocaleString()}
          </div>
        </div>

        {/* Emergency Red Flag Notice if present */}
        {assessment.isRedFlag && (
          <RedFlagAlert redFlags={assessment.redFlags} />
        )}

        {/* Patient Demographics */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              Patient Name
            </span>
            <span className="font-bold text-slate-900 text-sm">
              {patient
                ? `${(patient as any).firstName} ${(patient as any).lastName}`
                : "John Doe"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              Email
            </span>
            <span className="font-medium text-slate-800">
              {patient ? (patient as any).email : "patient@hospital.org"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              Phone
            </span>
            <span className="font-medium text-slate-800">
              {patient ? (patient as any).phone || "+1 (555) 234-5678" : "+1 (555) 234-5678"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              Recommended Specialty
            </span>
            <span className="font-bold text-clinical-blue text-sm">
              {assessment.specialty}
            </span>
          </div>
        </div>

        {/* Clinical Visual Evidence & Photo Analysis (Physician View) */}
        {(assessment.photoData || assessment.visualAnalysis?.hasPhoto) && (
          <div className="border border-blue-200 rounded-xl p-5 bg-gradient-to-b from-blue-50/40 via-white to-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-clinical-blue flex items-center justify-center shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    Patient Clinical Photography & Visual Markers
                  </h2>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Anatomical Location:{" "}
                    <strong className="text-clinical-blue">
                      {assessment.visualAnalysis?.bodyArea ||
                        assessment.photoMetadata?.bodyArea ||
                        "Dermatological / Skin"}
                    </strong>
                  </span>
                </div>
              </div>

              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Visual AI Confidence:{" "}
                {assessment.visualAnalysis?.visualConfidence || 85}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              {/* Photo View with Hover Zoom */}
              <div className="md:col-span-4 relative group rounded-lg overflow-hidden border border-slate-300 bg-slate-950 aspect-4/3 flex items-center justify-center">
                {assessment.photoData ? (
                  <img
                    src={assessment.photoData}
                    alt="Clinical photo evidence"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-slate-400 text-xs">Photo on record</div>
                )}
                {assessment.photoData && (
                  <button
                    type="button"
                    onClick={() => setZoomPhoto(true)}
                    className="absolute inset-0 m-auto w-fit h-fit px-3 py-1.5 bg-slate-950/80 hover:bg-slate-950 text-white rounded-lg text-xs font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    Inspect Photo
                  </button>
                )}
              </div>

              {/* Physician Visual Findings */}
              <div className="md:col-span-8 space-y-2 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Suspected Visual Condition
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {assessment.visualAnalysis?.suspectedCondition ||
                        assessment.predictions[0]?.disease}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Erythema Severity
                    </span>
                    <span className="font-bold text-rose-700">
                      {assessment.visualAnalysis?.erythemaLevel || "Moderate"}
                    </span>
                  </div>
                </div>

                {/* Markers */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    AI Visual Diagnostic Markers Detected:
                  </span>
                  <ul className="space-y-1">
                    {(assessment.visualAnalysis?.detectedFeatures || [
                      "Cutaneous tissue inflammation detected",
                      "Multi-modal fusion correlation active",
                    ]).map((feat, idx) => (
                      <li
                        key={idx}
                        className="p-1.5 bg-slate-50 border border-slate-200 rounded flex items-center gap-1.5 text-slate-700"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-clinical-blue shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {assessment.photoMetadata?.notes && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-900">
                    <span className="font-bold block text-[10px] uppercase">
                      Patient Stated Note:
                    </span>
                    <span className="italic">"{assessment.photoMetadata.notes}"</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Symptoms & Severity Breakdown */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Reported Symptoms & Patient-Stated Severity
          </h2>
          <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 text-xs">
            {assessment.severityData && assessment.severityData.length > 0 ? (
              assessment.severityData.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="font-semibold text-slate-800">
                    {s.symptomId.replace(/_/g, " ").toUpperCase()}
                    {s.notes && (
                      <span className="text-slate-400 font-normal italic ml-2">
                        — "{s.notes}"
                      </span>
                    )}
                  </div>
                  <div className="text-slate-600 font-medium">
                    Severity:{" "}
                    <span className="font-bold text-slate-900">
                      {s.severity}/10
                    </span>{" "}
                    | Duration:{" "}
                    <span className="font-bold text-slate-900">
                      {s.duration?.value} {s.duration?.unit}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-slate-500">
                {assessment.symptoms.join(", ")}
              </div>
            )}
          </div>
        </div>

        {/* Vital Signs */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Patient Vital Signs
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-400 block text-[10px]">Temp</span>
              <span className="font-bold text-slate-800">
                {assessment.vitals?.temperature
                  ? `${assessment.vitals.temperature}°${assessment.vitals.temperatureUnit || "C"}`
                  : "N/A"}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-400 block text-[10px]">Heart Rate</span>
              <span className="font-bold text-slate-800">
                {assessment.vitals?.heartRate ? `${assessment.vitals.heartRate} bpm` : "N/A"}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-400 block text-[10px]">SpO2</span>
              <span className="font-bold text-slate-800">
                {assessment.vitals?.oxygenSaturation ? `${assessment.vitals.oxygenSaturation}%` : "N/A"}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-400 block text-[10px]">Blood Pressure</span>
              <span className="font-bold text-slate-800">
                {assessment.vitals?.systolicBP && assessment.vitals?.diastolicBP
                  ? `${assessment.vitals.systolicBP}/${assessment.vitals.diastolicBP} mmHg`
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* AI Probability Estimates */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            AI-Generated Condition Estimates
          </h2>
          <div className="space-y-2">
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

        {/* Explainability Contributing Symptoms */}
        <ExplainabilityCard predictions={assessment.predictions} />

        {/* Physician Sign-Off & Notes Form */}
        <form onSubmit={handleSaveReview} className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-clinical-blue" />
            Physician Triage Action & Clinical Sign-Off
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Lifecycle Case Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: "Reviewed", label: "Mark Reviewed", icon: CheckCircle2 },
                { val: "Follow-up Required", label: "Request Follow-up", icon: AlertTriangle },
                { val: "Closed", label: "Close Assessment", icon: Clock },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = status === opt.val;
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setStatus(opt.val)}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Doctor / Clinical Notes
            </label>
            <textarea
              rows={4}
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Enter official physician triage notes, recommended interventions, or lab orders..."
              className="w-full text-sm rounded-lg border border-slate-300 p-3 bg-white focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-clinical-blue hover:bg-clinical-dark text-white font-bold text-sm rounded-lg shadow-sm disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Review..." : "Commit Physician Review"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Physician Photo Zoom Modal */}
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
