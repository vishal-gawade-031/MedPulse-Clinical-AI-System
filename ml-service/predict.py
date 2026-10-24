import os
import json
import joblib
import numpy as np
from datetime import datetime
from schemas import (
    PredictionRequest,
    PredictionResponse,
    PredictionItem,
    VisualAnalysisResult,
    VisualDifferential,
)
from image_predictor import image_predictor, VISUAL_DISEASE_CATALOG

# Clinical Precautions & Care Advice Catalog
CLINICAL_ADVICE_CATALOG = {
    "Pneumonia": {
        "specialty": "Pulmonologist",
        "precautions": ["Avoid exposure to smoke and air pollutants", "Rest in an elevated position to ease breathing", "Seek immediate care if breathing worsens or lips turn bluish"],
        "dietaryRecommendations": ["Warm fluids (broths, herbal teas)", "Electrolyte-rich drinks", "High-protein soft meals to sustain recovery"],
        "generalCareAdvice": ["Rest extensively and maintain optimal hydration", "Use a cool-mist humidifier in your room", "Do not take cough suppressants without physician guidance"]
    },
    "Bronchial Asthma": {
        "specialty": "Pulmonologist",
        "precautions": ["Keep prescribed rescue inhalers accessible", "Avoid known environmental triggers (dust, cold air, pet dander)", "Do not engage in strenuous exertion until evaluated"],
        "dietaryRecommendations": ["Warm water and non-acidic soups", "Avoid sulfites and heavily processed foods", "Incorporate magnesium-rich foods"],
        "generalCareAdvice": ["Monitor peak expiratory flow if meter is available", "Maintain a clean, allergen-free bedroom environment", "Sit upright during acute wheezing episodes"]
    },
    "Hypertension": {
        "specialty": "Cardiologist",
        "precautions": ["Monitor blood pressure twice daily (morning and evening)", "Avoid high sodium, caffeine, and tobacco", "Report sudden severe headache or visual changes immediately"],
        "dietaryRecommendations": ["DASH diet emphasis: fresh vegetables, whole grains", "Strictly restrict sodium intake (< 2,000 mg/day)", "Potassium-rich foods (bananas, spinach) if kidney function allows"],
        "generalCareAdvice": ["Engage in gentle walking if non-symptomatic", "Practice stress reduction and deep breathing techniques", "Maintain a dedicated blood pressure log"]
    },
    "Coronary Artery Disease": {
        "specialty": "Cardiologist",
        "precautions": ["Avoid physical exertion, heavy lifting, or sudden cold exposure", "Seek emergency medical services if chest discomfort radiates to left arm, neck, or jaw", "Do not drive yourself to the emergency department"],
        "dietaryRecommendations": ["Heart-healthy Mediterranean diet", "Zero trans fats and minimal saturated fats", "Rich in omega-3 fatty acids and soluble fiber"],
        "generalCareAdvice": ["Immediate clinical evaluation is strongly advised", "Avoid high-stress situations", "Rest seated and remain calm while awaiting medical consultation"]
    },
    "Migraine": {
        "specialty": "Neurologist",
        "precautions": ["Rest in a quiet, dark room during active episodes", "Apply cold or warm compresses to the forehead/neck", "Avoid known dietary triggers such as aged cheeses and artificial sweeteners"],
        "dietaryRecommendations": ["Stay well-hydrated with water and electrolyte drinks", "Eat meals at consistent scheduled times", "Limit caffeine withdrawal or excess"],
        "generalCareAdvice": ["Maintain a detailed headache diary recording frequency and duration", "Establish regular sleep schedules", "Consult a neurologist for preventive therapy options"]
    },
    "Gastroenteritis": {
        "specialty": "Gastroenterologist",
        "precautions": ["Strict hand hygiene to prevent transmission", "Avoid anti-diarrheal medications until assessed by a clinician", "Monitor for dehydration signs (dry mouth, dark urine, lethargy)"],
        "dietaryRecommendations": ["Oral Rehydration Salts (ORS) in frequent small sips", "BRAT diet (Bananas, Rice, Applesauce, Toast) once tolerated", "Avoid dairy, caffeine, alcohol, and spicy foods"],
        "generalCareAdvice": ["Prioritize gradual rehydration over solid food intake", "Rest your gastrointestinal tract", "Seek prompt evaluation if unable to keep fluids down for over 24 hours"]
    },
    "GERD": {
        "specialty": "Gastroenterologist",
        "precautions": ["Do not lie down within 3 hours of eating", "Elevate the head of your bed by 6 inches", "Avoid tight-fitting waist garments"],
        "dietaryRecommendations": ["Avoid citrus, tomatoes, chocolate, mint, and carbonated beverages", "Eat smaller, more frequent meals rather than large feasts", "Favor lean proteins and oatmeal"],
        "generalCareAdvice": ["Keep a symptom diary identifying specific trigger foods", "Maintain a healthy weight to reduce abdominal pressure", "Avoid smoking and alcohol consumption"]
    },
    "Type 2 Diabetes": {
        "specialty": "Endocrinologist",
        "precautions": ["Regularly monitor fasting and post-prandial blood glucose levels", "Inspect feet daily for cuts, blisters, or redness", "Stay vigilant for hypoglycemia symptoms (sweating, trembling)"],
        "dietaryRecommendations": ["Low-glycemic index carbohydrates", "High fiber intake (legumes, leafy greens)", "Eliminate sugar-sweetened beverages and refined carbohydrates"],
        "generalCareAdvice": ["Consistent physical activity (150 mins weekly)", "Schedule comprehensive HbA1c testing with an endocrinologist", "Maintain proper foot and dental hygiene"]
    },
    "Common Cold": {
        "specialty": "General Physician",
        "precautions": ["Cover coughs and sneezes with a tissue or elbow", "Wash hands frequently with soap for at least 20 seconds", "Rest at home to prevent workplace or school transmission"],
        "dietaryRecommendations": ["Warm broth, citrus fruits for natural vitamin C, and warm herbal teas", "Honey in warm water (for individuals over 1 year)", "Adequate water intake"],
        "generalCareAdvice": ["Use saline nasal rinses or steam inhalation", "Get 8+ hours of restful sleep", "Over-the-counter saline sprays can alleviate congestion"]
    },
    "Influenza": {
        "specialty": "General Physician",
        "precautions": ["Isolate from vulnerable family members (elderly, infants)", "Seek evaluation early (within 48 hours) if antiviral therapy is considered", "Watch for secondary bacterial complications such as renewed high fever"],
        "dietaryRecommendations": ["Light, easily digestible nutrient-dense soups", "High-electrolyte fluids and coconut water", "Avoid alcohol and caffeinated drinks"],
        "generalCareAdvice": ["Complete bed rest during the febrile phase", "Use lukewarm sponge baths for comfort if fever is high", "Monitor oxygen saturation if respiratory symptoms develop"]
    },
    "Urinary Tract Infection": {
        "specialty": "Urologist / Nephrologist",
        "precautions": ["Complete full prescribed antimicrobial courses once prescribed", "Avoid delaying urination when the urge occurs", "Wipe from front to back after using the toilet"],
        "dietaryRecommendations": ["Drink abundant fresh water (at least 2.5–3 liters daily)", "Unsweetened pure cranberry juice or D-mannose", "Limit bladder irritants like coffee and spicy foods"],
        "generalCareAdvice": ["Urinate promptly before and after sexual intercourse", "Wear loose cotton underwear", "Seek emergency evaluation if flank/back pain or chills develop"]
    },
    "Dengue Fever": {
        "specialty": "Infectious Disease Specialist",
        "precautions": ["Avoid NSAIDs (like aspirin or ibuprofen) which increase bleeding risks; consult physician", "Use mosquito repellents and bed nets to avoid secondary mosquito bites", "Watch closely for warning signs (abdominal pain, persistent vomiting, bleeding gums)"],
        "dietaryRecommendations": ["High oral fluid intake: ORS, tender coconut water, fruit juices", "Pomegranate and papaya leaf extract (traditional adjuvant with doctor consult)", "Soft bland meals"],
        "generalCareAdvice": ["Daily complete blood count (platelet monitoring) under medical supervision", "Absolute rest during the critical phase (days 3–7 of illness)", "Prompt hospitalization if warning signs appear"]
    }
}

DEFAULT_ADVICE = {
    "specialty": "General Physician",
    "precautions": ["Rest adequately and monitor for new or worsening symptoms", "Avoid self-medicating with unprescribed antibiotics or heavy analgesics", "Consult a qualified medical practitioner for formal physical evaluation"],
    "dietaryRecommendations": ["Maintain well-balanced, wholesome nutrition", "Ensure adequate daily fluid hydration", "Avoid heavy, excessively greasy or processed foods"],
    "generalCareAdvice": ["Track symptom progression and record duration", "Follow up with a healthcare provider if symptoms persist beyond 48–72 hours", "Seek emergency medical attention if red-flag symptoms arise"]
}

class SymptomPredictor:
    def __init__(self, models_dir: str = "models"):
        self.models_dir = models_dir
        self.model = None
        self.symptoms_list = []
        self.disease_map = {}
        self.metadata = {}
        self.load_artifacts()

    def load_artifacts(self):
        model_file = os.path.join(self.models_dir, "model.joblib")
        symptoms_file = os.path.join(self.models_dir, "symptoms.json")
        disease_map_file = os.path.join(self.models_dir, "disease_map.json")
        meta_file = "model_metadata.json"

        if os.path.exists(model_file) and os.path.exists(symptoms_file):
            try:
                self.model = joblib.load(model_file)
                with open(symptoms_file, "r") as f:
                    self.symptoms_list = json.load(f)
                if os.path.exists(disease_map_file):
                    with open(disease_map_file, "r") as f:
                        self.disease_map = json.load(f)
                if os.path.exists(meta_file):
                    with open(meta_file, "r") as f:
                        self.metadata = json.load(f)
                print("[+] Model artifacts successfully loaded into memory.")
            except Exception as e:
                print(f"[-] Error loading model artifacts: {e}")
        else:
            print("[!] Model artifacts not found. Automatic training required.")

    def evaluate_safety_rules(self, req: PredictionRequest) -> Tuple[bool, List[str]]:
        red_flags = []
        symptoms_lower = [s.lower().strip().replace("-", "_").replace(" ", "_") for s in req.symptoms]

        # Clinical emergency symptoms rules
        emergency_symptoms_map = {
            "severe_chest_pain": "Severe crushing chest pain or tightness",
            "loss_of_consciousness": "Unexplained syncope, fainting, or loss of consciousness",
            "severe_difficulty_breathing": "Acute severe shortness of breath or respiratory distress",
            "stroke_signs": "Sudden facial droop, arm weakness, or slurred speech (FAST warning)",
            "severe_bleeding": "Active uncontrolled severe hemorrhage or bleeding",
            "stiff_neck": "Sudden high fever combined with neck stiffness (meningeal signs)"
        }

        for sym_key, desc in emergency_symptoms_map.items():
            if sym_key in symptoms_lower:
                red_flags.append(f"Critical symptom detected: {desc}")

        # Check neurological critical combo
        if "severe_headache" in symptoms_lower and ("confusion" in symptoms_lower or "numbness" in symptoms_lower):
            red_flags.append("Neurological alert: Severe acute headache accompanied by altered mental status or focal deficit")

        # Vital Signs deterministic safety thresholds
        if req.vitals:
            v = req.vitals
            # Oxygen Saturation: < 90% is hypoxic crisis
            if v.oxygenSaturation is not None and v.oxygenSaturation > 0:
                if v.oxygenSaturation < 90:
                    red_flags.append(f"Critically low Oxygen Saturation ({v.oxygenSaturation}% < 90%). High risk of severe respiratory compromise.")
                elif v.oxygenSaturation < 94:
                    red_flags.append(f"Borderline/abnormal Oxygen Saturation ({v.oxygenSaturation}%). Close clinical observation required.")

            # Heart Rate
            if v.heartRate is not None and v.heartRate > 0:
                if v.heartRate > 150:
                    red_flags.append(f"Severe Tachycardia ({v.heartRate} bpm > 150 bpm). Risk of cardiac arrhythmia.")
                elif v.heartRate < 40:
                    red_flags.append(f"Severe Bradycardia ({v.heartRate} bpm < 40 bpm). Critical hemodynamic instability risk.")

            # Blood Pressure
            if v.systolicBP is not None and v.systolicBP > 0:
                if v.systolicBP >= 180:
                    red_flags.append(f"Hypertensive Crisis threshold: Systolic BP {v.systolicBP} mmHg >= 180 mmHg.")
                elif v.systolicBP < 85:
                    red_flags.append(f"Severe Hypotension / Shock indicator: Systolic BP {v.systolicBP} mmHg < 85 mmHg.")

            if v.diastolicBP is not None and v.diastolicBP > 0:
                if v.diastolicBP >= 120:
                    red_flags.append(f"Hypertensive Emergency threshold: Diastolic BP {v.diastolicBP} mmHg >= 120 mmHg.")

            # Temperature
            if v.temperature is not None and v.temperature > 0:
                temp_c = v.temperature if v.temperatureUnit != "F" else (v.temperature - 32) * 5 / 9
                if temp_c >= 40.2:
                    red_flags.append(f"Hyperpyrexia alert: Core body temperature {temp_c:.1f}°C (>= 104.4°F).")

            # Respiratory Rate
            if v.respiratoryRate is not None and v.respiratoryRate > 0:
                if v.respiratoryRate > 32 or v.respiratoryRate < 8:
                    red_flags.append(f"Critical Respiratory Rate anomaly ({v.respiratoryRate} breaths/min).")

        is_red_flag = len(red_flags) > 0
        return is_red_flag, red_flags

    def predict(self, req: PredictionRequest) -> PredictionResponse:
        # 1. Deterministic safety rules check FIRST
        is_red_flag, red_flags = self.evaluate_safety_rules(req)

        # 2. Visual Disease Analysis (if photo is uploaded)
        visual_analysis_obj = None
        visual_diag = None
        if req.photoData and len(req.photoData.strip()) > 0:
            try:
                visual_diag = image_predictor.analyze_clinical_image(
                    photo_data=req.photoData,
                    photo_metadata=req.photoMetadata or {},
                    reported_symptoms=req.symptoms or []
                )
                visual_analysis_obj = VisualAnalysisResult(
                    hasPhoto=True,
                    analyzedAt=visual_diag.get("analyzedAt"),
                    bodyArea=visual_diag.get("bodyArea"),
                    notes=visual_diag.get("notes"),
                    detectedFeatures=visual_diag.get("detectedFeatures", []),
                    suspectedCondition=visual_diag.get("suspectedCondition", ""),
                    visualConfidence=visual_diag.get("visualConfidence", 0.0),
                    visualUrgency=visual_diag.get("visualUrgency", "Medium"),
                    visualSeverityScore=visual_diag.get("visualSeverityScore", 5.0),
                    erythemaLevel=visual_diag.get("erythemaLevel", "Moderate"),
                    differentialDiagnoses=[
                        VisualDifferential(
                            disease=d["disease"],
                            confidence=d["confidence"],
                            matchingVisualMarkers=d["matchingVisualMarkers"]
                        ) for d in visual_diag.get("differentialDiagnoses", [])
                    ],
                    recommendations=visual_diag.get("recommendations", [])
                )
            except Exception as e:
                print(f"[-] Visual image analysis error: {e}")
                visual_analysis_obj = None

        # 3. Symptom-based ML Inference
        has_symptoms = req.symptoms is not None and len(req.symptoms) > 0
        symptom_predictions = []
        normalized_user_symptoms = [s.lower().strip().replace("-", "_").replace(" ", "_") for s in (req.symptoms or [])]

        if has_symptoms:
            if not self.model or not self.symptoms_list:
                self.load_artifacts()

            feature_vector = np.zeros((1, len(self.symptoms_list)))
            for i, sym in enumerate(self.symptoms_list):
                if sym in normalized_user_symptoms:
                    feature_vector[0, i] = 1.0

            # Predict probabilities
            probabilities = self.model.predict_proba(feature_vector)[0]
            classes = self.model.classes_
            top_indices = np.argsort(probabilities)[::-1]
            top_indices_3 = top_indices[:3]

            raw_top_probs = [float(probabilities[idx]) for idx in top_indices_3]
            sum_probs = sum(raw_top_probs)
            if sum_probs > 0:
                norm_probs = [round((p / sum_probs) * 100, 1) for p in raw_top_probs]
            else:
                norm_probs = [60.0, 25.0, 15.0]

            diff = round(100.0 - sum(norm_probs), 1)
            norm_probs[0] = round(norm_probs[0] + diff, 1)

            for i, idx in enumerate(top_indices_3):
                disease_name = classes[idx]
                conf = norm_probs[i]
                relevant_syms = []
                disease_info = self.disease_map.get(disease_name, {})
                primary = disease_info.get("primary", [])
                secondary = disease_info.get("secondary", [])

                for s in normalized_user_symptoms:
                    if s in primary or s in secondary:
                        relevant_syms.append(s.replace("_", " ").title())
                if not relevant_syms:
                    relevant_syms = [s.replace("_", " ").title() for s in normalized_user_symptoms[:3]]

                symptom_predictions.append(PredictionItem(
                    disease=disease_name,
                    confidence=conf,
                    relevantSymptoms=relevant_syms
                ))

        # 4. Multi-Modal Fusion: Combine Symptom model and Visual Photo model
        final_predictions: List[PredictionItem] = []

        if visual_diag and not has_symptoms:
            # Case A: User uploaded photo only
            for diff in visual_diag.get("differentialDiagnoses", [])[:3]:
                final_predictions.append(PredictionItem(
                    disease=diff["disease"],
                    confidence=diff["confidence"],
                    relevantSymptoms=[
                        f"Visual Marker: {m}" for m in diff.get("matchingVisualMarkers", [])[:2]
                    ] or ["Clinical Visual Photography Analysis"]
                ))
        elif visual_diag and has_symptoms:
            # Case B: Multi-modal fusion (both photo and symptoms provided)
            top_visual_cond = visual_diag.get("suspectedCondition")
            visual_conf = visual_diag.get("visualConfidence", 85.0)

            # Check if top visual condition is already in symptom predictions
            matched_sym_pred = next((p for p in symptom_predictions if p.disease.lower() in top_visual_cond.lower() or top_visual_cond.lower() in p.disease.lower()), None)

            if matched_sym_pred:
                # Corroborated finding! Boost confidence
                fused_conf = min(round(matched_sym_pred.confidence * 0.45 + visual_conf * 0.55, 1), 94.5)
                matched_sym_pred.confidence = fused_conf
                matched_sym_pred.relevantSymptoms = list(set(
                    matched_sym_pred.relevantSymptoms + [f"Visual Marker: {m}" for m in visual_diag.get("detectedFeatures", [])[:2]]
                ))
                # Put it at the top
                remaining = [p for p in symptom_predictions if p != matched_sym_pred]
                final_predictions = [matched_sym_pred] + remaining
            else:
                # Add visual condition at top, scale others
                visual_item = PredictionItem(
                    disease=top_visual_cond,
                    confidence=round(visual_conf * 0.88, 1),
                    relevantSymptoms=[
                        f"Visual Marker: {m}" for m in visual_diag.get("detectedFeatures", [])[:2]
                    ]
                )
                scaled_symptom_preds = []
                rem_conf = 100.0 - visual_item.confidence
                for idx, p in enumerate(symptom_predictions[:2]):
                    weight = 0.65 if idx == 0 else 0.35
                    scaled_symptom_preds.append(PredictionItem(
                        disease=p.disease,
                        confidence=round(rem_conf * weight, 1),
                        relevantSymptoms=p.relevantSymptoms
                    ))
                final_predictions = [visual_item] + scaled_symptom_preds
        else:
            # Case C: Standard symptoms only (no photo)
            final_predictions = symptom_predictions

        # Normalize final top 3 confidences to sum to 100%
        final_predictions = final_predictions[:3]
        total_p = sum(p.confidence for p in final_predictions) or 1.0
        for p in final_predictions:
            p.confidence = round((p.confidence / total_p) * 100, 1)
        diff_total = round(100.0 - sum(p.confidence for p in final_predictions), 1)
        if final_predictions:
            final_predictions[0].confidence = round(final_predictions[0].confidence + diff_total, 1)

        # 5. Resolve Top Advice, Specialty, and Urgency
        top_disease = final_predictions[0].disease if final_predictions else "General Dermatological Condition"
        
        # Check if advice comes from visual catalog or standard catalog
        if visual_diag and (top_disease in VISUAL_DISEASE_CATALOG or visual_diag.get("suspectedCondition") == top_disease):
            vis_info = VISUAL_DISEASE_CATALOG.get(top_disease, VISUAL_DISEASE_CATALOG.get(visual_diag.get("suspectedCondition"), {}))
            specialty = vis_info.get("specialty", "Dermatologist")
            precautions = vis_info.get("precautions", DEFAULT_ADVICE["precautions"])
            dietary = vis_info.get("dietaryRecommendations", DEFAULT_ADVICE["dietaryRecommendations"])
            care_advice = vis_info.get("generalCareAdvice", DEFAULT_ADVICE["generalCareAdvice"])
            base_urgency = vis_info.get("urgency", "Medium")
        else:
            top_disease_info = self.disease_map.get(top_disease, {})
            top_advice = CLINICAL_ADVICE_CATALOG.get(top_disease, DEFAULT_ADVICE)
            specialty = top_disease_info.get("specialty", top_advice.get("specialty", "General Physician"))
            precautions = top_advice.get("precautions", DEFAULT_ADVICE["precautions"])
            dietary = top_advice.get("dietaryRecommendations", DEFAULT_ADVICE["dietaryRecommendations"])
            care_advice = top_advice.get("generalCareAdvice", DEFAULT_ADVICE["generalCareAdvice"])
            base_urgency = top_disease_info.get("base_urgency", "Medium")

        # Determine Urgency
        if is_red_flag:
            urgency = "High"
        else:
            if base_urgency == "High":
                urgency = "High"
            elif base_urgency == "Medium" and final_predictions and final_predictions[0].confidence > 75:
                urgency = "High"
            else:
                urgency = base_urgency

        version = self.metadata.get("version", "medpulse-rf-vision-1.0.0")

        return PredictionResponse(
            predictions=final_predictions,
            specialty=specialty,
            urgency=urgency,
            precautions=precautions,
            dietaryRecommendations=dietary,
            generalCareAdvice=care_advice,
            modelVersion=version,
            predictionTimestamp=datetime.now().isoformat(),
            isRedFlag=is_red_flag,
            redFlags=red_flags,
            visualAnalysis=visual_analysis_obj
        )
