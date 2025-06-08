from typing import List, Optional
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Literal
from datetime import date

class PatientData(BaseModel):
    name: str
    dob: Optional[str] = None               # Date of birth in 'YYYY-MM-DD' format
    ssn: Optional[str] = None               # Social Security Number
    insurance_number: Optional[str] = None  # Insurance ID
    medical_conditions: Optional[List[str]] = []    # Medical conditions as list of strings
    address: Optional[str] = None           # Address (optional, may help in fuzzy matching)
    phone: Optional[str] = None             # Phone number
    email: Optional[str] = None             # Email address
    gender: Optional[str] = None   

class FuzzyMatchRequest(BaseModel):
    patients: List[PatientData]


class VitalSigns(BaseModel):
    BloodPressure: Optional[str]
    HeartRate: Optional[str]
    Temperature: Optional[str]
    Weight: Optional[str]
    Height: Optional[str]


class FollowUpCareInstructions(BaseModel):
    Medications: Optional[str]
    Diet: Optional[str]
    Exercise: Optional[str]
    Lifestyle: Optional[str]
    FollowUp: Optional[str]


class LaboratoryResults(BaseModel):
    TestName: Optional[str]
    TestDate: Optional[date]
    Results: Optional[List[str]]
    ReferenceRanges: Optional[List[str]]
    AbnormalFindings: Optional[List[str]]
    CriticalValues: Optional[List[str]]


class DocumentMetadata(BaseModel):
    ConfidenceScore: Optional[str]
    ClassificationReasoning: Optional[str]
    UrgencyLevel: Optional[str]
    OverallTone: Optional[str]
    Completeness: Optional[str]
    Legibility: Optional[str]
    DocumentCondition: Optional[str]
    InformationCompleteness: Optional[str]
    DataReliability: Optional[str]
    MissingCriticalInfo: Optional[List[str]]
    ExtractionChallenges: Optional[List[str]]


class ExtractedData(BaseModel):
    PatientName: Optional[str]
    DateOfBirth: Optional[date]
    Age: Optional[int]
    Gender: Optional[str]
    ContactNumber: Optional[str]
    Email: Optional[EmailStr]
    Address: Optional[str]
    MRN: Optional[str]
    VisitDate: Optional[date]
    DateOfAdmission: Optional[date]
    DateOfDischarge: Optional[date]
    DoctorName: Optional[str]
    Department: Optional[str]
    HospitalName: Optional[str]
    Diagnosis: Optional[str]
    SecondaryDiagnosis: Optional[str]
    Symptoms: Optional[List[str]]
    MedicalConditions: Optional[List[str]]
    MedicationsPrescribed: Optional[List[str]]
    Allergies: Optional[List[str]]
    VitalSigns: Optional[VitalSigns]
    ProceduresPerformed: Optional[List[str]]
    LaboratoryResults: Optional[LaboratoryResults]
    PatientConditionAtDischarge: Optional[str]
    FollowUpCareInstructions: Optional[FollowUpCareInstructions]
    InsuranceInfo: Optional[str]
    EmergencyContact: Optional[str]
    ProviderNotes: Optional[str]
    BillingCodes: Optional[List[str]]
    DocumentMetadata: Optional[DocumentMetadata]


class StructuredData(BaseModel):
    DocumentType: Optional[str]
    ExtractedData: ExtractedData


class StructuredPatientInput(BaseModel):
    structured_data: StructuredData

    model_config = {
        "from_attributes": True
}
    
class PatientResponse(BaseModel):
    id: int
    name: Optional[str]
    dob: Optional[date]
    ssn: Optional[str]
    gender: Optional[str]
    address: Optional[str]
    phone: Optional[str]
    email: Optional[EmailStr]
    insurance_number: Optional[str]
    medical_conditions: Optional[str]
    medications: Optional[str]
    diagnosis: Optional[str]
    doctor_name: Optional[str]
    hospital_name: Optional[str]
    visit_date: Optional[date]
    follow_up: Optional[str]
    provider_notes: Optional[str]

    class Config:
        orm_mode = True


class PatientContextCreate(BaseModel):
    patient_id: int
    context_json: dict

class ChatRequest(BaseModel):
    patient_id: str
    question: str