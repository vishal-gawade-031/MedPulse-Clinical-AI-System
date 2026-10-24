from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SeverityItem(BaseModel):
    symptomId: Optional[str] = None
    severity: Optional[Any] = None # number 1-10 or "Mild"/"Moderate"/"Severe"
    duration: Optional[Any] = None # Dict or number
    notes: Optional[str] = None

class VitalsData(BaseModel):
    temperature: Optional[float] = None
    temperatureUnit: Optional[str] = "C"
    heartRate: Optional[float] = None
    systolicBP: Optional[float] = None
    diastolicBP: Optional[float] = None
    respiratoryRate: Optional[float] = None
    oxygenSaturation: Optional[float] = None

class PredictionRequest(BaseModel):
    symptoms: Optional[List[str]] = Field(default_factory=list, description="List of normalized symptom identifiers")
    severityData: Optional[List[SeverityItem]] = None
    vitals: Optional[VitalsData] = None
    context: Optional[Dict[str, Any]] = None
    photoData: Optional[str] = Field(default=None, description="Optional base64 encoded photo or image data URL")
    photoMetadata: Optional[Dict[str, Any]] = Field(default=None, description="Optional metadata: fileName, bodyArea, notes")

class PredictionItem(BaseModel):
    disease: str
    confidence: float
    relevantSymptoms: List[str] = []

class VisualDifferential(BaseModel):
    disease: str
    confidence: float
    matchingVisualMarkers: List[str] = []

class VisualAnalysisResult(BaseModel):
    hasPhoto: bool = False
    analyzedAt: Optional[str] = None
    bodyArea: Optional[str] = None
    notes: Optional[str] = None
    detectedFeatures: List[str] = []
    suspectedCondition: str = ""
    visualConfidence: float = 0.0
    visualUrgency: str = "Medium"
    visualSeverityScore: float = 5.0
    erythemaLevel: Optional[str] = "Moderate"
    differentialDiagnoses: List[VisualDifferential] = []
    recommendations: List[str] = []

class PredictionResponse(BaseModel):
    predictions: List[PredictionItem]
    specialty: str
    urgency: str
    precautions: List[str]
    dietaryRecommendations: List[str]
    generalCareAdvice: List[str]
    modelVersion: str
    predictionTimestamp: str
    isRedFlag: bool = False
    redFlags: List[str] = []
    visualAnalysis: Optional[VisualAnalysisResult] = None
