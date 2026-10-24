import mongoose, { Schema, Document } from "mongoose";

export interface IPatientProfile extends Document {
  userId: mongoose.Types.ObjectId;
  dateOfBirth?: Date;
  age?: number;
  gender: "Male" | "Female" | "Other" | "Prefer not to say";
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | "Unknown";
  height: number; // in cm
  weight: number; // in kg
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
  createdAt: Date;
  updatedAt: Date;
}

const PatientProfileSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    dateOfBirth: { type: Date },
    age: { type: Number },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
      default: "Prefer not to say",
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"],
      default: "Unknown",
    },
    height: { type: Number, default: 170 }, // cm
    weight: { type: Number, default: 70 }, // kg
    allergies: [{ type: String, trim: true }],
    chronicConditions: [{ type: String, trim: true }],
    currentMedications: [{ type: String, trim: true }],
    emergencyContact: {
      name: { type: String, default: "" },
      relationship: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
    bmi: { type: Number },
    bmiCategory: { type: String },
  },
  { timestamps: true }
);

PatientProfileSchema.pre<IPatientProfile>("save", function (next) {
  const h = Number(this.height);
  const w = Number(this.weight);
  if (h && w && h > 0) {
    const heightInMeters = h / 100;
    const calculatedBmi = Number((w / (heightInMeters * heightInMeters)).toFixed(1));
    this.bmi = calculatedBmi;

    if (calculatedBmi < 18.5) {
      this.bmiCategory = "Underweight";
    } else if (calculatedBmi < 25) {
      this.bmiCategory = "Normal weight";
    } else if (calculatedBmi < 30) {
      this.bmiCategory = "Overweight";
    } else {
      this.bmiCategory = "Obese";
    }
  }
  next();
});

export const PatientProfile = mongoose.model<IPatientProfile>(
  "PatientProfile",
  PatientProfileSchema
);
