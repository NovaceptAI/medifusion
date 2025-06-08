from sqlalchemy.orm import Session
from database.models import PatientContext  # SQLAlchemy model
from uuid import UUID

class PatientContextRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_context_by_patient_id(self, patient_id: int):
        return self.db.query(PatientContext).filter_by(patient_id=patient_id).first()
    
    def save_patient_context(db: Session, patient_id: int, context_json: dict):
        context = PatientContext(patient_id=patient_id, context_json=context_json)
        db.add(context)
        db.commit()
        db.refresh(context)
        return context