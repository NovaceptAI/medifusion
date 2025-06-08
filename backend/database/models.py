from sqlalchemy import Column, Integer, String, Date, Text, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, DateTime, JSON, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
import uuid
from datetime import datetime

Base = declarative_base()

# class Patient(Base):
#     __tablename__ = "patients"

#     id = Column(Integer, primary_key=True)
#     name = Column(String)
#     dob = Column(Date)
#     ssn = Column(String)
#     insurance_number = Column(String)
#     medical_conditions = Column(String)
#     embedding = Column(JSONB, nullable=True)  # Store serialized list as JSON string

#     def to_dict(self):
#         return {
#             "id": self.id,
#             "name": self.name,
#             "dob": self.dob.isoformat() if self.dob else None,
#             "ssn": self.ssn,
#             "insurance_number": self.insurance_number,
#             "medical_conditions": self.medical_conditions,
#             "embedding": None  # or base64 if needed
#         }

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    dob = Column(Date)
    ssn = Column(String, unique=True)
    gender = Column(String)
    address = Column(String)
    phone = Column(String)
    email = Column(String)
    insurance_number = Column(String)
    medical_conditions = Column(Text)
    medications = Column(Text)
    diagnosis = Column(Text)
    doctor_name = Column(String)
    hospital_name = Column(String)
    visit_date = Column(Date)
    follow_up = Column(Text)
    provider_notes = Column(Text)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "dob": self.dob.isoformat() if self.dob else None,
            "ssn": self.ssn,
            "gender": self.gender,
            "address": self.address,
            "phone": self.phone,
            "email": self.email,
            "insurance_number": self.insurance_number,
            "medical_conditions": self.medical_conditions,
            "medications": self.medications,
            "diagnosis": self.diagnosis,
            "doctor_name": self.doctor_name,
            "hospital_name": self.hospital_name,
            "visit_date": self.visit_date.isoformat() if self.visit_date else None,
            "follow_up": self.follow_up,
            "provider_notes": self.provider_notes,
        }

class UnmatchedPatient(Base):
    __tablename__ = "unmatched_patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    dob = Column(Date, nullable=True)
    ssn = Column(String, nullable=True)
    insurance_number = Column(String, nullable=True)
    medical_conditions = Column(Text, nullable=True)


class PatientContext(Base):
    __tablename__ = "patient_contexts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    context_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)