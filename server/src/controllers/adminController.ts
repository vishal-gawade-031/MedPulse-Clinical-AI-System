import { Response } from "express";
import mongoose from "mongoose";
import { Assessment } from "../models/Assessment";
import { User } from "../models/User";
import { PatientProfile } from "../models/PatientProfile";
import { AuditLog } from "../models/AuditLog";
import { Notification } from "../models/Notification";
import { AuthRequest } from "../types";
import { logAuditEvent } from "../services/auditService";

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const totalAssessments = await Assessment.countDocuments();
    const highRiskCount = await Assessment.countDocuments({ urgency: "High" });
    const mediumRiskCount = await Assessment.countDocuments({ urgency: "Medium" });
    const lowRiskCount = await Assessment.countDocuments({ urgency: "Low" });
    const totalPatients = await User.countDocuments({ role: "PATIENT" });

    // 1. Assessment Volume Over Time (Last 14-30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const volumeData = await Assessment.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
          highRisk: {
            $sum: { $cond: [{ $eq: ["$urgency", "High"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: "$_id",
          count: 1,
          highRisk: 1,
          _id: 0,
        },
      },
    ]);

    // 2. Risk Distribution for Donut Chart
    const riskDistribution = [
      { name: "High Urgency", value: highRiskCount, color: "#DC2626" },
      { name: "Medium Urgency", value: mediumRiskCount, color: "#F59E0B" },
      { name: "Low Urgency", value: lowRiskCount, color: "#16A34A" },
    ];

    // 3. Most Common Symptoms Bar Chart
    const symptomStats = await Assessment.aggregate([
      { $unwind: "$symptoms" },
      {
        $group: {
          _id: "$symptoms",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
      {
        $project: {
          symptom: {
            $replaceAll: {
              input: "$_id",
              find: "_",
              replacement: " ",
            },
          },
          count: 1,
          _id: 0,
        },
      },
    ]);

    // 4. Most Frequently Predicted Conditions Bar Chart
    const conditionStats = await Assessment.aggregate([
      { $unwind: "$predictions" },
      {
        $group: {
          _id: "$predictions.disease",
          count: { $sum: 1 },
          avgConfidence: { $avg: "$predictions.confidence" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
      {
        $project: {
          disease: "$_id",
          count: 1,
          avgConfidence: { $round: ["$avgConfidence", 1] },
          _id: 0,
        },
      },
    ]);

    // 5. Specialty Distribution
    const specialtyStats = await Assessment.aggregate([
      {
        $group: {
          _id: "$specialty",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          specialty: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    // 6. Recent Critical / High-Risk Cases
    const recentCriticalCases = await Assessment.find({
      $or: [{ urgency: "High" }, { isRedFlag: true }],
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("userId", "firstName lastName email phone");

    res.json({
      success: true,
      data: {
        totalAssessments,
        highRiskCount,
        mediumRiskCount,
        lowRiskCount,
        totalPatients,
        volumeData,
        riskDistribution,
        symptomStats,
        conditionStats,
        specialtyStats,
        recentCriticalCases,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to load admin analytics dashboard.",
      error: error.message,
    });
  }
};

export const getAllAssessments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { urgency, status, search, page = 1, limit = 10 } = req.query;
    const filter: Record<string, any> = {};

    if (urgency && typeof urgency === "string" && urgency !== "All") {
      filter.urgency = urgency;
    }

    if (status && typeof status === "string" && status !== "All") {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Search filter across disease or symptoms
    if (search && typeof search === "string" && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { "predictions.disease": searchRegex },
        { symptoms: searchRegex },
        { specialty: searchRegex },
      ];
    }

    const total = await Assessment.countDocuments(filter);
    const assessments = await Assessment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("userId", "firstName lastName email phone")
      .populate("reviewedBy", "firstName lastName");

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: assessments,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve assessments list.",
      error: error.message,
    });
  }
};

export const updateAssessmentStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const { status, doctorNotes } = req.body;

    const validStatuses = ["Reviewed", "Follow-up Required", "Closed", "AI Analyzed"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
      return;
    }

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      res.status(404).json({ success: false, message: "Assessment not found." });
      return;
    }

    assessment.status = status;
    assessment.reviewedBy = req.user._id as any;
    assessment.reviewedAt = new Date();
    if (doctorNotes !== undefined) {
      assessment.doctorNotes = doctorNotes;
    }

    await assessment.save();

    // Map audit action
    let auditAction: any = "ASSESSMENT_REVIEWED";
    if (status === "Follow-up Required") auditAction = "FOLLOWUP_REQUESTED";
    if (status === "Closed") auditAction = "ASSESSMENT_CLOSED";

    await logAuditEvent(
      auditAction,
      "Assessment",
      req.user._id,
      assessment._id.toString(),
      { newStatus: status, reviewedByDoctor: `${req.user.firstName} ${req.user.lastName}` }
    );

    // Send in-app notification to patient
    let notifTitle = "Clinical Assessment Reviewed";
    let notifMsg = `A clinician reviewed your assessment and marked it as ${status}.`;
    let notifType: "info" | "warning" | "urgent" | "success" = "info";

    if (status === "Follow-up Required") {
      notifTitle = "Clinical Follow-up Recommended";
      notifMsg = "A doctor reviewed your triage assessment and recommends scheduling a clinical consultation.";
      notifType = "warning";
    } else if (status === "Closed") {
      notifTitle = "Assessment Closed";
      notifMsg = "Your symptom assessment review has been finalized.";
      notifType = "success";
    }

    await Notification.create({
      userId: assessment.userId,
      title: notifTitle,
      message: notifMsg,
      type: notifType,
      link: `/assessment/result/${assessment._id}`,
    });

    res.json({
      success: true,
      message: `Assessment status updated to ${status}.`,
      data: assessment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update assessment status.",
      error: error.message,
    });
  }
};

export const addDoctorNotes = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const { doctorNotes, status } = req.body;

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      res.status(404).json({ success: false, message: "Assessment not found." });
      return;
    }

    assessment.doctorNotes = doctorNotes || "";
    assessment.reviewedBy = req.user._id as any;
    assessment.reviewedAt = new Date();
    if (status) {
      assessment.status = status;
    } else if (assessment.status === "AI Analyzed") {
      assessment.status = "Reviewed";
    }

    await assessment.save();

    await logAuditEvent(
      "ASSESSMENT_REVIEWED",
      "Assessment",
      req.user._id,
      assessment._id.toString(),
      { action: "Added physician notes" }
    );

    res.json({
      success: true,
      message: "Doctor notes saved successfully.",
      data: assessment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to save doctor notes.",
      error: error.message,
    });
  }
};

export const getPatients = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const patients = await User.find({ role: "PATIENT" })
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    const patientIds = patients.map((p) => p._id);
    const profiles = await PatientProfile.find({ userId: { $in: patientIds } });

    const profilesMap = new Map();
    profiles.forEach((pr) => profilesMap.set(pr.userId.toString(), pr));

    const combined = patients.map((p) => ({
      ...p.toObject(),
      profile: profilesMap.get(p._id.toString()) || null,
    }));

    res.json({
      success: true,
      count: combined.length,
      data: combined,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve patient registry.",
      error: error.message,
    });
  }
};

export const getAuditLogs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 25 } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 25));
    const skip = (pageNum - 1) * limitNum;

    const total = await AuditLog.countDocuments();
    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("userId", "firstName lastName email role");

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: logs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve audit trail.",
      error: error.message,
    });
  }
};
