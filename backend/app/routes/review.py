from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.schemas import PatientData
from database.database import get_db
from database.patient_repository import get_all_patients, update_patient
from typing import List
from datetime import datetime

review_router = APIRouter()

@review_router.post("/review")
def human_review_update(incoming: PatientData, db: Session = Depends(get_db)):
    existing_patients = get_all_patients(db)

    matched = next((p for p in existing_patients if p.name == incoming.name), None)
    if matched:
        patient_data = incoming.dict()

        # Parse date if needed
        if isinstance(patient_data.get("dob"), str):
            try:
                patient_data["dob"] = datetime.strptime(patient_data["dob"], "%Y-%m-%d").date()
            except ValueError:
                patient_data["dob"] = None

        update_patient(db, matched, patient_data)
        return {
            "name": matched.name,
            "message": "Update successful"
        }

    return {
        "name": incoming.name,
        "message": "Update successful"
    }