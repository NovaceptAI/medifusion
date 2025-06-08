from sqlalchemy import Column, Integer, String, Date, Text, Float, DateTime, ARRAY
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    dob = Column(Date)
    gender = Column(String)
    ssn = Column(String)
    address = Column(Text)
    phone = Column(String)
    email = Column(String)
    insurance_number = Column(String)
    medical_record_number = Column(String)
    emergency_contact = Column(String)
    medical_conditions = Column(ARRAY(String))
    medications = Column(ARRAY(String))
    allergies = Column(ARRAY(String))
    diagnosis = Column(String)
    doctor_name = Column(String)
    department = Column(String)
    hospital_name = Column(String)
    visit_date = Column(Date)
    blood_pressure = Column(String)
    heart_rate = Column(String)
    temperature = Column(String)
    weight = Column(String)
    height = Column(String)
    follow_up = Column(Text)
    provider_notes = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    embedding = Column(JSONB, nullable=True)  # serialized OpenAI vector

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "dob": self.dob.isoformat() if self.dob else None,
            "gender": self.gender,
            "ssn": self.ssn,
            "address": self.address,
            "phone": self.phone,
            "email": self.email,
            "insurance_number": self.insurance_number,
            "medical_record_number": self.medical_record_number,
            "emergency_contact": self.emergency_contact,
            "medical_conditions": self.medical_conditions,
            "medications": self.medications,
            "allergies": self.allergies,
            "diagnosis": self.diagnosis,
            "doctor_name": self.doctor_name,
            "department": self.department,
            "hospital_name": self.hospital_name,
            "visit_date": self.visit_date.isoformat() if self.visit_date else None,
            "blood_pressure": self.blood_pressure,
            "heart_rate": self.heart_rate,
            "temperature": self.temperature,
            "weight": self.weight,
            "height": self.height,
            "follow_up": self.follow_up,
            "provider_notes": self.provider_notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "embedding": self.embedding
        }

class UnmatchedPatient(Base):
    __tablename__ = "unmatched_patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    dob = Column(Date, nullable=True)
    gender = Column(String, nullable=True)
    ssn = Column(String, nullable=True)
    insurance_number = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    medical_conditions = Column(ARRAY(String), nullable=True)
    embedding = Column(JSONB, nullable=True)