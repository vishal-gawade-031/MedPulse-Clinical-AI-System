import axios from "axios";
import { ENV } from "../config/env";
import { evaluateDeterministicSafetyRules, VitalsInput } from "./safetyRules";
import { Disease } from "../models/Disease";
import { IVisualAnalysis } from "../models/Assessment";
import { analyzeFallbackImage } from "./imageAnalysisService";

export interface MLPredictionItem {
  disease: string;
  confidence: number;
  relevantSymptoms: string[];
}

export interface MLPredictionResponse {
  predictions: MLPredictionItem[];
  specialty: string;
  urgency: "Low" | "Medium" | "High";
  precautions: string[];
  dietaryRecommendations: string[];
  generalCareAdvice: string[];
  modelVersion: string;
  predictionTimestamp: string;
  isRedFlag: boolean;
  redFlags: string[];
  visualAnalysis?: IVisualAnalysis;
}

export const requestMLInference = async (
  symptoms: string[],
  severityData: any[],
  vitals?: VitalsInput,
  context?: any,
  photoData?: string,
  photoMetadata?: any
): Promise<MLPredictionResponse> => {
  // 1. Evaluate deterministic red-flag safety rules
  const safety = evaluateDeterministicSafetyRules(symptoms, vitals);

  // 2. Call FastAPI ML Microservice
  try {
    const payload = {
      symptoms,
      severityData,
      vitals,
      context,
      photoData,
      photoMetadata,
    };

    const response = await axios.post<MLPredictionResponse>(
      `${ENV.ML_SERVICE_URL}/predict`,
      payload,
      { timeout: 8000 }
    );

    const mlResult = response.data;

    // Safety Override: ML prediction must NEVER override a critical safety rule
    if (safety.isRedFlag) {
      mlResult.isRedFlag = true;
      mlResult.urgency = "High";
      // Merge unique red flags
      const combinedFlags = Array.from(
        new Set([...(mlResult.redFlags || []), ...safety.redFlags])
      );
      mlResult.redFlags = combinedFlags;
    }

    return mlResult;
  } catch (error: any) {
    console.warn(
      `[!] ML microservice call to ${ENV.ML_SERVICE_URL} failed (${error.message}). Executing resilient fallback rule engine.`
    );

    return await executeFallbackClinicalEngine(
      symptoms,
      vitals,
      safety,
      photoData,
      photoMetadata
    );
  }
};

/**
 * Resilient Fallback Clinical Engine if Python ML microservice is unreachable.
 * Ensures the system never crashes and returns clinically reasoned estimations.
 */
async function executeFallbackClinicalEngine(
  symptoms: string[],
  vitals?: VitalsInput,
  safety?: { isRedFlag: boolean; redFlags: string[] },
  photoData?: string,
  photoMetadata?: any
): Promise<MLPredictionResponse> {
  const normUserSyms = symptoms.map((s) =>
    s.toLowerCase().trim().replace(/[-\s]/g, "_")
  );

  let visualAnalysisResult: IVisualAnalysis | undefined = undefined;
  if (photoData && photoData.trim().length > 0) {
    visualAnalysisResult = analyzeFallbackImage({
      photoData,
      photoMetadata,
      symptoms,
    });
  }

  // Retrieve diseases from database or default knowledge
  const allDiseases = await Disease.find();

  let diseaseScores: { disease: any; score: number; matched: string[] }[] = [];

  for (const dis of allDiseases) {
    const matched = dis.commonSymptoms.filter((cs) =>
      normUserSyms.includes(cs.toLowerCase().trim().replace(/[-\s]/g, "_"))
    );
    const score = matched.length;
    if (score > 0) {
      diseaseScores.push({ disease: dis, score, matched });
    }
  }

  // Sort by score
  diseaseScores.sort((a, b) => b.score - a.score);

  if (diseaseScores.length === 0 && allDiseases.length > 0) {
    diseaseScores = allDiseases.slice(0, 3).map((dis) => ({
      disease: dis,
      score: 1,
      matched: [normUserSyms[0] || "General Fatigue"],
    }));
  }

  const top3 = diseaseScores.slice(0, 3);
  const totalScore = top3.reduce((sum, item) => sum + item.score, 0) || 1;

  const rawConfidences = top3.map((item, idx) => {
    if (top3.length === 1) return 82.5;
    if (idx === 0) return Math.round((item.score / totalScore) * 65 + 25);
    if (idx === 1) return Math.round((item.score / totalScore) * 45 + 10);
    return 10.0;
  });

  const sumConf = rawConfidences.reduce((a, b) => a + b, 0);
  let normalizedPredictions: MLPredictionItem[] = top3.map((item, idx) => ({
    disease: item.disease.name,
    confidence: Number(((rawConfidences[idx] / sumConf) * 100).toFixed(1)),
    relevantSymptoms: item.matched.map((s) => s.replace(/_/g, " ").toUpperCase()),
  }));

  // If visual photo was uploaded, blend visual condition into predictions
  let specialty = top3[0]?.disease?.recommendedSpecialty || "General Physician";
  let precautions = top3[0]?.disease?.warningSigns || [
    "Avoid strenuous physical activity",
    "Stay hydrated with clean water and electrolytes",
    "Consult a qualified healthcare provider for clinical evaluation",
  ];
  let dietary = top3[0]?.disease?.dietaryConsiderations || [
    "Eat light, easily digestible, wholesome meals",
    "Avoid heavy spices, greasy food, and caffeine",
  ];
  let careAdvice = top3[0]?.disease?.generalCareAdvice || [
    "Rest extensively in a well-ventilated room",
    "Monitor temperature and symptom progression",
  ];

  if (visualAnalysisResult) {
    specialty = "Dermatologist";
    const visualCondition = visualAnalysisResult.suspectedCondition;
    const visualConfidence = visualAnalysisResult.visualConfidence;

    // Prepend or integrate visual condition
    normalizedPredictions = [
      {
        disease: visualCondition,
        confidence: visualConfidence,
        relevantSymptoms: visualAnalysisResult.detectedFeatures.slice(0, 2),
      },
      ...normalizedPredictions.slice(0, 2).map((p) => ({
        ...p,
        confidence: Number(((100 - visualConfidence) * (p.confidence / 100)).toFixed(1)),
      })),
    ];

    if (visualAnalysisResult.recommendations?.length) {
      careAdvice = visualAnalysisResult.recommendations;
    }
  }

  const isEmergency = safety?.isRedFlag || false;

  return {
    predictions: normalizedPredictions,
    specialty,
    urgency: isEmergency ? "High" : visualAnalysisResult?.visualUrgency || "Medium",
    precautions,
    dietaryRecommendations: dietary,
    generalCareAdvice: careAdvice,
    modelVersion: "medpulse-fallback-rules-vision-1.0.0",
    predictionTimestamp: new Date().toISOString(),
    isRedFlag: isEmergency,
    redFlags: safety?.redFlags || [],
    visualAnalysis: visualAnalysisResult,
  };
}
