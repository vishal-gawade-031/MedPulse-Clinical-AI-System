import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from datetime import datetime

# 45+ Clinical Symptoms covering multiple physiological systems
SYMPTOMS_LIST = [
    # General / Systemic
    "fever", "high_fever", "fatigue", "chills", "sweating", "malaise", "weight_loss", "loss_of_appetite",
    # Respiratory
    "cough", "dry_cough", "productive_cough", "shortness_of_breath", "wheezing", "chest_tightness", "sore_throat",
    # Cardiovascular & Emergency
    "chest_pain", "severe_chest_pain", "palpitations", "dizziness", "lightheadedness", "fainting",
    # Gastrointestinal
    "nausea", "vomiting", "abdominal_pain", "diarrhea", "constipation", "heartburn", "acid_reflux", "bloating",
    # Neurological
    "headache", "severe_headache", "migraine", "stiff_neck", "confusion", "blurred_vision", "numbness",
    # Musculoskeletal
    "joint_pain", "muscle_aches", "back_pain", "joint_swelling", "stiffness",
    # Dermatological
    "skin_rash", "itching", "red_spots", "skin_lesions",
    # Urinary & ENT
    "painful_urination", "frequent_urination", "runny_nose", "nasal_congestion", "sneezing", "ear_pain"
]

# 28 Clinically Plausible Diseases with primary and secondary symptom associations
DISEASE_SYMPTOM_MAP = {
    "Common Cold": {
        "primary": ["runny_nose", "nasal_congestion", "sneezing", "sore_throat", "cough"],
        "secondary": ["headache", "fatigue", "chills", "malaise"],
        "specialty": "General Physician",
        "base_urgency": "Low"
    },
    "Influenza": {
        "primary": ["high_fever", "muscle_aches", "fatigue", "chills", "dry_cough"],
        "secondary": ["headache", "sore_throat", "malaise", "loss_of_appetite"],
        "specialty": "General Physician",
        "base_urgency": "Medium"
    },
    "Pneumonia": {
        "primary": ["productive_cough", "high_fever", "shortness_of_breath", "chest_pain", "chills"],
        "secondary": ["fatigue", "sweating", "loss_of_appetite", "malaise"],
        "specialty": "Pulmonologist",
        "base_urgency": "High"
    },
    "Bronchial Asthma": {
        "primary": ["wheezing", "shortness_of_breath", "cough", "chest_tightness"],
        "secondary": ["fatigue", "dry_cough"],
        "specialty": "Pulmonologist",
        "base_urgency": "Medium"
    },
    "Acute Bronchitis": {
        "primary": ["productive_cough", "fatigue", "sore_throat", "chest_tightness"],
        "secondary": ["fever", "shortness_of_breath", "muscle_aches", "chills"],
        "specialty": "Pulmonologist",
        "base_urgency": "Medium"
    },
    "Sinusitis": {
        "primary": ["nasal_congestion", "headache", "runny_nose", "fever"],
        "secondary": ["fatigue", "sore_throat", "cough"],
        "specialty": "ENT Specialist",
        "base_urgency": "Low"
    },
    "Tonsillitis": {
        "primary": ["sore_throat", "fever", "painful_urination", "ear_pain"], # ear_pain, fever, malaise
        "secondary": ["headache", "chills", "loss_of_appetite"],
        "specialty": "ENT Specialist",
        "base_urgency": "Low"
    },
    "Allergic Rhinitis": {
        "primary": ["sneezing", "runny_nose", "nasal_congestion", "itching"],
        "secondary": ["headache", "fatigue"],
        "specialty": "Allergist / Immunologist",
        "base_urgency": "Low"
    },
    "Migraine": {
        "primary": ["severe_headache", "headache", "nausea", "blurred_vision"],
        "secondary": ["vomiting", "dizziness", "fatigue"],
        "specialty": "Neurologist",
        "base_urgency": "Medium"
    },
    "Hypertension": {
        "primary": ["headache", "dizziness", "palpitations", "blurred_vision"],
        "secondary": ["fatigue", "chest_pain", "shortness_of_breath"],
        "specialty": "Cardiologist",
        "base_urgency": "Medium"
    },
    "Coronary Artery Disease": {
        "primary": ["chest_pain", "severe_chest_pain", "shortness_of_breath", "palpitations"],
        "secondary": ["dizziness", "sweating", "fatigue", "nausea"],
        "specialty": "Cardiologist",
        "base_urgency": "High"
    },
    "Gastroenteritis": {
        "primary": ["diarrhea", "vomiting", "nausea", "abdominal_pain"],
        "secondary": ["fever", "chills", "fatigue", "loss_of_appetite"],
        "specialty": "Gastroenterologist",
        "base_urgency": "Medium"
    },
    "GERD": {
        "primary": ["heartburn", "acid_reflux", "chest_pain", "bloating"],
        "secondary": ["nausea", "dry_cough", "sore_throat"],
        "specialty": "Gastroenterologist",
        "base_urgency": "Low"
    },
    "Gastritis": {
        "primary": ["abdominal_pain", "nausea", "heartburn", "bloating", "loss_of_appetite"],
        "secondary": ["vomiting", "acid_reflux", "malaise"],
        "specialty": "Gastroenterologist",
        "base_urgency": "Low"
    },
    "Food Poisoning": {
        "primary": ["vomiting", "diarrhea", "abdominal_pain", "fever", "nausea"],
        "secondary": ["chills", "fatigue", "muscle_aches"],
        "specialty": "General Physician",
        "base_urgency": "Medium"
    },
    "Urinary Tract Infection": {
        "primary": ["painful_urination", "frequent_urination", "fever"],
        "secondary": ["abdominal_pain", "chills", "fatigue", "malaise"],
        "specialty": "Urologist / Nephrologist",
        "base_urgency": "Medium"
    },
    "Type 2 Diabetes": {
        "primary": ["frequent_urination", "fatigue", "weight_loss", "blurred_vision"],
        "secondary": ["itching", "muscle_aches", "dizziness"],
        "specialty": "Endocrinologist",
        "base_urgency": "Medium"
    },
    "Dengue Fever": {
        "primary": ["high_fever", "severe_headache", "joint_pain", "muscle_aches", "skin_rash"],
        "secondary": ["vomiting", "nausea", "fatigue", "red_spots"],
        "specialty": "Infectious Disease Specialist",
        "base_urgency": "High"
    },
    "Malaria": {
        "primary": ["high_fever", "chills", "sweating", "headache", "nausea"],
        "secondary": ["vomiting", "muscle_aches", "fatigue", "diarrhea"],
        "specialty": "Infectious Disease Specialist",
        "base_urgency": "High"
    },
    "Typhoid Fever": {
        "primary": ["high_fever", "abdominal_pain", "headache", "fatigue", "constipation"],
        "secondary": ["loss_of_appetite", "diarrhea", "chills", "muscle_aches"],
        "specialty": "Infectious Disease Specialist",
        "base_urgency": "High"
    },
    "Chickenpox": {
        "primary": ["skin_rash", "itching", "red_spots", "skin_lesions", "fever"],
        "secondary": ["fatigue", "loss_of_appetite", "headache", "malaise"],
        "specialty": "Dermatologist",
        "base_urgency": "Medium"
    },
    "Contact Dermatitis": {
        "primary": ["skin_rash", "itching", "red_spots", "skin_lesions"],
        "secondary": ["malaise"],
        "specialty": "Dermatologist",
        "base_urgency": "Low"
    },
    "Rheumatoid Arthritis": {
        "primary": ["joint_pain", "joint_swelling", "stiffness", "fatigue"],
        "secondary": ["muscle_aches", "fever", "weight_loss"],
        "specialty": "Rheumatologist",
        "base_urgency": "Medium"
    },
    "Osteoarthritis": {
        "primary": ["joint_pain", "stiffness", "joint_swelling"],
        "secondary": ["back_pain", "muscle_aches"],
        "specialty": "Orthopedic Specialist",
        "base_urgency": "Low"
    },
    "Iron Deficiency Anemia": {
        "primary": ["fatigue", "dizziness", "lightheadedness", "shortness_of_breath"],
        "secondary": ["headache", "palpitations", "malaise"],
        "specialty": "Hematologist",
        "base_urgency": "Low"
    },
    "Pulmonary Tuberculosis": {
        "primary": ["productive_cough", "fever", "night_sweats", "sweating", "weight_loss"],
        "secondary": ["fatigue", "chest_pain", "chills", "loss_of_appetite"],
        "specialty": "Pulmonologist",
        "base_urgency": "High"
    },
    "Viral Hepatitis": {
        "primary": ["fatigue", "loss_of_appetite", "nausea", "vomiting", "abdominal_pain"],
        "secondary": ["fever", "joint_pain", "itching"],
        "specialty": "Gastroenterologist",
        "base_urgency": "High"
    },
    "Tension Headache": {
        "primary": ["headache", "stiff_neck", "muscle_aches", "fatigue"],
        "secondary": ["dizziness", "blurred_vision"],
        "specialty": "Neurologist",
        "base_urgency": "Low"
    }
}

def generate_synthetic_dataset(num_samples_per_disease=160):
    np.random.seed(42)
    rows = []
    
    for disease, profile in DISEASE_SYMPTOM_MAP.items():
        primary_syms = profile["primary"]
        secondary_syms = profile["secondary"]
        
        for _ in range(num_samples_per_disease):
            feature_vector = {sym: 0 for sym in SYMPTOMS_LIST}
            
            # Primary symptoms have 75% - 95% probability of being present
            for sym in primary_syms:
                if sym in feature_vector:
                    feature_vector[sym] = 1 if np.random.rand() < np.random.uniform(0.75, 0.95) else 0
                    
            # Secondary symptoms have 25% - 55% probability of being present
            for sym in secondary_syms:
                if sym in feature_vector:
                    feature_vector[sym] = 1 if np.random.rand() < np.random.uniform(0.25, 0.55) else 0
                    
            # Background clinical noise: tiny probability (2-4%) of random irrelevant symptoms
            for sym in SYMPTOMS_LIST:
                if sym not in primary_syms and sym not in secondary_syms:
                    if np.random.rand() < 0.03:
                        feature_vector[sym] = 1
            
            # Ensure at least 2 symptoms are present
            if sum(feature_vector.values()) < 2 and primary_syms:
                for sym in primary_syms[:2]:
                    if sym in feature_vector:
                        feature_vector[sym] = 1
                        
            feature_vector["disease"] = disease
            rows.append(feature_vector)
            
    df = pd.DataFrame(rows)
    return df

def train_and_export():
    print("[*] Generating synthetic clinical symptom dataset...")
    df = generate_synthetic_dataset(num_samples_per_disease=180)
    print(f"[*] Dataset created with {len(df)} samples across {len(DISEASE_SYMPTOM_MAP)} conditions and {len(SYMPTOMS_LIST)} features.")
    
    X = df[SYMPTOMS_LIST]
    y = df["disease"]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print("[*] Training RandomForestClassifier...")
    clf = RandomForestClassifier(
        n_estimators=130,
        max_depth=18,
        min_samples_split=3,
        random_state=42,
        n_jobs=-1
    )
    clf.fit(X_train, y_train)
    
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)
    
    print(f"[*] Evaluation Results:")
    print(f"    - Accuracy:  {acc * 100:.2f}%")
    print(f"    - Precision: {prec * 100:.2f}%")
    print(f"    - Recall:    {rec * 100:.2f}%")
    print(f"    - F1 Score:  {f1 * 100:.2f}%")
    
    os.makedirs("models", exist_ok=True)
    os.makedirs("data", exist_ok=True)
    
    # Save model and artifacts
    model_path = os.path.join("models", "model.joblib")
    joblib.dump(clf, model_path)
    
    symptoms_path = os.path.join("models", "symptoms.json")
    with open(symptoms_path, "w") as f:
        json.dump(SYMPTOMS_LIST, f, indent=2)
        
    disease_map_path = os.path.join("models", "disease_map.json")
    with open(disease_map_path, "w") as f:
        json.dump(DISEASE_SYMPTOM_MAP, f, indent=2)
        
    metadata = {
        "version": "medpulse-rf-1.0.0",
        "training_date": datetime.now().isoformat(),
        "algorithm": "RandomForestClassifier",
        "n_estimators": 130,
        "max_depth": 18,
        "number_of_features": len(SYMPTOMS_LIST),
        "number_of_classes": len(DISEASE_SYMPTOM_MAP),
        "metrics": {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4)
        },
        "classes": list(clf.classes_)
    }
    
    with open("model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)
        
    print("[+] Model and metadata exported successfully!")

if __name__ == "__main__":
    train_and_export()
