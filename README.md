# MedPulse Clinical AI System 🏥⚡
### Enterprise Symptoms Analysis, Disease Probability Estimation & AI-Assisted Clinical Triage Platform

[![Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20FastAPI-0A84FF.svg)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com)
[![Status](https://img.shields.io/badge/Status-Production--Ready-success.svg)](https://github.com)
[![Medical Disclaimer](https://img.shields.io/badge/Triage-Educational%20Only-critical.svg)](#-critical-medical-safety-rules--disclaimer)

---

## ⚠️ CRITICAL MEDICAL SAFETY RULES & DISCLAIMER

> **IMPORTANT CLINICAL NOTICE:**
> MedPulse Clinical AI is an **educational demonstration and AI-assisted symptom triage decision-support platform**. It does **NOT** provide a definitive or certified medical diagnosis and is **NOT** a clinically certified medical device.
>
> In an emergency, or if experiencing severe symptoms (e.g. crushing chest pain, acute respiratory distress, sudden numbness/stroke signs, uncontrolled hemorrhaging, or loss of consciousness), **immediately contact local emergency services (911 / 112 / 999) or present to the nearest emergency department.**

---

## 📌 1. Project Overview

**MedPulse Clinical AI** is a production-grade hospital portal built on the **MERN** stack (MongoDB, Express, React with Vite, Node.js) paired with an independent **Python FastAPI** microservice for machine learning inference.

Styled with an enterprise healthcare aesthetic inspired by Epic Systems, Mayo Clinic, and Cleveland Clinic, the application delivers:

- **For Patients:**
  - 4-step clinical symptom triage wizard with 52 categorized clinical symptoms.
  - Severity scoring (1–10 slider), timeline duration, and physiological vitals tracking (Temp, HR, SpO2, BP, Respiration).
  - 6-stage clinical processing animation.
  - Top 3 probability estimates with calibrated progress bars and specialty recommendations.
  - Explainable contributing symptoms ("Why these conditions were considered").
  - Downloadable hospital-standard Clinical Summary PDF (`jsPDF` + `html2canvas`).
  - Longitudinal medical history timeline with multi-criteria search and filter.
  - Hospital specialist directory (6 medical departments).
  - Patient health profile with auto-computed BMI.

- **For Doctors & Medical Administrators:**
  - Administrative Triage Operations Console with real-time Recharts visualizations.
  - 30-day assessment volume trends, risk donut breakdowns, symptom prevalence, and diagnostic distributions.
  - Recent high-risk and red-flag cases table with quick case triage actions.
  - Full assessment review modal with doctor notes, clinical sign-off, and status progression (`AI Analyzed` ➔ `Reviewed` ➔ `Follow-up Required` ➔ `Closed`).
  - Regulatory compliance audit log tracking every user login, assessment generation, and doctor sign-off.

---

## 🏛️ 2. System Architecture

```
+-------------------------------------------------------------+
|                React 18 + Vite Frontend                     |
|           Tailwind CSS (Clinical Epic/Mayo Theme)           |
|                Port: http://localhost:5173                  |
+------------------------------+------------------------------+
                               |
                   HTTP / REST (Axios + JWT)
                               |
                               v
+-------------------------------------------------------------+
|              Node.js + Express + TypeScript                 |
|     Authentication, Rate Limiting, Helmet, Security         |
|                Port: http://localhost:5000                  |
+--------------+-------------------------------+--------------+
               |                               |
        Internal HTTP                     Mongoose ODM
               |                               |
               v                               v
+-----------------------------+ +-----------------------------+
|   Python FastAPI Service    | |       MongoDB Atlas /       |
| scikit-learn RandomForest   | |    Embedded Memory DB       |
| Port: http://localhost:8000 | |   mongodb+srv://...         |
+-----------------------------+ +-----------------------------+
```

### Deterministic Red-Flag Safety Engine
The system enforces a **safety-first rules layer** that runs independently of machine learning:
- **Severe Hypoxia:** SpO2 < 90% triggers Immediate Emergency Alert.
- **Critical Arrhythmia:** Heart Rate > 150 bpm or < 40 bpm.
- **Hypertensive Crisis:** Systolic BP > 180 mmHg or Diastolic BP > 120 mmHg.
- **Emergency Indicators:** Severe crushing chest pain, FAST stroke symptoms, sudden syncope, or severe dyspnea bypass probabilistic outputs and enforce Emergency Urgency.

---

## 🚀 3. Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Client** | React 18, Vite v6, TypeScript, Tailwind CSS, Lucide React, Recharts, jsPDF, html2canvas, Axios, React Router v6 |
| **Backend API** | Node.js, Express, TypeScript, Mongoose ODM, JWT (`jsonwebtoken`), bcryptjs, Helmet, CORS, express-rate-limit |
| **ML Microservice** | Python 3.10+, FastAPI, Uvicorn, scikit-learn (`RandomForestClassifier`), pandas, numpy, joblib, Pydantic |
| **Database** | MongoDB Atlas Cluster with automatic embedded in-memory fallback |

---

## 🔑 4. Demo Accounts & Instant Access

The database is pre-populated with clinically realistic demonstration records:

### 👤 Patient Portal Account
- **Email:** `patient@hospital.org`
- **Password:** `Password123!`
- **Profile:** John Doe, 42 years old, O+ blood group, Type 2 Diabetes history, BMI 25.9 (Overweight).
- **History:** 8 historical clinical assessments over the past 30 days.

### 👨‍⚕️ Clinician / Admin Portal Account
- **Email:** `admin@hospital.org`
- **Password:** `AdminPass123!`
- **Profile:** Dr. Sarah Chen, MD (Chief Triage Officer).
- **Capabilities:** Triage board analytics, patient registry, assessment review, doctor notes signing, and audit trails.

*(A 1-Click Quick Demo Login button is present on the login page for instant authentication).*

---

## ⚡ 5. How to Run the Project

### Prerequisites
- **Node.js** v18+ (tested on Node v20 / v24)
- **Python** 3.10+
- **npm** v9+

---

### Step 1: Install Dependencies

```bash
# In the project root directory:
npm install

# Install server dependencies:
cd server
npm install

# Install client dependencies:
cd ../client
npm install

# Install Python ML dependencies:
cd ../ml-service
pip install -r requirements.txt
```

---

### Step 2: Configure MongoDB Atlas

The repository is configured to connect to your MongoDB Atlas cluster:

```env
MONGODB_URI=mongodb+srv://patilmanjunath225_db_user:NLxdg1SfsGny1UKe@cluster0.3qjp9j7.mongodb.net/medpulse_clinical?retryWrites=true&w=majority
```

#### 🌐 MongoDB Atlas IP Whitelist Instructions:
1. Log in to [MongoDB Atlas Console](https://cloud.mongodb.com/).
2. In the left navigation, click **Network Access** (under *Security*).
3. Click **Add IP Address**.
4. To allow access from your current local machine or any network, select **Allow Access From Anywhere (`0.0.0.0/0`)** or click **Add Current IP Address**.
5. Click **Confirm**.

> 💡 **Resilient Auto-Fallback Architecture:**
> If your MongoDB Atlas cluster IP whitelist is not yet updated or internet is unavailable, MedPulse's connection layer ([`db.ts`](file:///c:/Users/Manjunath/Desktop/vittal/server/src/config/db.ts)) gracefully catches the timeout and initializes an embedded **MongoMemoryServer** with automatic seeding. The application will never crash or fail to start.

---

### Step 3: Train the Machine Learning Model

```bash
# From repository root:
npm run train

# Or directly in ml-service:
python ml-service/train.py
```

*Trains the Random Forest model on 5,040 synthesized clinical records covering 51 symptoms across 28 diagnostic condition categories (validation accuracy: 93.85%). Artifacts are saved to `ml-service/models/`.*

---

### Step 4: Seed Initial Clinical Demo Data

```bash
# From repository root:
npm run seed
```

*Seeds 52 symptoms, 6 specialists, 18 disease knowledge records, 2 demo users, and 8 historical assessments spanning 30 days.*

---

### Step 5: Start All Services Concurrently

Run the unified command from the root directory:

```bash
npm run dev
```

This launches all three services simultaneously:
- 🌐 **React Vite Frontend:** [`http://localhost:5173`](http://localhost:5173)
- ⚙️ **Express Backend API:** [`http://localhost:5000`](http://localhost:5000) (Health: [`http://localhost:5000/api/health`](http://localhost:5000/api/health))
- 🧠 **FastAPI ML Service:** [`http://localhost:8000`](http://localhost:8000) (Swagger Docs: [`http://localhost:8000/docs`](http://localhost:8000/docs))

---

### Alternative: Running Services Individually

If you prefer separate terminal windows:

```bash
# Terminal 1 — Python ML Service:
npm run ml
# (or: python ml-service/main.py)

# Terminal 2 — Node.js Express API:
npm run server
# (or: cd server && npm run dev)

# Terminal 3 — React Vite Frontend:
npm run client
# (or: cd client && npm run dev)
```

---

## 🌐 6. Environment Variables Reference

### Backend (`server/.env`):
```env
PORT=5000
MONGODB_URI=mongodb+srv://patilmanjunath225_db_user:NLxdg1SfsGny1UKe@cluster0.3qjp9j7.mongodb.net/medpulse_clinical?retryWrites=true&w=majority
JWT_SECRET=medpulse_hospital_clinical_jwt_secret_key_2026_production
ML_SERVICE_URL=http://localhost:8000
CLIENT_URL=http://localhost:5173
EMERGENCY_HOTLINE=911
```

### Frontend (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_EMERGENCY_NUMBER=911
```

---

## 📡 7. REST API Documentation

### Authentication & Profiles
- `POST /api/auth/register` — Register a patient account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Retrieve current authenticated user
- `GET /api/patients/profile` — Fetch patient biometrics and calculated BMI
- `PUT /api/patients/profile` — Update clinical demographics, allergies, and medications

### Symptoms & Clinical Assessments
- `GET /api/symptoms` — Retrieve 52 categorized clinical symptoms
- `POST /api/assessments` — Submit triage wizard data; triggers safety red-flag checks and ML inference
- `GET /api/assessments` — Query patient assessments with filters (urgency, status, keyword)
- `GET /api/assessments/:id` — Full assessment details with AI explainability and care advice

### Administration & Doctor Workflow
- `GET /api/admin/dashboard` — Aggregated hospital triage analytics and Recharts data
- `GET /api/admin/assessments` — Hospital triage queue with search and status filters
- `GET /api/admin/assessments/:id` — Physician case review screen
- `PATCH /api/admin/assessments/:id/status` — Advance status (`Reviewed`, `Follow-up Required`, `Closed`)
- `POST /api/admin/assessments/:id/notes` — Record official physician review notes and sign-off
- `GET /api/admin/audit-logs` — Immutable regulatory audit trail

### Specialists & Notifications
- `GET /api/specialists` — 6 hospital specialist physician profiles
- `GET /api/notifications` — In-app clinical alerts and triage updates
- `PATCH /api/notifications/:id/read` — Acknowledge notification

---

## 🧪 8. End-to-End Browser Testing Verification

The complete application was verified live in Chrome:

1. **Authentication Flow:**
   - Successfully logged in using 1-Click Demo Patient and 1-Click Demo Admin.
   - JWT tokens stored securely, role-based route guards verified.

2. **Patient Dashboard:**
   - Rendered "Good morning, John" header, latest assessment card, urgent status indicators, and health profile summary.

3. **4-Step Symptom Wizard:**
   - **Step 1:** Searched and selected symptoms from 52 clinical options; chips rendered dynamically.
   - **Step 2:** Configured severity (1–10 slider) and duration (Days/Hours/Weeks/Months).
   - **Step 3:** Entered physiological vitals (Temp, HR, SpO2, BP) and clinical travel/pregnancy context.
   - **Step 4:** Verified clinical review card with BMI (25.9 / Overweight) and triggered "Analyze Symptoms".
   - **Processing Screen:** Displayed animated 6-stage clinical processing progression.

4. **Triage Results Page:**
   - Calibrated horizontal probability bars displayed top 3 conditions.
   - "Why these conditions were considered" dynamically listed contributing symptoms.
   - Urgency badge and medical specialty recommendation rendered accurately.
   - Clicked **"Download Clinical Summary"** — generated and downloaded the hospital-formatted PDF with disclaimers.

5. **Medical History Timeline:**
   - Newly created assessment appeared immediately at the top of the timeline.
   - Tested search by keyword and filtering by urgency (`High`, `Medium`, `Low`) and status.

6. **Doctor / Admin Triage Operations:**
   - Admin Dashboard rendered all Recharts charts: Volume trend, Risk donut, Symptoms frequency, and Condition distribution.
   - Opened high-risk assessment review screen.
   - Typed physician clinical notes and clicked **"Commit Physician Review"**.
   - Updated case status to **"Follow-up Required"**.

7. **Audit & Compliance Trail:**
   - Verified that the doctor's review, status change, and patient triage submission were logged to [`/admin/audit-logs`](http://localhost:5173/admin/audit-logs) in real time.

---

## 🛡️ 9. Security & Governance

- **JWT Authentication:** Strict Bearer token authorization on all private endpoints.
- **Role-Based Access Control:** `requireRole("ADMIN")` protects all clinical administration and audit routes.
- **Password Protection:** Salted bcrypt hashing with 10 rounds; passwords never exposed in responses.
- **Security Headers:** Express configured with `helmet()` and CORS origin white-listing.
- **Rate Limiting:** Protects auth and inference endpoints against brute-force attacks.
- **Immutable Audit Logging:** Captures `LOGIN`, `ASSESSMENT_CREATED`, `PREDICTION_GENERATED`, and `ASSESSMENT_REVIEWED`.

---

## ⚖️ 10. License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
Patient Portal: patient@hospital.org / Password123!
Clinician / Admin: admin@hospital.org / AdminPass123!