import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/medpulse",
  JWT_SECRET: process.env.JWT_SECRET || "medpulse_hospital_clinical_jwt_secret_key_2026_production",
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || "http://localhost:8000",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  EMERGENCY_HOTLINE: process.env.EMERGENCY_HOTLINE || "911",
  NODE_ENV: process.env.NODE_ENV || "development",
};
