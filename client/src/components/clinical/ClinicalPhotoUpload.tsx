import React, { useRef, useState } from "react";
import { PhotoMetadata } from "../../types";
import {
  Camera,
  UploadCloud,
  X,
  FileImage,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
  Info,
  ZoomIn,
} from "lucide-react";

interface ClinicalPhotoUploadProps {
  photoData: string | null;
  photoMetadata: PhotoMetadata;
  onPhotoChange: (photoData: string | null, metadata: PhotoMetadata) => void;
  onAutoSuggestSymptoms?: (suggestedSymptoms: string[]) => void;
}

export const ClinicalPhotoUpload: React.FC<ClinicalPhotoUploadProps> = ({
  photoData,
  photoMetadata,
  onPhotoChange,
  onAutoSuggestSymptoms,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [previewZoom, setPreviewZoom] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const bodyAreaOptions = [
    "Dermatological / Skin (General)",
    "Face & Neck",
    "Hands, Wrists & Forearms",
    "Torso, Chest & Abdomen",
    "Lower Extremities (Legs & Feet)",
    "Ocular / Eye Region",
    "Oral / Throat Region",
    "Wound / Post-Trauma Area",
    "Other Anatomical Site",
  ];

  const handleFileProcess = (file: File) => {
    setUploadError(null);

    // Validate type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload a valid image file (JPEG, PNG, WEBP).");
      return;
    }

    // Limit to 15MB
    if (file.size > 15 * 1024 * 1024) {
      setUploadError("Image size exceeds 15MB. Please choose a smaller photo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const updatedMeta: PhotoMetadata = {
        ...photoMetadata,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        bodyArea: photoMetadata.bodyArea || "Dermatological / Skin (General)",
      };
      onPhotoChange(result, updatedMeta);

      // Auto-suggest relevant symptoms based on filename / body area
      if (onAutoSuggestSymptoms) {
        suggestMatchingSymptoms(file.name, updatedMeta.bodyArea || "");
      }
    };
    reader.onerror = () => {
      setUploadError("Failed to read the selected image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleRemovePhoto = () => {
    onPhotoChange(null, {
      fileName: undefined,
      fileType: undefined,
      fileSize: undefined,
      bodyArea: "Dermatological / Skin (General)",
      notes: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBodyAreaChange = (val: string) => {
    const updated = { ...photoMetadata, bodyArea: val };
    onPhotoChange(photoData, updated);
    if (onAutoSuggestSymptoms) {
      suggestMatchingSymptoms(photoMetadata.fileName || "", val);
    }
  };

  const handleNotesChange = (val: string) => {
    onPhotoChange(photoData, { ...photoMetadata, notes: val });
  };

  const suggestMatchingSymptoms = (name: string, area: string) => {
    const n = (name + " " + area).toLowerCase();
    const suggestions: string[] = [];

    if (n.includes("eye") || n.includes("ocular") || n.includes("conjunctiv")) {
      suggestions.push("blurred_vision", "headache");
    } else if (n.includes("acne") || n.includes("face")) {
      suggestions.push("skin_rash", "skin_lesions");
    } else if (n.includes("chickenpox") || n.includes("blister") || n.includes("varicella")) {
      suggestions.push("skin_rash", "itching", "red_spots", "skin_lesions", "fever");
    } else if (n.includes("psoriasis") || n.includes("plaque") || n.includes("scale")) {
      suggestions.push("skin_rash", "itching", "skin_lesions");
    } else {
      suggestions.push("skin_rash", "itching", "skin_lesions");
    }

    onAutoSuggestSymptoms?.(suggestions);
  };

  // Generate synthetic sample photo for instant testing demonstration
  const handleLoadDemoSample = (
    sampleType: "eczema" | "psoriasis" | "chickenpox" | "ringworm" | "acne"
  ) => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Skin baseline background
    const bgGrad = ctx.createRadialGradient(200, 200, 20, 200, 200, 220);
    bgGrad.addColorStop(0, "#f3d1b8");
    bgGrad.addColorStop(1, "#dfb398");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 400, 400);

    let sampleName = "clinical_sample.jpg";
    let bodyArea = "Dermatological / Skin (General)";
    let sampleNotes = "";

    if (sampleType === "eczema") {
      sampleName = "sample_eczema_erythematous_patch.jpg";
      bodyArea = "Hands, Wrists & Forearms";
      sampleNotes = "Pruritic erythematous dry patch with superficial skin flaking on flexor surface.";
      // Draw erythematous eczema patch
      const patchGrad = ctx.createRadialGradient(200, 200, 10, 200, 200, 140);
      patchGrad.addColorStop(0, "rgba(225, 60, 60, 0.85)");
      patchGrad.addColorStop(0.6, "rgba(235, 90, 90, 0.55)");
      patchGrad.addColorStop(1, "rgba(240, 150, 130, 0)");
      ctx.fillStyle = patchGrad;
      ctx.beginPath();
      ctx.ellipse(200, 200, 130, 110, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();

      // Dry scaly flecks
      ctx.fillStyle = "rgba(255, 245, 235, 0.7)";
      for (let i = 0; i < 45; i++) {
        const x = 140 + Math.random() * 120;
        const y = 140 + Math.random() * 120;
        ctx.fillRect(x, y, 2 + Math.random() * 4, 1 + Math.random() * 2);
      }
    } else if (sampleType === "psoriasis") {
      sampleName = "sample_psoriasis_silvery_plaque.jpg";
      bodyArea = "Torso, Chest & Abdomen";
      sampleNotes = "Elevated thick red plaque with distinct micaceous silvery-white hyperkeratotic scale.";
      // Red indurated base
      ctx.fillStyle = "rgba(200, 35, 35, 0.85)";
      ctx.beginPath();
      ctx.roundRect(110, 110, 180, 170, 40);
      ctx.fill();

      // Silvery scales on top
      ctx.fillStyle = "rgba(245, 245, 250, 0.82)";
      ctx.beginPath();
      ctx.roundRect(130, 130, 140, 130, 25);
      ctx.fill();

      // Textured micaceous flakes
      ctx.strokeStyle = "rgba(210, 210, 220, 0.9)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        const startX = 145 + Math.random() * 100;
        const startY = 145 + Math.random() * 95;
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + 10 + Math.random() * 20, startY + (Math.random() - 0.5) * 10);
        ctx.stroke();
      }
    } else if (sampleType === "chickenpox") {
      sampleName = "sample_chickenpox_vesicles.jpg";
      bodyArea = "Torso, Chest & Abdomen";
      sampleNotes = "Clusters of small itchy red bumps and clear fluid-filled vesicles on erythematous bases.";
      // Draw multiple papulovesicles
      for (let i = 0; i < 16; i++) {
        const cx = 80 + Math.random() * 240;
        const cy = 80 + Math.random() * 240;
        // Red erythematous halo
        ctx.fillStyle = "rgba(235, 45, 45, 0.75)";
        ctx.beginPath();
        ctx.arc(cx, cy, 14 + Math.random() * 8, 0, Math.PI * 2);
        ctx.fill();
        // Central clear dewdrop vesicle
        ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
        ctx.beginPath();
        ctx.arc(cx - 1, cy - 1, 6 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (sampleType === "ringworm") {
      sampleName = "sample_tinea_annular_ring.jpg";
      bodyArea = "Hands, Wrists & Forearms";
      sampleNotes = "Circular annular lesion with raised scaly red border and pale clear center.";
      // Annular ring with clear center
      ctx.strokeStyle = "rgba(215, 40, 40, 0.85)";
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.arc(200, 200, 85, 0, Math.PI * 2);
      ctx.stroke();

      // Outer scaly edge
      ctx.strokeStyle = "rgba(240, 180, 140, 0.9)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(200, 200, 96, 0, Math.PI * 2);
      ctx.stroke();
    } else if (sampleType === "acne") {
      sampleName = "sample_acne_facial_pustules.jpg";
      bodyArea = "Face & Neck";
      sampleNotes = "Inflammatory follicular papules, closed comedones, and pustules on cheek and jawline.";
      for (let i = 0; i < 14; i++) {
        const cx = 90 + Math.random() * 220;
        const cy = 90 + Math.random() * 220;
        // Red papule
        ctx.fillStyle = "rgba(220, 50, 50, 0.8)";
        ctx.beginPath();
        ctx.arc(cx, cy, 11 + Math.random() * 5, 0, Math.PI * 2);
        ctx.fill();
        // White pustule center
        if (i % 2 === 0) {
          ctx.fillStyle = "rgba(255, 250, 210, 0.95)";
          ctx.beginPath();
          ctx.arc(cx, cy, 4 + Math.random() * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    const updatedMeta: PhotoMetadata = {
      fileName: sampleName,
      fileType: "image/jpeg",
      fileSize: 48500,
      bodyArea,
      notes: sampleNotes,
    };

    onPhotoChange(dataUrl, updatedMeta);
    if (onAutoSuggestSymptoms) {
      suggestMatchingSymptoms(sampleName, bodyArea);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-clinical-blue flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Clinical Photography & Visual Input
              </h3>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Optional
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload a clear photo of your skin rash, lesion, eye, or visible symptom for multi-modal AI prediction.
            </p>
          </div>
        </div>

        {photoData && (
          <button
            type="button"
            onClick={handleRemovePhoto}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold transition-colors self-start sm:self-center"
          >
            <X className="w-3.5 h-3.5" />
            Remove Photo
          </button>
        )}
      </div>

      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Main Upload Box / Drag & Drop or Active Preview */}
      {!photoData ? (
        <div className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-clinical-blue bg-blue-50/70 scale-[0.99]"
                : "border-slate-300 hover:border-clinical-blue/60 hover:bg-slate-50/80 bg-slate-50/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-clinical-blue shadow-xs flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-7 h-7" />
            </div>

            <h4 className="text-sm font-bold text-slate-800">
              Click to select photo or drag and drop here
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Supports JPEG, PNG, WEBP high-resolution clinical images (up to 15MB).
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-clinical-blue text-white rounded-lg text-xs font-bold shadow-xs hover:bg-clinical-dark transition-colors">
              <Camera className="w-4 h-4" />
              Browse Photo
            </div>
          </div>

          {/* Quick Demo Sample Photos for Instant 1-Click Testing */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-clinical-blue" />
                Quick Clinical Demo Samples (1-Click Test):
              </span>
              <span className="text-[11px] text-slate-400">
                Don't have a photo? Click any sample to test
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: "eczema", label: "Eczema / Rash", color: "hover:border-rose-300 hover:bg-rose-50/50" },
                { id: "psoriasis", label: "Psoriasis Plaque", color: "hover:border-amber-300 hover:bg-amber-50/50" },
                { id: "chickenpox", label: "Chickenpox", color: "hover:border-indigo-300 hover:bg-indigo-50/50" },
                { id: "ringworm", label: "Ringworm (Tinea)", color: "hover:border-emerald-300 hover:bg-emerald-50/50" },
                { id: "acne", label: "Acne Vulgaris", color: "hover:border-cyan-300 hover:bg-cyan-50/50" },
              ].map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleLoadDemoSample(sample.id as any)}
                  className={`p-2.5 text-center bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-all shadow-2xs ${sample.color}`}
                >
                  <span className="block truncate font-bold text-slate-800">{sample.label}</span>
                  <span className="text-[10px] text-clinical-blue font-medium mt-0.5 block">
                    Load Sample
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Photo Attached & Preview Card */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* Image Preview with Viewfinder Crosshair Styling */}
            <div className="md:col-span-5 relative group bg-slate-900 rounded-xl overflow-hidden border border-slate-300 shadow-md aspect-4/3 sm:aspect-square flex items-center justify-center">
              <img
                src={photoData}
                alt="Clinical disease evidence"
                className="w-full h-full object-cover"
              />

              {/* Viewfinder crosshairs overlay for high-tech clinical diagnostic look */}
              <div className="absolute inset-0 pointer-events-none border border-white/20 m-3 rounded-lg flex items-center justify-center">
                <div className="w-8 h-0.5 bg-white/40" />
                <div className="h-8 w-0.5 bg-white/40 -ml-4" />
                <span className="absolute top-2 left-2 text-[9px] font-mono font-bold text-white/80 bg-slate-950/60 px-1.5 py-0.5 rounded">
                  MED-VISION 2.0
                </span>
                <span className="absolute bottom-2 right-2 text-[9px] font-mono text-emerald-300 bg-slate-950/60 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  CALIBRATED
                </span>
              </div>

              {/* Hover Actions Bar */}
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewZoom(true)}
                  className="px-3 py-1.5 bg-white/90 hover:bg-white text-slate-900 rounded-lg text-xs font-bold shadow-md flex items-center gap-1"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  Expand
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Replace
                </button>
              </div>
            </div>

            {/* Photo Metadata & Anatomical Details Fields */}
            <div className="md:col-span-7 space-y-3.5">
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileImage className="w-4 h-4 text-clinical-blue shrink-0" />
                  <span className="font-bold text-slate-800 truncate">
                    {photoMetadata.fileName || "Uploaded Clinical Photo"}
                  </span>
                </div>
                <span className="text-slate-500 font-medium shrink-0 ml-2">
                  {formatFileSize(photoMetadata.fileSize)}
                </span>
              </div>

              {/* Body Area Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Affected Body Area / Anatomical Location:
                </label>
                <select
                  value={photoMetadata.bodyArea || "Dermatological / Skin (General)"}
                  onChange={(e) => handleBodyAreaChange(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-clinical-blue focus:border-clinical-blue"
                >
                  {bodyAreaOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Visual Clinical Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Visual Clinical Notes (Optional):
                </label>
                <textarea
                  rows={2}
                  value={photoMetadata.notes || ""}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="e.g. Started 3 days ago, slightly itchy, feels dry with slight flaking on the edge..."
                  className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-clinical-blue focus:border-clinical-blue resize-none"
                />
              </div>

              {/* AI Visual Scan Status Badge */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Photo ready for multi-modal inference. AI will analyze tissue erythema & lesion morphology upon submission.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input for Replace action */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileProcess(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* Modal Zoom View */}
      {previewZoom && photoData && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewZoom(false)}
        >
          <div
            className="relative max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-white/20 shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 text-white">
              <span className="text-xs font-bold font-mono">
                {photoMetadata.fileName || "Clinical Photography"} ({photoMetadata.bodyArea})
              </span>
              <button
                type="button"
                onClick={() => setPreviewZoom(false)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={photoData}
              alt="High-resolution clinical view"
              className="max-h-[70vh] w-auto mx-auto rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
