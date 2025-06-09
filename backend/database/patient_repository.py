from database.schemas import StructuredPatientInput
from database.models import Patient, UnmatchedPatient
from sqlalchemy.orm import Session
from datetime import datetime

def get_all_patients(db: Session):
    return db.query(Patient).all()

def update_patient(db: Session, existing: Patient, new_data: dict):
    existing.dob = new_data.get("dob", existing.dob)
    existing.ssn = new_data.get("ssn", existing.ssn)
    existing.insurance_number = new_data.get("insurance_number", existing.insurance_number)
    existing.medical_conditions = ",".join(new_data.get("medical_conditions", []))
    db.commit()

def insert_unmatched(db: Session, data: dict):
    new_entry = UnmatchedPatient(
        name=data.get("name"),
        dob=data.get("dob"),
        ssn=data.get("ssn"),
        insurance_number=data.get("insurance_number"),
        medical_conditions=",".join(data.get("medical_conditions", []))
    )
    db.add(new_entry)
    db.commit()


def parse_date(date_str):
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except:
        return None

def add_patient_from_json(db: Session, structured_data: StructuredPatientInput):
    def safe_join(data):
        if isinstance(data, list):
            return ", ".join(data)
        elif isinstance(data, str):
            return data
        return None

    data = structured_data.structured_data.ExtractedData

    patient = Patient(
        name=data.PatientName,
        dob=data.DateOfBirth,
        ssn=data.MRN,
        gender=data.Gender,
        address=data.Address,
        phone=data.ContactNumber,
        email=data.Email,
        insurance_number=data.InsuranceInfo,
        medical_conditions=safe_join(data.MedicalConditions),
        medications=safe_join(data.MedicationsPrescribed),
        diagnosis=data.Diagnosis,
        doctor_name=data.DoctorName,
        hospital_name=data.HospitalName,
        visit_date=data.VisitDate,
        follow_up=data.FollowUpCareInstructions.FollowUp if data.FollowUpCareInstructions else None,
        provider_notes=data.ProviderNotes,
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

