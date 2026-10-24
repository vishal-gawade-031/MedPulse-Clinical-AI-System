export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "PATIENT" | "ADMIN";
  phone?: string;
  lastLogin?: string;
}

export interface PatientProfile {
  _id?: string;
  userId: string;
  dateOfBirth?: string;
  age?: number;
  gender: "Male" | "Female" | "Other" | "Prefer not to say";
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | "Unknown";
  height: number;
  weight: number;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  bmi?: number;
  bmiCategory?: string;
}

export interface Symptom {
  _id?: string;
  symptomId: string;
  name: string;
  displayName: string;
  category:
    | "General"
    | "Respiratory"
    | "Cardiovascular"
    | "Gastrointestinal"
    | "Neurological"
    | "Musculoskeletal"
    | "Dermatological"
    | "Urinary"
    | "ENT"
    | "Other";
  description: string;
  isRedFlagIndicator?: boolean;
}

export interface SeverityItem {
  symptomId: string;
  severity: number | string;
  duration: {
    value: number;
    unit: "Hours" | "Days" | "Weeks" | "Months";
  };
  notes?: string;
}

export interface VitalsData {
  temperature?: number;
  temperatureUnit?: "C" | "F";
  heartRate?: number;
  systolicBP?: number;
  diastolicBP?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
}

export interface ClinicalContext {
  recentTravel?: string;
  knownAllergies?: string[];
  chronicConditions?: string[];
  currentMedications?: string[];
  pregnancyStatus?: string;
}

export interface PredictionItem {
  disease: string;
  confidence: number;
  relevantSymptoms: string[];
}

export interface PhotoMetadata {
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  bodyArea?: string;
  notes?: string;
  resolution?: string;
}

export interface VisualDifferential {
  disease: string;
  confidence: number;
  matchingVisualMarkers: string[];
}

export interface VisualAnalysis {
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
  differentialDiagnoses: VisualDifferential[];
  recommendations: string[];
}

export interface Assessment {
  _id: string;
  userId: User | string;
  symptoms: string[];
  severityData: SeverityItem[];
  vitals: VitalsData;
  context?: ClinicalContext;
  photoData?: string;
  photoMetadata?: PhotoMetadata;
  visualAnalysis?: VisualAnalysis;
  predictions: PredictionItem[];
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
  reviewedBy?: User | string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Specialist {
  _id: string;
  name: string;
  specialty: string;
  department: string;
  hospitalWing: string;
  email: string;
  phone: string;
  availabilityStatus: "Available Today" | "On Call" | "Next Available Tomorrow";
  qualification: string;
  experienceYears: number;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "urgent" | "success";
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLogItem {
  _id: string;
  userId?: User;
  action: string;
  resourceType: string;
  resourceId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

export interface DashboardStats {
  totalAssessments: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  totalPatients: number;
  volumeData: { date: string; count: number; highRisk: number }[];
  riskDistribution: { name: string; value: number; color: string }[];
  symptomStats: { symptom: string; count: number }[];
  conditionStats: { disease: string; count: number; avgConfidence: number }[];
  specialtyStats: { specialty: string; count: number }[];
  recentCriticalCases: Assessment[];
}
