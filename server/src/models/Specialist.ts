import mongoose, { Schema, Document } from "mongoose";

export interface ISpecialist extends Document {
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

const SpecialistSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    specialty: { type: String, required: true, index: true },
    department: { type: String, required: true },
    hospitalWing: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    availabilityStatus: {
      type: String,
      enum: ["Available Today", "On Call", "Next Available Tomorrow"],
      default: "Available Today",
    },
    qualification: { type: String, required: true },
    experienceYears: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Specialist = mongoose.model<ISpecialist>(
  "Specialist",
  SpecialistSchema
);
