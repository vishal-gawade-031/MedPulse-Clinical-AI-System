import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB, disconnectDB } from "../config/db";
import { User } from "../models/User";
import { PatientProfile } from "../models/PatientProfile";
import { Symptom } from "../models/Symptom";
import { Disease } from "../models/Disease";
import { Specialist } from "../models/Specialist";
import { Assessment } from "../models/Assessment";
import { AuditLog } from "../models/AuditLog";
import { Notification } from "../models/Notification";
import { SYMPTOMS_DATA } from "./symptomsData";
import { SPECIALISTS_DATA } from "./specialistsData";
import { DISEASES_DATA } from "./diseasesData";

export const executeSeed = async (): Promise<void> => {
  console.log("[*] Executing database seeding process...");

  // 1. Clear existing collections for a clean, deterministic demo state
  await User.deleteMany({});
  await PatientProfile.deleteMany({});
  await Symptom.deleteMany({});
  await Disease.deleteMany({});
  await Specialist.deleteMany({});
  await Assessment.deleteMany({});
  await AuditLog.deleteMany({});
  await Notification.deleteMany({});

  console.log("[*] Existing collections cleared.");

    // 2. Create Patient User (John Doe)
    const salt = await bcrypt.genSalt(10);
    const patientPasswordHash = await bcrypt.hash("Password123!", salt);
    const patient = await User.create({
      firstName: "John",
      lastName: "Doe",
      email: "patient@hospital.org",
      passwordHash: patientPasswordHash,
      role: "PATIENT",
      phone: "+1 (555) 234-5678",
      lastLogin: new Date(),
    });

    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - 42); // 42 years old

    const patientProfile = await PatientProfile.create({
      userId: patient._id,
      dateOfBirth: birthDate,
      age: 42,
      gender: "Male",
      bloodGroup: "O+",
      height: 178, // cm
      weight: 82, // kg
      bmi: 25.9,
      bmiCategory: "Overweight",
      allergies: ["Penicillin", "Dust Mites"],
      chronicConditions: ["Type 2 Diabetes", "Mild Hyperlipidemia"],
      currentMedications: ["Metformin 500mg BID", "Multivitamin"],
      emergencyContact: {
        name: "Jane Doe",
        relationship: "Spouse",
        phone: "+1 (555) 234-5679",
      },
    });

    console.log(`[+] Patient created: ${patient.email} (Password: Password123!)`);

    // 3. Create Admin / Doctor User (Dr. Sarah Chen)
    const adminPasswordHash = await bcrypt.hash("AdminPass123!", salt);
    const admin = await User.create({
      firstName: "Dr. Sarah",
      lastName: "Chen",
      email: "admin@hospital.org",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      phone: "+1 (555) 901-4321",
      lastLogin: new Date(),
    });

    console.log(`[+] Admin created: ${admin.email} (Password: AdminPass123!)`);

    // 4. Seed Symptoms
    await Symptom.insertMany(SYMPTOMS_DATA);
    console.log(`[+] Seeded ${SYMPTOMS_DATA.length} clinical symptoms.`);

    // 5. Seed Specialists
    await Specialist.insertMany(SPECIALISTS_DATA);
    console.log(`[+] Seeded ${SPECIALISTS_DATA.length} hospital specialists.`);

    // 6. Seed Diseases
    await Disease.insertMany(DISEASES_DATA);
    console.log(`[+] Seeded ${DISEASES_DATA.length} disease knowledge records.`);

    // 7. Seed 8 Realistic Historical Assessments covering the last 30 days
    const now = new Date();

    const historicalAssessments = [
      {
        userId: patient._id,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        symptoms: ["cough", "productive_cough", "high_fever", "shortness_of_breath", "chills"],
        severityData: [
          { symptomId: "productive_cough", severity: 8, duration: { value: 3, unit: "Days" }, notes: "Thick yellowish sputum" },
          { symptomId: "high_fever", severity: 8, duration: { value: 2, unit: "Days" }, notes: "Temp reaching 39.1C" },
          { symptomId: "shortness_of_breath", severity: 7, duration: { value: 2, unit: "Days" }, notes: "Noticeable on climbing stairs" },
        ],
        vitals: {
          temperature: 39.1,
          temperatureUnit: "C",
          heartRate: 104,
          systolicBP: 128,
          diastolicBP: 82,
          respiratoryRate: 22,
          oxygenSaturation: 94,
        },
        predictions: [
          { disease: "Pneumonia", confidence: 78.4, relevantSymptoms: ["Productive Cough", "High Fever", "Shortness Of Breath", "Chills"] },
          { disease: "Acute Bronchitis", confidence: 14.2, relevantSymptoms: ["Productive Cough", "Chills"] },
          { disease: "Influenza", confidence: 7.4, relevantSymptoms: ["High Fever", "Chills"] },
        ],
        specialty: "Pulmonologist",
        urgency: "High",
        isRedFlag: false,
        redFlags: [],
        generalCareAdvice: [
          "Prompt physical assessment and chest radiography required",
          "Elevate head and torso while resting to optimize lung expansion",
          "Complete prescribed antibiotic course if bacterial etiology confirmed",
        ],
        precautions: [
          "Cyanosis (bluish lips or nails)",
          "SpO2 falling below 92%",
          "Severe hemoptysis",
        ],
        dietaryRecommendations: [
          "High-calorie fluids and balanced soft foods",
          "Avoid dairy if it thickens oral secretions",
        ],
        modelVersion: "medpulse-rf-1.0.0",
        status: "AI Analyzed",
        doctorNotes: "",
      },
      {
        userId: patient._id,
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        symptoms: ["severe_chest_pain", "palpitations", "dizziness", "shortness_of_breath"],
        severityData: [
          { symptomId: "severe_chest_pain", severity: 9, duration: { value: 1, unit: "Hours" }, notes: "Substernal pressure radiating to jaw" },
          { symptomId: "palpitations", severity: 8, duration: { value: 1, unit: "Hours" } },
        ],
        vitals: {
          temperature: 36.9,
          temperatureUnit: "C",
          heartRate: 118,
          systolicBP: 155,
          diastolicBP: 98,
          respiratoryRate: 24,
          oxygenSaturation: 91,
        },
        predictions: [
          { disease: "Coronary Artery Disease", confidence: 81.6, relevantSymptoms: ["Severe Chest Pain", "Palpitations", "Shortness Of Breath"] },
          { disease: "Hypertension", confidence: 12.3, relevantSymptoms: ["Palpitations", "Dizziness"] },
          { disease: "Bronchial Asthma", confidence: 6.1, relevantSymptoms: ["Shortness Of Breath"] },
        ],
        specialty: "Cardiologist",
        urgency: "High",
        isRedFlag: true,
        redFlags: [
          "Critical Symptom Indicator: Severe crushing chest pain or acute pressure radiating to arm/jaw",
          "Borderline Hypoxemia: SpO2 91% (< 94%). Requires urgent clinical evaluation.",
        ],
        generalCareAdvice: [
          "Do not ignore acute chest sensations — call emergency dispatch immediately",
          "Do not drive yourself to hospital if experiencing acute symptoms",
          "Consult a cardiologist for stress testing and angiography",
        ],
        precautions: [
          "Avoid strenuous physical exertion",
          "Seek emergency dispatch if chest discomfort persists > 5 minutes",
        ],
        dietaryRecommendations: [
          "Strict Mediterranean cardioprotective diet",
          "Zero artificial trans fats and minimal refined carbohydrates",
        ],
        modelVersion: "medpulse-rf-1.0.0",
        status: "Follow-up Required",
        doctorNotes:
          "Immediate emergency 12-lead ECG completed in triage. Troponin levels sent. Referred for urgent cardiology outpatient evaluation. Patient counseled on emergency warning signs.",
        reviewedBy: admin._id,
        reviewedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
      },
      {
        userId: patient._id,
        createdAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
        symptoms: ["severe_headache", "migraine", "nausea", "blurred_vision"],
        severityData: [
          { symptomId: "severe_headache", severity: 7, duration: { value: 6, unit: "Hours" }, notes: "Throbbing right-sided temple ache" },
          { symptomId: "blurred_vision", severity: 6, duration: { value: 4, unit: "Hours" }, notes: "Visual aura before headache" },
        ],
        vitals: {
          temperature: 37.0,
          temperatureUnit: "C",
          heartRate: 76,
          systolicBP: 124,
          diastolicBP: 80,
          respiratoryRate: 16,
          oxygenSaturation: 98,
        },
        predictions: [
          { disease: "Migraine", confidence: 79.5, relevantSymptoms: ["Severe Headache", "Nausea", "Blurred Vision"] },
          { disease: "Hypertension", confidence: 12.8, relevantSymptoms: ["Headache", "Blurred Vision"] },
          { disease: "Common Cold", confidence: 7.7, relevantSymptoms: ["Headache"] },
        ],
        specialty: "Neurologist",
        urgency: "Medium",
        isRedFlag: false,
        redFlags: [],
        generalCareAdvice: [
          "Lie down in a pitch-black, silent room",
          "Apply cooling ice wraps to the forehead or temples",
          "Maintain consistent circadian sleep patterns",
        ],
        precautions: [
          "Sudden thunderclap onset ('worst headache of life')",
          "Accompanying high fever and stiff neck",
          "New neurological deficits",
        ],
        dietaryRecommendations: [
          "Avoid nitrates, aspartame, aged cheeses, and red wines",
          "Prevent skipping scheduled meals",
        ],
        modelVersion: "medpulse-rf-1.0.0",
        status: "Reviewed",
        doctorNotes:
          "Classic presentation of migraine with aura. Advised sleep hygiene, hydration, and maintaining a headache diary. Recommended neurological follow-up if frequency exceeds 2 episodes/month.",
        reviewedBy: admin._id,
        reviewedAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      },
      {
        userId: patient._id,
        createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        symptoms: ["heartburn", "acid_reflux", "bloating", "chest_pain"],
        severityData: [
          { symptomId: "heartburn", severity: 5, duration: { value: 5, unit: "Days" }, notes: "Worse after dinner and coffee" },
          { symptomId: "acid_reflux", severity: 6, duration: { value: 5, unit: "Days" } },
        ],
        vitals: {
          temperature: 36.8,
          temperatureUnit: "C",
          heartRate: 72,
          systolicBP: 120,
          diastolicBP: 78,
          respiratoryRate: 15,
          oxygenSaturation: 99,
        },
        predictions: [
          { disease: "GERD", confidence: 82.1, relevantSymptoms: ["Heartburn", "Acid Reflux", "Bloating", "Chest Pain"] },
          { disease: "Common Cold", confidence: 10.4, relevantSymptoms: ["Chest Pain"] },
          { disease: "Hypertension", confidence: 7.5, relevantSymptoms: ["Chest Pain"] },
        ],
        specialty: "Gastroenterologist",
        urgency: "Low",
        isRedFlag: false,
        redFlags: [],
        generalCareAdvice: [
          "Elevate the head of your bed by 6–8 inches with bed risers",
          "Wait at least 3 hours after dinner before going to sleep",
          "Wear loose non-restrictive waistbands",
        ],
        precautions: [
          "Difficulty swallowing (dysphagia)",
          "Food sensation stuck in throat",
          "Unintentional weight loss",
        ],
        dietaryRecommendations: [
          "Smaller, frequent meal portions",
          "Avoid tomatoes, citrus, chocolate, and carbonated beverages",
        ],
        modelVersion: "medpulse-rf-1.0.0",
        status: "Closed",
        doctorNotes:
          "Lifestyle and dietary interventions discussed. Elevated bed head recommended. Case resolved without requirement of invasive diagnostics.",
        reviewedBy: admin._id,
        reviewedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      },
      {
        userId: patient._id,
        createdAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
        symptoms: ["diarrhea", "vomiting", "nausea", "abdominal_pain", "fever"],
        severityData: [
          { symptomId: "diarrhea", severity: 7, duration: { value: 2, unit: "Days" } },
          { symptomId: "vomiting", severity: 6, duration: { value: 1, unit: "Days" } },
        ],
        vitals: {
          temperature: 38.2,
          temperatureUnit: "C",
          heartRate: 92,
          systolicBP: 114,
          diastolicBP: 74,
          respiratoryRate: 18,
          oxygenSaturation: 98,
        },
        predictions: [
          { disease: "Gastroenteritis", confidence: 84.7, relevantSymptoms: ["Diarrhea", "Vomiting", "Nausea", "Abdominal Pain", "Fever"] },
          { disease: "Food Poisoning", confidence: 10.2, relevantSymptoms: ["Diarrhea", "Vomiting", "Abdominal Pain"] },
          { disease: "Typhoid Fever", confidence: 5.1, relevantSymptoms: ["Fever", "Abdominal Pain"] },
        ],
        specialty: "Gastroenterologist",
        urgency: "Medium",
        isRedFlag: false,
        redFlags: [],
        generalCareAdvice: [
          "Focus on sip-by-sip oral rehydration solutions",
          "Practice meticulous hand hygiene with soap and running water",
          "Allow bowel rest before reintroducing solid foods",
        ],
        precautions: [
          "Inability to retain oral liquids for > 24 hours",
          "Bloody stools or black tarry stools",
          "Marked postural dizziness",
        ],
        dietaryRecommendations: [
          "Oral Rehydration Salts (ORS)",
          "Bland foods (bananas, rice, applesauce, toast)",
          "Avoid dairy and fried dishes",
        ],
        modelVersion: "medpulse-rf-1.0.0",
        status: "Reviewed",
        doctorNotes:
          "Acute infectious gastroenteritis suspected. Prescribed electrolyte replacement therapy. Patient instructed to monitor hydration and stool frequency.",
        reviewedBy: admin._id,
        reviewedAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      },
      {
        userId: patient._id,
        createdAt: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000), // 22 days ago
        symptoms: ["sneezing", "runny_nose", "nasal_congestion", "itching"],
        severityData: [
          { symptomId: "sneezing", severity: 4, duration: { value: 1, unit: "Weeks" } },
          { symptomId: "itching", severity: 4, duration: { value: 1, unit: "Weeks" } },
        ],
        vitals: {
          temperature: 36.6,
          temperatureUnit: "C",
          heartRate: 68,
          systolicBP: 122,
          diastolicBP: 78,
          respiratoryRate: 14,
          oxygenSaturation: 99,
        },
        predictions: [
          { disease: "Allergic Rhinitis", confidence: 85.0, relevantSymptoms: ["Sneezing", "Runny Nose", "Nasal Congestion", "Itching"] },
          { disease: "Common Cold", confidence: 10.3, relevantSymptoms: ["Sneezing", "Runny Nose", "Nasal Congestion"] },
          { disease: "Sinusitis", confidence: 4.7, relevantSymptoms: ["Nasal Congestion", "Runny Nose"] },
        ],
        specialty: "General Physician",
        urgency: "Low",
        isRedFlag: false,
        redFlags: [],
        generalCareAdvice: [
          "Minimize outdoor exposure during peak pollen times",
          "Keep windows closed and utilize HEPA air filtration",
          "Wash bedding weekly in hot water",
        ],
        precautions: [
          "Development of chronic sinus infection",
          "Frequent secondary nosebleeds",
        ],
        dietaryRecommendations: [
          "Foods rich in bioflavonoids (berries, apples)",
          "Hydration to support mucosal integrity",
        ],
        modelVersion: "medpulse-rf-1.0.0",
        status: "Closed",
        doctorNotes:
          "Seasonal environmental allergies. Prescribed non-sedating H1 antihistamine and nasal saline rinses. Closed.",
        reviewedBy: admin._id,
        reviewedAt: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
      },
      {
        userId: patient._id,
        createdAt: new Date(now.getTime() - 26 * 24 * 60 * 60 * 1000), // 26 days ago
        symptoms: ["painful_urination", "frequent_urination", "fever", "abdominal_pain"],
        severityData: [
          { symptomId: "painful_urination", severity: 6, duration: { value: 3, unit: "Days" } },
          { symptomId: "frequent_urination", severity: 6, duration: { value: 3, unit: "Days" } },
        ],
        vitals: {
          temperature: 37.9,
          temperatureUnit: "C",
          heartRate: 84,
          systolicBP: 126,
          diastolicBP: 80,
          respiratoryRate: 16,
          oxygenSaturation: 98,
        },
        predictions: [
          { disease: "Urinary Tract Infection", confidence: 81.3, relevantSymptoms: ["Painful Urination", "Frequent Urination", "Fever", "Abdominal Pain"] },
          { disease: "Type 2 Diabetes", confidence: 12.4, relevantSymptoms: ["Frequent Urination"] },
          { disease: "Gastroenteritis", confidence: 6.3, relevantSymptoms: ["Abdominal Pain", "Fever"] },
        ],
        specialty: "Urologist / Nephrologist",
        urgency: "Medium",
        isRedFlag: false,
        redFlags: [],
        generalCareAdvice: [
          "Submit clean-catch midstream urine for urinalysis and culture",
          "Do not interrupt prescribed antibiotic regimens prematurely",
          "Urinate after intercourse",
        ],
        precautions: [
          "Flank or unilateral lower back pain",
          "High rigors with shaking chills (pyelonephritis)",
          "Hematuria (blood in urine)",
        ],
        dietaryRecommendations: [
          "Drink at least 2.5 to 3 liters of water per day",
          "Pure cranberry extract or D-mannose supplements",
          "Limit bladder irritants like coffee",
        ],
        modelVersion: "medpulse-rf-1.0.0",
        status: "Reviewed",
        doctorNotes:
          "Midstream urine microscopy confirmed leukocyturia. Patient initiated on targeted oral antibacterial therapy following culture sensitivity.",
        reviewedBy: admin._id,
        reviewedAt: new Date(now.getTime() - 26 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      },
      {
        userId: patient._id,
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        symptoms: ["high_fever", "muscle_aches", "fatigue", "chills", "dry_cough"],
        severityData: [
          { symptomId: "high_fever", severity: 7, duration: { value: 4, unit: "Days" } },
          { symptomId: "muscle_aches", severity: 8, duration: { value: 4, unit: "Days" } },
        ],
        vitals: {
          temperature: 38.8,
          temperatureUnit: "C",
          heartRate: 98,
          systolicBP: 122,
          diastolicBP: 80,
          respiratoryRate: 18,
          oxygenSaturation: 97,
        },
        predictions: [
          { disease: "Influenza", confidence: 78.9, relevantSymptoms: ["High Fever", "Muscle Aches", "Fatigue", "Chills", "Dry Cough"] },
          { disease: "Common Cold", confidence: 14.1, relevantSymptoms: ["Dry Cough", "Fatigue"] },
          { disease: "Acute Bronchitis", confidence: 7.0, relevantSymptoms: ["Dry Cough", "Fatigue"] },
        ],
        specialty: "General Physician",
        urgency: "Medium",
        isRedFlag: false,
        redFlags: [],
        generalCareAdvice: [
          "Strict bed rest during the acute febrile window",
          "Isolate to prevent transmission to vulnerable individuals",
          "Monitor oxygenation levels if cough worsens",
        ],
        precautions: [
          "Shortness of breath or persistent chest pressure",
          "Severe dizziness or confusion",
          "Fever returning after initial improvement",
        ],
        dietaryRecommendations: [
          "Nutrient-rich broths",
          "Electrolyte fluids to replace perspiration loss",
          "Light steamed fruits",
        ],
        modelVersion: "medpulse-rf-1.0.0",
        status: "Closed",
        doctorNotes:
          "Seasonal influenza resolved after bed rest and supportive care. Full recovery confirmed.",
        reviewedBy: admin._id,
        reviewedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
      },
    ];

    const seededAssessments = await Assessment.insertMany(historicalAssessments);
    console.log(`[+] Seeded ${seededAssessments.length} realistic historical assessments.`);

    // 8. Seed Notifications for Patient
    await Notification.insertMany([
      {
        userId: patient._id,
        title: "Clinical Follow-up Recommended",
        message: "Dr. Sarah Chen reviewed your cardiac symptoms assessment and recommends scheduling a clinical cardiology consultation.",
        type: "warning",
        read: false,
        link: `/assessment/result/${seededAssessments[1]._id}`,
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        userId: patient._id,
        title: "Assessment Reviewed: Migraine",
        message: "Your neurological triage assessment has been reviewed and closed by Dr. Sarah Chen.",
        type: "info",
        read: true,
        link: `/assessment/result/${seededAssessments[2]._id}`,
        createdAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
      },
      {
        userId: patient._id,
        title: "Welcome to MedPulse Clinical AI",
        message: "Your clinical profile has been established. You can now conduct AI-assisted symptom assessments anytime.",
        type: "success",
        read: true,
        link: "/dashboard",
        createdAt: new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000),
      },
    ]);

    // 9. Seed Audit Logs
    await AuditLog.insertMany([
      {
        userId: patient._id,
        action: "LOGIN",
        resourceType: "User",
        resourceId: patient._id.toString(),
        timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        metadata: { client: "WebPortal", browser: "Chrome/Vivaldi" },
      },
      {
        userId: patient._id,
        action: "ASSESSMENT_CREATED",
        resourceType: "Assessment",
        resourceId: seededAssessments[0]._id.toString(),
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        metadata: { symptomCount: 5, primarySymptom: "productive_cough" },
      },
      {
        userId: admin._id,
        action: "ASSESSMENT_REVIEWED",
        resourceType: "Assessment",
        resourceId: seededAssessments[1]._id.toString(),
        timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        metadata: { action: "Marked Follow-up Required with physician notes" },
      },
    ]);

    console.log(`[+] Seeded notifications and compliance audit trail.`);
    console.log(`====================================================`);
    console.log(` DATABASE SEEDING COMPLETED SUCCESSFULLY!`);
    console.log(` Demo Accounts:`);
    console.log(`   Patient: patient@hospital.org / Password123!`);
    console.log(`   Admin:   admin@hospital.org   / AdminPass123!`);
    console.log(`====================================================`);
};

export const seedDatabase = async () => {
  try {
    await connectDB();
    await executeSeed();
  } catch (error) {
    console.error("[-] Database seeding failed:", error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
};

// If run directly via tsx src/seed/seed.ts
if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}
