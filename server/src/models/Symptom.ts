import mongoose, { Schema, Document } from "mongoose";

export interface ISymptom extends Document {
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

const SymptomSchema: Schema = new Schema(
  {
    symptomId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, lowercase: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
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
      ],
      index: true,
    },
    description: { type: String, required: true },
    isRedFlagIndicator: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Symptom = mongoose.model<ISymptom>("Symptom", SymptomSchema);
