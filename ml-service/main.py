import os
import uvicorn
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from schemas import PredictionRequest, PredictionResponse
from predict import SymptomPredictor
import train

app = FastAPI(
    title="MedPulse Clinical AI - ML Inference Service",
    description="Probabilistic symptom-to-disease inference microservice with deterministic emergency triage rules.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = None

@app.on_event("startup")
def startup_event():
    global predictor
    model_file = os.path.join("models", "model.joblib")
    if not os.path.exists(model_file):
        print("[!] Model file not found. Auto-training Random Forest model...")
        train.train_and_export()
    
    predictor = SymptomPredictor()
    print("[+] MedPulse Clinical AI ML Service ready on port 8000.")

@app.get("/health")
def health_check():
    is_ready = predictor is not None and predictor.model is not None
    return {
        "status": "ok",
        "service": "MedPulse ML Microservice",
        "version": "1.0.0",
        "modelLoaded": is_ready,
        "featuresCount": len(predictor.symptoms_list) if is_ready else 0
    }

@app.post("/predict", response_model=PredictionResponse)
def predict_symptoms(request: PredictionRequest):
    if not predictor or not predictor.model:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Predictor engine is initializing or model is unavailable."
        )
    
    try:
        response = predictor.predict(request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
