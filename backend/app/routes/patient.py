from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.schemas import PatientResponse, StructuredPatientInput
from app.services import patient_service
from database.database import get_db
from typing import List
from database.models import Patient

patient_router = APIRouter(prefix="/patients", tags=["Patients"])

@patient_router.post("/put", response_model=dict)
def create_patient_endpoint(payload: StructuredPatientInput, db: Session = Depends(get_db)):
    patient = patient_service.create_patient_from_structured(db, payload)
    return {"message": "Patient added successfully", "patient_id": patient.id}

@patient_router.get("/getall", response_model=List[PatientResponse])
def get_all_patients_endpoint(db: Session = Depends(get_db)):
    return patient_service.get_all_patients(db)

@patient_router.get("/getbyid/{patient_id}", response_model=PatientResponse)
def get_patient_by_id_endpoint(patient_id: int, db: Session = Depends(get_db)):
    return patient_service.get_patient_by_id(db, patient_id)
