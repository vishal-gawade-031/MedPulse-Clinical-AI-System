import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { symptomService } from "../../services/symptomService";
import { assessmentService } from "../../services/assessmentService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Symptom, SeverityItem, VitalsData, ClinicalContext, PhotoMetadata } from "../../types";
import { SymptomChip } from "../../components/clinical/SymptomChip";
import { ClinicalPhotoUpload } from "../../components/clinical/ClinicalPhotoUpload";
import {
  Stethoscope,
  Search,
  Check,
  ChevronRight,
  ChevronLeft,
  Activity,
  Heart,
  Thermometer,
  Wind,
  ShieldAlert,
  Clock,
  Sliders,
  CheckCircle2,
  Loader2,
  Sparkles,
  Info,
  Camera,
} from "lucide-react";

export const AssessmentWizard: React.FC = () => {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Wizard state
  const [step, setStep] = useState<number>(1);
  const [allSymptoms, setAllSymptoms] = useState<Symptom[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Optional Clinical Photography State
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [photoMetadata, setPhotoMetadata] = useState<PhotoMetadata>({
    bodyArea: "Dermatological / Skin (General)",
    notes: "",
  });
  const [suggestedSymptomsList, setSuggestedSymptomsList] = useState<string[]>([]);

  // Step 2: Severity & Timeline
  const [severityData, setSeverityData] = useState<Record<string, SeverityItem>>({});

  // Step 3: Vitals & Context
  const [vitals, setVitals] = useState<VitalsData>({
    temperature: undefined,
    temperatureUnit: "C",
    heartRate: undefined,
    systolicBP: undefined,
    diastolicBP: undefined,
    respiratoryRate: undefined,
    oxygenSaturation: undefined,
  });

  const [context, setContext] = useState<ClinicalContext>({
    recentTravel: "",
    knownAllergies: profile?.allergies || [],
    chronicConditions: profile?.chronicConditions || [],
    currentMedications: profile?.currentMedications || [],
    pregnancyStatus: "Not Applicable",
  });

  // Step 4: Submission & Processing Experience Stages
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStage, setProcessingStage] = useState<number>(0);

  const processingStages = [
    "Encoding clinical symptoms & multi-system vectors...",
    "Validating physiological vitals & contraindications...",
    "Evaluating random forest diagnostic probabilities...",
    "Checking deterministic safety indicators & red flags...",
    "Determining clinical triage urgency & specialty match...",
    "Synthesizing clinical report & precautionary guidance...",
  ];

  useEffect(() => {
    symptomService
      .getAllSymptoms()
      .then((data) => setAllSymptoms(data))
      .catch((err) => console.error("Failed to fetch symptoms:", err));
  }, []);

  const categories = [
    "All",
    "General",
    "Respiratory",
    "Cardiovascular",
    "Gastrointestinal",
    "Neurological",
    "Musculoskeletal",
    "Dermatological",
    "Urinary",
    "ENT",
    "Other",
  ];

  // Filter symptoms
  const filteredSymptoms = allSymptoms.filter((s) => {
    const matchesCategory =
      categoryFilter === "All" || s.category === categoryFilter;
    const matchesSearch =
      s.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleSymptom = (symptom: Symptom) => {
    const exists = selectedSymptoms.find((s) => s.symptomId === symptom.symptomId);
    if (exists) {
      setSelectedSymptoms((prev) =>
        prev.filter((s) => s.symptomId !== symptom.symptomId)
      );
      // Remove from severityData
      const updated = { ...severityData };
      delete updated[symptom.symptomId];
      setSeverityData(updated);
    } else {
      setSelectedSymptoms((prev) => [...prev, symptom]);
      // Initialize default severity data
      setSeverityData((prev) => ({
        ...prev,
        [symptom.symptomId]: {
          symptomId: symptom.symptomId,
          severity: 5,
          duration: { value: 1, unit: "Days" },
          notes: "",
        },
      }));
    }
  };

  const handleSeverityChange = (symptomId: string, value: number) => {
    setSeverityData((prev) => ({
      ...prev,
      [symptomId]: {
        ...prev[symptomId],
        severity: value,
      },
    }));
  };

  const handleDurationChange = (
    symptomId: string,
    val: number,
    unit: "Hours" | "Days" | "Weeks" | "Months"
  ) => {
    setSeverityData((prev) => ({
      ...prev,
      [symptomId]: {
        ...prev[symptomId],
        duration: { value: val, unit },
      },
    }));
  };

  const handleNotesChange = (symptomId: string, notes: string) => {
    setSeverityData((prev) => ({
      ...prev,
      [symptomId]: {
        ...prev[symptomId],
        notes,
      },
    }));
  };

  const handleAutoSuggestSymptoms = (suggestedIds: string[]) => {
    setSuggestedSymptomsList(suggestedIds);
  };

  const handleApplyAllSuggestions = () => {
    const toAdd = allSymptoms.filter(
      (s) =>
        suggestedSymptomsList.includes(s.symptomId) &&
        !selectedSymptoms.some((sel) => sel.symptomId === s.symptomId)
    );
    if (toAdd.length > 0) {
      setSelectedSymptoms((prev) => [...prev, ...toAdd]);
      setSeverityData((prev) => {
        const next = { ...prev };
        toAdd.forEach((sym) => {
          next[sym.symptomId] = {
            symptomId: sym.symptomId,
            severity: 5,
            duration: { value: 1, unit: "Days" },
            notes: "Identified via clinical photography",
          };
        });
        return next;
      });
      showToast(`Added ${toAdd.length} suggested symptoms from photo.`, "info");
    }
  };

  const handleNextStep = () => {
    if (step === 1 && selectedSymptoms.length === 0 && !photoData) {
      showToast(
        "Please select at least one symptom or upload a clinical photo to proceed.",
        "warning"
      );
      return;
    }
    setStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const dynamicProcessingStages = photoData
    ? [
        "Scanning clinical photography, tissue erythema & lesion morphology...",
        "Encoding clinical symptoms & multi-system vectors...",
        "Validating physiological vitals & contraindications...",
        "Evaluating multi-modal computer vision & random forest probabilities...",
        "Checking deterministic safety indicators & red flags...",
        "Synthesizing clinical diagnostic report & visual findings...",
      ]
    : processingStages;

  const handleSubmitAssessment = async () => {
    setIsProcessing(true);
    setProcessingStage(0);

    // Staged processing simulation for clinical authenticity
    const stageInterval = setInterval(() => {
      setProcessingStage((prev) => {
        if (prev < dynamicProcessingStages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 700);

    try {
      const payload = {
        symptoms: selectedSymptoms.map((s) => s.symptomId),
        severityData: Object.values(severityData),
        vitals,
        context,
        photoData: photoData || undefined,
        photoMetadata: photoData ? photoMetadata : undefined,
      };

      const result = await assessmentService.createAssessment(payload);

      // Wait a moment so user sees the clinical pipeline stages
      setTimeout(() => {
        clearInterval(stageInterval);
        setIsProcessing(false);
        showToast("Clinical analysis complete.", "success");
        navigate(`/assessment/result/${result._id}`);
      }, 4200);
    } catch (err: any) {
      clearInterval(stageInterval);
      setIsProcessing(false);
      showToast(
        err.response?.data?.message || "Assessment processing encountered an error.",
        "error"
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Progress Stepper Header */}
      <div className="bg-white border border-clinical-border rounded-xl p-6 shadow-clinical">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-xs font-bold text-clinical-blue uppercase tracking-wider">
              Triage Protocol
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Symptom Triage & Analysis Wizard
            </h1>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
            <span>Step {step} of 4:</span>
            <span className="text-clinical-blue font-bold">
              {step === 1 && "Select Symptoms"}
              {step === 2 && "Severity & Timeline"}
              {step === 3 && "Vitals & Context"}
              {step === 4 && "Review & Submit"}
            </span>
          </div>
        </div>

        {/* Progress Bar Indicators */}
        <div className="mt-5 grid grid-cols-4 gap-2">
          {[
            { n: 1, label: "Symptoms" },
            { n: 2, label: "Severity" },
            { n: 3, label: "Vitals" },
            { n: 4, label: "Review" },
          ].map((s) => (
            <div key={s.n} className="flex flex-col gap-1">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  step >= s.n ? "bg-clinical-blue" : "bg-slate-200"
                }`}
              />
              <span
                className={`text-[11px] font-semibold hidden sm:inline ${
                  step === s.n
                    ? "text-clinical-blue"
                    : step > s.n
                    ? "text-slate-800"
                    : "text-slate-400"
                }`}
              >
                {s.n}. {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Processing Screen Overlay Modal */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-slate-100 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-full border-4 border-clinical-light border-t-clinical-blue animate-spin" />
              <Activity className="w-8 h-8 text-clinical-blue absolute inset-0 m-auto animate-pulse" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Evaluating Clinical Probabilities
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Please wait while our clinical inference model processes your physiological profile.
              </p>
            </div>

            {/* Pipeline Stage Checklist */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2.5">
              {dynamicProcessingStages.map((stageText, idx) => {
                const isPassed = processingStage > idx;
                const isCurrent = processingStage === idx;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 text-xs transition-colors ${
                      isPassed
                        ? "text-emerald-700 font-medium"
                        : isCurrent
                        ? "text-clinical-blue font-bold"
                        : "text-slate-400"
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-clinical-blue animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" />
                    )}
                    <span className="truncate">{stageText}</span>
                  </div>
                );
              })}
            </div>

            <div className="text-[11px] text-slate-400 italic">
              Applying deterministic emergency triage safety rules...
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: SELECT SYMPTOMS */}
      {step === 1 && (
        <div className="bg-white border border-clinical-border rounded-xl p-6 shadow-clinical space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Step 1: Select Your Current Symptoms
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose all physiological sensations you are currently experiencing, or optionally upload a photo of your visible condition below.
            </p>
          </div>

          {/* Optional Clinical Photography & Disease Image Intake */}
          <ClinicalPhotoUpload
            photoData={photoData}
            photoMetadata={photoMetadata}
            onPhotoChange={(data, meta) => {
              setPhotoData(data);
              setPhotoMetadata(meta);
            }}
            onAutoSuggestSymptoms={handleAutoSuggestSymptoms}
          />

          {/* AI Suggested Symptoms Banner (when photo is active and has suggestions) */}
          {photoData && suggestedSymptomsList.length > 0 && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-clinical-blue" />
                  AI Suggested Symptoms for {photoMetadata.bodyArea}:
                </span>
                <button
                  type="button"
                  onClick={handleApplyAllSuggestions}
                  className="text-[11px] font-bold text-clinical-blue hover:underline"
                >
                  + Add All Suggestions
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestedSymptomsList.map((sId) => {
                  const sym = allSymptoms.find((s) => s.symptomId === sId);
                  if (!sym) return null;
                  const isAdded = selectedSymptoms.some((s) => s.symptomId === sId);
                  return (
                    <button
                      key={sId}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 border transition-colors ${
                        isAdded
                          ? "bg-clinical-blue text-white border-clinical-blue shadow-2xs"
                          : "bg-white text-blue-900 border-blue-200 hover:bg-blue-100/50"
                      }`}
                    >
                      {isAdded ? <Check className="w-3 h-3" /> : "+"}
                      <span>{sym.displayName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search & Category Filter Controls */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search symptom by name (e.g. fever, cough, chest pain, nausea)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    categoryFilter === cat
                      ? "bg-clinical-blue text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Symptoms Tray */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Selected Symptoms ({selectedSymptoms.length})
              </span>
              {selectedSymptoms.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedSymptoms([])}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Clear all
                </button>
              )}
            </div>

            {selectedSymptoms.length === 0 ? (
              <div className="p-4 border border-dashed border-slate-300 rounded-lg text-center text-xs text-slate-400">
                No symptoms selected. Click from the catalog below to add symptoms.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                {selectedSymptoms.map((s) => (
                  <SymptomChip
                    key={s.symptomId}
                    symptom={s}
                    selected={true}
                    onRemove={() => toggleSymptom(s)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Available Symptoms Grid */}
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Clinical Catalog ({filteredSymptoms.length} available)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
              {filteredSymptoms.map((sym) => {
                const isSelected = selectedSymptoms.some(
                  (s) => s.symptomId === sym.symptomId
                );
                return (
                  <div
                    key={sym.symptomId}
                    onClick={() => toggleSymptom(sym)}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? "border-clinical-blue bg-clinical-light shadow-xs"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/80"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-semibold ${
                            isSelected ? "text-clinical-blue" : "text-slate-800"
                          }`}
                        >
                          {sym.displayName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {sym.description}
                      </p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center mt-0.5 flex-shrink-0 ${
                        isSelected
                          ? "bg-clinical-blue border-clinical-blue text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={handleNextStep}
              disabled={selectedSymptoms.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-clinical-blue hover:bg-clinical-dark text-white font-bold rounded-lg shadow-sm disabled:opacity-50 transition-colors"
            >
              <span>Continue to Severity</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SEVERITY & TIMELINE */}
      {step === 2 && (
        <div className="bg-white border border-clinical-border rounded-xl p-6 shadow-clinical space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Step 2: Symptom Severity & Duration Timeline
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify intensity (scale 1–10) and duration for each reported symptom.
            </p>
          </div>

          {selectedSymptoms.length === 0 && photoData ? (
            <div className="p-6 bg-blue-50/70 border border-blue-200 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 bg-white rounded-xl border border-blue-200 text-clinical-blue flex items-center justify-center mx-auto shadow-2xs">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Visual Photography Input Active
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  You have attached a clinical photo for <span className="font-semibold text-clinical-blue">{photoMetadata.bodyArea}</span>. MedPulse will evaluate lesion morphology, tissue erythema, and surface texture directly from the image. You may proceed directly to Vitals & Review.
                </p>
              </div>
              <span className="inline-block px-3 py-1 bg-white border border-blue-200 text-blue-900 rounded-full text-xs font-semibold">
                Photo: {photoMetadata.fileName || "clinical_photo.jpg"}
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedSymptoms.map((sym) => {
              const currentData = severityData[sym.symptomId] || {
                symptomId: sym.symptomId,
                severity: 5,
                duration: { value: 1, unit: "Days" },
                notes: "",
              };

              const sev = Number(currentData.severity);

              return (
                <div
                  key={sym.symptomId}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">
                        {sym.displayName}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Category: {sym.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-500">
                        Severity:
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          sev >= 8
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : sev >= 4
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {sev}/10 (
                        {sev >= 8 ? "Severe" : sev >= 4 ? "Moderate" : "Mild"})
                      </span>
                    </div>
                  </div>

                  {/* Severity Slider */}
                  <div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={sev}
                      onChange={(e) =>
                        handleSeverityChange(sym.symptomId, Number(e.target.value))
                      }
                      className="w-full accent-clinical-blue cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>1 - Minimal</span>
                      <span>5 - Moderate discomfort</span>
                      <span>10 - Incapacitating</span>
                    </div>
                  </div>

                  {/* Duration Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Duration Length
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={1}
                          max={365}
                          value={currentData.duration?.value || 1}
                          onChange={(e) =>
                            handleDurationChange(
                              sym.symptomId,
                              Number(e.target.value),
                              currentData.duration?.unit || "Days"
                            )
                          }
                          className="w-24 text-sm rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-clinical-blue focus:outline-hidden bg-white"
                        />
                        <select
                          value={currentData.duration?.unit || "Days"}
                          onChange={(e) =>
                            handleDurationChange(
                              sym.symptomId,
                              currentData.duration?.value || 1,
                              e.target.value as any
                            )
                          }
                          className="flex-1 text-sm rounded-lg border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
                        >
                          <option value="Hours">Hours</option>
                          <option value="Days">Days</option>
                          <option value="Weeks">Weeks</option>
                          <option value="Months">Months</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Symptom Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={currentData.notes || ""}
                        onChange={(e) =>
                          handleNotesChange(sym.symptomId, e.target.value)
                        }
                        placeholder="e.g. sharp stabbing, worse at night"
                        className="w-full text-sm rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-clinical-blue focus:outline-hidden bg-white"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

          <div className="pt-4 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              onClick={handlePrevStep}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-clinical-blue hover:bg-clinical-dark text-white font-bold rounded-lg shadow-sm transition-colors"
            >
              <span>Continue to Vitals & Context</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: VITALS & CLINICAL CONTEXT */}
      {step === 3 && (
        <div className="bg-white border border-clinical-border rounded-xl p-6 shadow-clinical space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Step 3: Vital Signs & Clinical Context (Optional)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Entering vitals enables safety cross-checks against physiological thresholds (SpO2, Blood Pressure, Heart Rate).
            </p>
          </div>

          {/* Vitals Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Body Temperature */}
            <div className="p-3.5 border border-slate-200 rounded-lg bg-slate-50/50">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-rose-500" />
                Body Temperature
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={vitals.temperature || ""}
                  onChange={(e) =>
                    setVitals({
                      ...vitals,
                      temperature: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="37.0"
                  className="w-full text-sm rounded-lg border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
                />
                <select
                  value={vitals.temperatureUnit}
                  onChange={(e) =>
                    setVitals({
                      ...vitals,
                      temperatureUnit: e.target.value as "C" | "F",
                    })
                  }
                  className="text-sm rounded-lg border border-slate-300 p-2 bg-white"
                >
                  <option value="C">°C</option>
                  <option value="F">°F</option>
                </select>
              </div>
            </div>

            {/* Heart Rate */}
            <div className="p-3.5 border border-slate-200 rounded-lg bg-slate-50/50">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500" />
                Heart Rate (BPM)
              </label>
              <input
                type="number"
                value={vitals.heartRate || ""}
                onChange={(e) =>
                  setVitals({
                    ...vitals,
                    heartRate: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="e.g. 75"
                className="w-full text-sm rounded-lg border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
              />
            </div>

            {/* Oxygen Saturation */}
            <div className="p-3.5 border border-slate-200 rounded-lg bg-slate-50/50">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-clinical-blue" />
                Oxygen Saturation (SpO2 %)
              </label>
              <input
                type="number"
                min={50}
                max={100}
                value={vitals.oxygenSaturation || ""}
                onChange={(e) =>
                  setVitals({
                    ...vitals,
                    oxygenSaturation: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="e.g. 98"
                className="w-full text-sm rounded-lg border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Normal range: 95%–100%
              </span>
            </div>

            {/* Systolic Blood Pressure */}
            <div className="p-3.5 border border-slate-200 rounded-lg bg-slate-50/50">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Systolic BP (mmHg)
              </label>
              <input
                type="number"
                value={vitals.systolicBP || ""}
                onChange={(e) =>
                  setVitals({
                    ...vitals,
                    systolicBP: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="e.g. 120"
                className="w-full text-sm rounded-lg border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
              />
            </div>

            {/* Diastolic Blood Pressure */}
            <div className="p-3.5 border border-slate-200 rounded-lg bg-slate-50/50">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Diastolic BP (mmHg)
              </label>
              <input
                type="number"
                value={vitals.diastolicBP || ""}
                onChange={(e) =>
                  setVitals({
                    ...vitals,
                    diastolicBP: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="e.g. 80"
                className="w-full text-sm rounded-lg border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
              />
            </div>

            {/* Respiratory Rate */}
            <div className="p-3.5 border border-slate-200 rounded-lg bg-slate-50/50">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-sky-500" />
                Respiratory Rate (Breaths/min)
              </label>
              <input
                type="number"
                value={vitals.respiratoryRate || ""}
                onChange={(e) =>
                  setVitals({
                    ...vitals,
                    respiratoryRate: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="e.g. 16"
                className="w-full text-sm rounded-lg border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
              />
            </div>
          </div>

          {/* Contextual Questions */}
          <div className="border-t border-slate-100 pt-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Clinical Context & Epidemiological Factors
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recent International or Endemic Travel
                </label>
                <input
                  type="text"
                  value={context.recentTravel || ""}
                  onChange={(e) =>
                    setContext({ ...context, recentTravel: e.target.value })
                  }
                  placeholder="e.g. None, or Travel to tropical region 10 days ago"
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pregnancy Status
                </label>
                <select
                  value={context.pregnancyStatus}
                  onChange={(e) =>
                    setContext({ ...context, pregnancyStatus: e.target.value })
                  }
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
                >
                  <option value="Not Applicable">Not Applicable</option>
                  <option value="Not Pregnant">Not Pregnant</option>
                  <option value="Pregnant (First Trimester)">Pregnant (First Trimester)</option>
                  <option value="Pregnant (Second Trimester)">Pregnant (Second Trimester)</option>
                  <option value="Pregnant (Third Trimester)">Pregnant (Third Trimester)</option>
                  <option value="Postpartum">Postpartum</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              onClick={handlePrevStep}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-clinical-blue hover:bg-clinical-dark text-white font-bold rounded-lg shadow-sm transition-colors"
            >
              <span>Review Assessment</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & SUBMIT */}
      {step === 4 && (
        <div className="bg-white border border-clinical-border rounded-xl p-6 shadow-clinical space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Step 4: Clinical Summary Review & Verification
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify your clinical indicators before transmitting to the AI triage engine.
            </p>
          </div>

          {/* Patient Header Summary */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-slate-900">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-slate-500 ml-2">
                (Age: {profile?.age || 42} • Gender: {profile?.gender || "Male"} • Blood: {profile?.bloodGroup || "O+"})
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">
                BMI: {profile?.bmi || "25.9"} ({profile?.bmiCategory || "Normal"})
              </span>
            </div>
          </div>

          {/* Attached Clinical Photography Review (Optional) */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-clinical-blue" />
                Attached Clinical Photography (Optional)
              </h3>
              {photoData ? (
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                  Visual Evidence Attached
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 italic">None attached (Optional)</span>
              )}
            </div>

            {photoData ? (
              <div className="flex items-start gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <img
                  src={photoData}
                  alt="Thumbnail preview"
                  className="w-16 h-16 object-cover rounded-lg border border-slate-300 shadow-2xs shrink-0"
                />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-slate-900">
                    {photoMetadata.fileName || "Clinical Disease Photo"}
                  </div>
                  <div className="text-slate-600">
                    Anatomical Site:{" "}
                    <span className="font-semibold text-clinical-blue">
                      {photoMetadata.bodyArea}
                    </span>
                  </div>
                  {photoMetadata.notes && (
                    <div className="text-slate-500 italic">
                      "{photoMetadata.notes}"
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic">
                No disease photo attached. Assessment will evaluate reported symptoms, severity, and physiological vitals.
              </div>
            )}
          </div>

          {/* Selected Symptoms Review */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Selected Symptoms & Severity Breakdown
            </h3>
            {selectedSymptoms.length === 0 ? (
              <div className="p-3 text-xs text-slate-500 italic bg-slate-50 border border-slate-200 rounded-lg">
                No manual symptoms selected. Assessment driven primarily by attached clinical photography.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {selectedSymptoms.map((sym) => {
                  const sData = severityData[sym.symptomId];
                  return (
                    <div
                      key={sym.symptomId}
                      className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-900">
                          {sym.displayName}
                        </span>
                        {sData?.notes && (
                          <span className="text-slate-500 italic ml-2">
                            — "{sData.notes}"
                          </span>
                        )}
                      </div>
                      <div className="text-slate-600 font-medium">
                        Severity: <span className="font-bold text-slate-800">{sData?.severity}/10</span> | Duration:{" "}
                        <span className="font-bold text-slate-800">
                          {sData?.duration?.value} {sData?.duration?.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Vitals Summary */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Recorded Vital Signs
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Temp</span>
                <span className="font-bold text-slate-800">
                  {vitals.temperature ? `${vitals.temperature}°${vitals.temperatureUnit}` : "Not entered"}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Heart Rate</span>
                <span className="font-bold text-slate-800">
                  {vitals.heartRate ? `${vitals.heartRate} bpm` : "Not entered"}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px]">SpO2 Saturation</span>
                <span className="font-bold text-slate-800">
                  {vitals.oxygenSaturation ? `${vitals.oxygenSaturation}%` : "Not entered"}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Blood Pressure</span>
                <span className="font-bold text-slate-800">
                  {vitals.systolicBP && vitals.diastolicBP
                    ? `${vitals.systolicBP}/${vitals.diastolicBP} mmHg`
                    : "Not entered"}
                </span>
              </div>
            </div>
          </div>

          {/* Confirmation Box */}
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-xs text-sky-950 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-sky-700 flex-shrink-0 mt-0.5" />
            <p>
              By clicking "Analyze Symptoms", you confirm this information will be evaluated by MedPulse's machine learning model and deterministic safety layer. This does not replace formal clinical diagnosis.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              onClick={handlePrevStep}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmitAssessment}
              className="inline-flex items-center gap-2 px-8 py-3 bg-clinical-blue hover:bg-clinical-dark text-white font-bold rounded-lg shadow-clinical-md text-sm transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{photoData ? "Analyze Symptoms & Clinical Photo" : "Analyze Symptoms"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
