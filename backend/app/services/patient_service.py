from sqlalchemy.orm import Session
from database.schemas import StructuredPatientInput
from database import patient_repository  # adjust if your path differs
from fastapi import HTTPException

def create_patient_from_structured(db: Session, structured_data: StructuredPatientInput):
    try:
        return patient_repository.add_patient_from_json(db, structured_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding patient: {str(e)}")

def get_all_patients(db: Session):
    return patient_repository.get_all_patients(db)

def get_patient_by_id(db: Session, patient_id: int):
    patient = db.query(patient_repository.Patient).filter_by(id=patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient
