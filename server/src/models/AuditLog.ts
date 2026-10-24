import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;
  action:
    | "LOGIN"
    | "LOGOUT"
    | "PROFILE_UPDATED"
    | "ASSESSMENT_CREATED"
    | "PREDICTION_GENERATED"
    | "ASSESSMENT_REVIEWED"
    | "FOLLOWUP_REQUESTED"
    | "ASSESSMENT_CLOSED";
  resourceType: string;
  resourceId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

const AuditLogSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    action: {
      type: String,
      required: true,
      enum: [
        "LOGIN",
        "LOGOUT",
        "PROFILE_UPDATED",
        "ASSESSMENT_CREATED",
        "PREDICTION_GENERATED",
        "ASSESSMENT_REVIEWED",
        "FOLLOWUP_REQUESTED",
        "ASSESSMENT_CLOSED",
      ],
      index: true,
    },
    resourceType: { type: String, required: true },
    resourceId: { type: String },
    timestamp: { type: Date, default: Date.now, index: true },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: false }
);

AuditLogSchema.index({ timestamp: -1 });

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
