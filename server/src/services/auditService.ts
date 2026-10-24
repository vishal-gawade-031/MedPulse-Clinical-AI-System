import mongoose from "mongoose";
import { AuditLog } from "../models/AuditLog";

export const logAuditEvent = async (
  action:
    | "LOGIN"
    | "LOGOUT"
    | "PROFILE_UPDATED"
    | "ASSESSMENT_CREATED"
    | "PREDICTION_GENERATED"
    | "ASSESSMENT_REVIEWED"
    | "FOLLOWUP_REQUESTED"
    | "ASSESSMENT_CLOSED",
  resourceType: string,
  userId?: mongoose.Types.ObjectId | string,
  resourceId?: string,
  metadata?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
  try {
    await AuditLog.create({
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      action,
      resourceType,
      resourceId,
      timestamp: new Date(),
      metadata,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error("[-] Failed to write clinical audit log:", error);
  }
};
