import mongoose, { Schema, Document } from "mongoose";

export interface IDisease extends Document {
  name: string;
  description: string;
  commonSymptoms: string[];
  warningSigns: string[];
  commonTriggers: string[];
  generalCareAdvice: string[];
  dietaryConsiderations: string[];
  recommendedSpecialty: string;
  baseUrgency: "Low" | "Medium" | "High";
}

const DiseaseSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    commonSymptoms: [{ type: String }],
    warningSigns: [{ type: String }],
    commonTriggers: [{ type: String }],
    generalCareAdvice: [{ type: String }],
    dietaryConsiderations: [{ type: String }],
    recommendedSpecialty: { type: String, required: true },
    baseUrgency: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
  },
  { timestamps: true }
);

export const Disease = mongoose.model<IDisease>("Disease", DiseaseSchema);
