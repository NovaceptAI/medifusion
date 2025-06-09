from sqlalchemy.orm import Session
from database.models import PatientContext  # SQLAlchemy model
from uuid import UUID

class PatientContextRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_context_by_patient_id(self, document_id: UUID):
        return self.db.query(PatientContext).filter_by(document_id=document_id).first()
    
    def save_patient_context(self, document_id: UUID, context_json: dict):
        context = PatientContext(document_id=document_id, context_json=context_json)
        self.db.add(context)
        self.db.commit()
        self.db.close()

        return context