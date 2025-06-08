from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime

class VitalSigns(BaseModel):
    blood_pressure: Optional[str] = None
    heart_rate: Optional[str] = None
    temperature: Optional[str] = None
    weight: Optional[str] = None
    height: Optional[str] = None

class PatientData(BaseModel):
    name: str
    dob: Optional[date] = None
    gender: Optional[str] = None
    ssn: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    insurance_number: Optional[str] = None
    medical_record_number: Optional[str] = None
    emergency_contact: Optional[str] = None
    medical_conditions: Optional[List[str]] = []
    medications: Optional[List[str]] = []
    allergies: Optional[List[str]] = []
    diagnosis: Optional[str] = None
    doctor_name: Optional[str] = None
    department: Optional[str] = None
    hospital_name: Optional[str] = None
    visit_date: Optional[date] = None
    blood_pressure: Optional[str] = None
    heart_rate: Optional[str] = None
    temperature: Optional[str] = None
    weight: Optional[str] = None
    height: Optional[str] = None
    follow_up: Optional[str] = None
    provider_notes: Optional[str] = None
    embedding: Optional[List[float]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class FuzzyMatchRequest(BaseModel):
    patients: List[PatientData]