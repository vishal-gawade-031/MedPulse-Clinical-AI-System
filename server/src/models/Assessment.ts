import mongoose, { Schema, Document } from "mongoose";

export interface ISeverityItem {
  symptomId: string;
  severity: number | string; // 1-10 or "Mild" | "Moderate" | "Severe"
  duration: {
    value: number;
    unit: "Hours" | "Days" | "Weeks" | "Months";
  };
  notes?: string;
}

export interface IVitals {
  temperature?: number;
  temperatureUnit?: "C" | "F";
  heartRate?: number;
  systolicBP?: number;
  diastolicBP?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
}

export interface IContext {
  recentTravel?: string;
  knownAllergies?: string[];
  chronicConditions?: string[];
  currentMedications?: string[];
  pregnancyStatus?: string;
}

export interface IPredictionItem {
  disease: string;
  confidence: number;
  relevantSymptoms: string[];
}

export interface IPhotoMetadata {
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  bodyArea?: string;
  notes?: string;
  resolution?: string;
}

export interface IVisualDifferential {
  disease: string;
  confidence: number;
  matchingVisualMarkers: string[];
}

export interface IVisualAnalysis {
  hasPhoto: boolean;
  analyzedAt?: string;
  bodyArea?: string;
  notes?: string;
  detectedFeatures: string[];
  suspectedCondition: string;
  visualConfidence: number;
  visualUrgency: "Low" | "Medium" | "High";
  visualSeverityScore: number;
  erythemaLevel?: "Mild" | "Moderate" | "Marked" | "Severe";
  differentialDiagnoses: IVisualDifferential[];
  recommendations: string[];
}

export interface IAssessment extends Document {
  userId: mongoose.Types.ObjectId;
  symptoms: string[];
  severityData: ISeverityItem[];
  vitals: IVitals;
  context?: IContext;
  photoData?: string;
  photoMetadata?: IPhotoMetadata;
  visualAnalysis?: IVisualAnalysis;
  predictions: IPredictionItem[];
  specialty: string;
  urgency: "Low" | "Medium" | "High";
  isRedFlag: boolean;
  redFlags: string[];
  generalCareAdvice: string[];
  precautions: string[];
  dietaryRecommendations: string[];
  modelVersion: string;
  status: "Submitted" | "AI Analyzed" | "Reviewed" | "Follow-up Required" | "Closed";
  doctorNotes?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    symptoms: [{ type: String, required: true }],
    severityData: [
      {
        symptomId: { type: String, required: true },
        severity: { type: Schema.Types.Mixed, default: 5 },
        duration: {
          value: { type: Number, default: 1 },
          unit: {
            type: String,
            enum: ["Hours", "Days", "Weeks", "Months"],
            default: "Days",
          },
        },
        notes: { type: String },
      },
    ],
    vitals: {
      temperature: { type: Number },
      temperatureUnit: { type: String, enum: ["C", "F"], default: "C" },
      heartRate: { type: Number },
      systolicBP: { type: Number },
      diastolicBP: { type: Number },
      respiratoryRate: { type: Number },
      oxygenSaturation: { type: Number },
    },
    context: {
      recentTravel: { type: String },
      knownAllergies: [{ type: String }],
      chronicConditions: [{ type: String }],
      currentMedications: [{ type: String }],
      pregnancyStatus: { type: String },
    },
    photoData: { type: String },
    photoMetadata: {
      fileName: { type: String },
      fileType: { type: String },
      fileSize: { type: Number },
      bodyArea: { type: String },
      notes: { type: String },
      resolution: { type: String },
    },
    visualAnalysis: {
      hasPhoto: { type: Boolean, default: false },
      analyzedAt: { type: String },
      bodyArea: { type: String },
      notes: { type: String },
      detectedFeatures: [{ type: String }],
      suspectedCondition: { type: String },
      visualConfidence: { type: Number },
      visualUrgency: { type: String, enum: ["Low", "Medium", "High"] },
      visualSeverityScore: { type: Number },
      erythemaLevel: { type: String },
      differentialDiagnoses: [
        {
          disease: { type: String },
          confidence: { type: Number },
          matchingVisualMarkers: [{ type: String }],
        },
      ],
      recommendations: [{ type: String }],
    },
    predictions: [
      {
        disease: { type: String, required: true, index: true },
        confidence: { type: Number, required: true },
        relevantSymptoms: [{ type: String }],
      },
    ],
    specialty: { type: String, required: true },
    urgency: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
      required: true,
      index: true,
    },
    isRedFlag: { type: Boolean, default: false },
    redFlags: [{ type: String }],
    generalCareAdvice: [{ type: String }],
    precautions: [{ type: String }],
    dietaryRecommendations: [{ type: String }],
    modelVersion: { type: String, default: "medpulse-rf-1.0.0" },
    status: {
      type: String,
      enum: ["Submitted", "AI Analyzed", "Reviewed", "Follow-up Required", "Closed"],
      default: "AI Analyzed",
      required: true,
      index: true,
    },
    doctorNotes: { type: String, default: "" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

// MongoDB compound and single indexes
AssessmentSchema.index({ createdAt: -1 });
AssessmentSchema.index({ userId: 1, createdAt: -1 });
AssessmentSchema.index({ urgency: 1, status: 1 });

export const Assessment = mongoose.model<IAssessment>(
  "Assessment",
  AssessmentSchema
);
