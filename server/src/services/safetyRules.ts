export interface VitalsInput {
  temperature?: number;
  temperatureUnit?: "C" | "F";
  heartRate?: number;
  systolicBP?: number;
  diastolicBP?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
}

export interface SafetyEvaluationResult {
  isRedFlag: boolean;
  redFlags: string[];
}

export const evaluateDeterministicSafetyRules = (
  symptoms: string[],
  vitals?: VitalsInput
): SafetyEvaluationResult => {
  const redFlags: string[] = [];
  const normalized = symptoms.map((s) =>
    s.toLowerCase().trim().replace(/[-\s]/g, "_")
  );

  // Critical Emergency Symptoms
  const emergencySymptomMap: Record<string, string> = {
    severe_chest_pain: "Severe crushing chest pain or acute pressure radiating to arm/jaw",
    loss_of_consciousness: "Unexplained syncope or sudden loss of consciousness",
    severe_difficulty_breathing: "Acute respiratory failure, severe dyspnea, or inability to speak full sentences",
    stroke_signs: "Focal neurological deficit: sudden facial asymmetry, arm weakness, or speech impairment (FAST alert)",
    severe_bleeding: "Active uncontrolled hemorrhage or significant blood loss",
    stiff_neck: "Severe headache combined with acute neck rigidity (potential meningeal sign)",
  };

  for (const [symKey, desc] of Object.entries(emergencySymptomMap)) {
    if (normalized.includes(symKey)) {
      redFlags.push(`Critical Symptom Indicator: ${desc}`);
    }
  }

  // Dangerous Neurological Combination
  if (
    normalized.includes("severe_headache") &&
    (normalized.includes("confusion") || normalized.includes("numbness"))
  ) {
    redFlags.push(
      "Neurological Emergency Alert: Acute severe headache accompanied by confusion or focal numbness"
    );
  }

  // Vital Signs Deterministic Thresholds
  if (vitals) {
    // Oxygen Saturation
    if (vitals.oxygenSaturation !== undefined && vitals.oxygenSaturation > 0) {
      if (vitals.oxygenSaturation < 90) {
        redFlags.push(
          `Critical Hypoxemia: SpO2 ${vitals.oxygenSaturation}% (< 90%). Immediate supplemental oxygen and emergency care needed.`
        );
      } else if (vitals.oxygenSaturation < 94) {
        redFlags.push(
          `Borderline Hypoxemia: SpO2 ${vitals.oxygenSaturation}% (< 94%). Requires urgent clinical evaluation.`
        );
      }
    }

    // Heart Rate
    if (vitals.heartRate !== undefined && vitals.heartRate > 0) {
      if (vitals.heartRate > 150) {
        redFlags.push(
          `Severe Tachycardia: Heart rate ${vitals.heartRate} bpm (> 150 bpm). High risk of tachyarrhythmia.`
        );
      } else if (vitals.heartRate < 40) {
        redFlags.push(
          `Severe Bradycardia: Heart rate ${vitals.heartRate} bpm (< 40 bpm). Severe hemodynamic compromise risk.`
        );
      }
    }

    // Blood Pressure
    if (vitals.systolicBP !== undefined && vitals.systolicBP > 0) {
      if (vitals.systolicBP >= 180) {
        redFlags.push(
          `Hypertensive Crisis: Systolic BP ${vitals.systolicBP} mmHg (>= 180 mmHg). Risk of acute end-organ damage.`
        );
      } else if (vitals.systolicBP < 85) {
        redFlags.push(
          `Severe Hypotension / Shock Alert: Systolic BP ${vitals.systolicBP} mmHg (< 85 mmHg).`
        );
      }
    }

    if (vitals.diastolicBP !== undefined && vitals.diastolicBP > 0) {
      if (vitals.diastolicBP >= 120) {
        redFlags.push(
          `Hypertensive Emergency: Diastolic BP ${vitals.diastolicBP} mmHg (>= 120 mmHg).`
        );
      }
    }

    // Body Temperature
    if (vitals.temperature !== undefined && vitals.temperature > 0) {
      const tempC =
        vitals.temperatureUnit === "F"
          ? ((vitals.temperature - 32) * 5) / 9
          : vitals.temperature;
      if (tempC >= 40.2) {
        redFlags.push(
          `Hyperpyrexia Crisis: Core body temperature ${tempC.toFixed(1)}°C (>= 104.4°F).`
        );
      }
    }

    // Respiratory Rate
    if (vitals.respiratoryRate !== undefined && vitals.respiratoryRate > 0) {
      if (vitals.respiratoryRate > 32 || vitals.respiratoryRate < 8) {
        redFlags.push(
          `Critical Respiratory Rate Anomaly: ${vitals.respiratoryRate} breaths/minute.`
        );
      }
    }
  }

  return {
    isRedFlag: redFlags.length > 0,
    redFlags,
  };
};
