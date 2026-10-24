import { Response } from "express";
import { Assessment } from "../models/Assessment";
import { Notification } from "../models/Notification";
import { AuthRequest } from "../types";
import { requestMLInference } from "../services/mlService";
import { logAuditEvent } from "../services/auditService";

export const createAssessment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { symptoms, severityData, vitals, context, photoData, photoMetadata } = req.body;

    const hasPhoto = Boolean(photoData && typeof photoData === "string" && photoData.trim().length > 0);
    const resolvedSymptoms: string[] = Array.isArray(symptoms) ? [...symptoms] : [];

    if (resolvedSymptoms.length === 0 && !hasPhoto) {
      res.status(400).json({
        success: false,
        message: "Please select at least one symptom or upload a clinical photo of the condition.",
      });
      return;
    }

    // If symptoms is empty but photo is provided, infer default visual indicator symptom
    if (resolvedSymptoms.length === 0 && hasPhoto) {
      const area = (photoMetadata?.bodyArea || "").toLowerCase();
      if (area.includes("eye") || area.includes("ocular")) {
        resolvedSymptoms.push("blurred_vision");
      } else {
        resolvedSymptoms.push("skin_lesions");
      }
    }

    // Normalize severity data to handle both nested and flat client payloads
    const normalizedSeverity = (severityData || []).map((item: any) => ({
      symptomId: item.symptomId || item.symptom || item.id || "symptom",
      severity: item.severity ?? 5,
      duration: typeof item.duration === "object" && item.duration !== null ? item.duration : {
        value: typeof item.duration === "number" ? item.duration : 1,
        unit: item.durationUnit || "Days",
      },
      notes: item.notes || "",
    }));

    // If photo only, ensure at least one severity entry exists
    if (normalizedSeverity.length === 0 && hasPhoto) {
      normalizedSeverity.push({
        symptomId: resolvedSymptoms[0],
        severity: 5,
        duration: { value: 1, unit: "Days" },
        notes: photoMetadata?.notes || "Identified via uploaded clinical photography",
      });
    }

    // Call ML Inference Microservice (with fallback safety rules)
    const inferenceResult = await requestMLInference(
      resolvedSymptoms,
      normalizedSeverity,
      vitals,
      context,
      photoData,
      photoMetadata
    );

    const assessment = await Assessment.create({
      userId: req.user._id,
      symptoms: resolvedSymptoms,
      severityData: normalizedSeverity,
      vitals: vitals || {},
      context: context || {},
      photoData: photoData || undefined,
      photoMetadata: photoMetadata || undefined,
      visualAnalysis: inferenceResult.visualAnalysis,
      predictions: inferenceResult.predictions,
      specialty: inferenceResult.specialty,
      urgency: inferenceResult.urgency,
      isRedFlag: inferenceResult.isRedFlag,
      redFlags: inferenceResult.redFlags,
      precautions: inferenceResult.precautions,
      dietaryRecommendations: inferenceResult.dietaryRecommendations,
      generalCareAdvice: inferenceResult.generalCareAdvice,
      modelVersion: inferenceResult.modelVersion,
      status: "AI Analyzed",
      doctorNotes: "",
    });

    // Create Audit Logs
    await logAuditEvent(
      "ASSESSMENT_CREATED",
      "Assessment",
      req.user._id,
      assessment._id.toString(),
      {
        symptomCount: resolvedSymptoms.length,
        hasPhoto,
        visualCondition: inferenceResult.visualAnalysis?.suspectedCondition,
      }
    );

    await logAuditEvent(
      "PREDICTION_GENERATED",
      "Assessment",
      req.user._id,
      assessment._id.toString(),
      {
        urgency: inferenceResult.urgency,
        topDisease: inferenceResult.predictions[0]?.disease,
        confidence: inferenceResult.predictions[0]?.confidence,
        isRedFlag: inferenceResult.isRedFlag,
        hasPhoto,
      }
    );

    // Create in-app patient notification
    if (inferenceResult.isRedFlag) {
      await Notification.create({
        userId: req.user._id,
        title: "URGENT SAFETY ALERT: Emergency Medical Attention Advised",
        message:
          "Your recent symptom assessment flagged critical safety indicators. Please seek immediate professional medical or emergency services.",
        type: "urgent",
        link: `/assessment/result/${assessment._id}`,
      });
    } else {
      await Notification.create({
        userId: req.user._id,
        title: "AI-Assisted Assessment Ready",
        message: `Your assessment completed with ${inferenceResult.urgency} urgency. Recommended specialty: ${inferenceResult.specialty}.`,
        type: inferenceResult.urgency === "High" ? "warning" : "info",
        link: `/assessment/result/${assessment._id}`,
      });
    }

    res.status(201).json({
      success: true,
      message: "Symptom assessment processed successfully.",
      data: assessment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to evaluate symptom assessment.",
      error: error.message,
    });
  }
};

export const getPatientAssessments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { urgency, status, search } = req.query;
    const filter: Record<string, any> = { userId: req.user._id };

    if (urgency && typeof urgency === "string" && urgency !== "All") {
      filter.urgency = urgency;
    }

    if (status && typeof status === "string" && status !== "All") {
      filter.status = status;
    }

    if (search && typeof search === "string" && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { "predictions.disease": searchRegex },
        { symptoms: searchRegex },
        { specialty: searchRegex },
      ];
    }

    const assessments = await Assessment.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: assessments.length,
      data: assessments,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve historical assessments.",
      error: error.message,
    });
  }
};

export const getAssessmentById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const assessment = await Assessment.findById(id)
      .populate("userId", "firstName lastName email phone")
      .populate("reviewedBy", "firstName lastName email");

    if (!assessment) {
      res.status(404).json({
        success: false,
        message: "Assessment not found.",
      });
      return;
    }

    // Role check: Only the patient who owns it or an ADMIN can view it
    if (
      req.user.role !== "ADMIN" &&
      (assessment.userId as any)._id.toString() !== req.user._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to view this clinical assessment.",
      });
      return;
    }

    res.json({
      success: true,
      data: assessment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve assessment details.",
      error: error.message,
    });
  }
};
