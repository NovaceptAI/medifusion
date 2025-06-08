"""
Patient Matcher Service

This module provides functions to match incoming patient data with existing records
using fuzzy string matching and embedding similarity. It supports parsing incoming
JSON, performing fuzzy and embedding-based matching, and updating or inserting records
in the database.

Functions:
- patient_to_string: Converts a PatientData object to a string for matching.
- parse_incoming_json: Cleans and parses raw JSON into PatientData objects.
- process_fuzzy_match: Matches incoming patients to existing ones using fuzzy and embedding methods.
- find_embedding_match: Finds the best embedding-based match for a patient.

Dependencies:
- Requires database access and utility functions for string matching and embeddings.
"""

from typing import List, Dict
from datetime import datetime
from database.schemas import PatientData
from database.patient_repository import get_all_patients, update_patient, insert_unmatched
from app.utils.string_matcher import is_fuzzy_match
from app.utils.embeddings_utils import get_openai_embedding, cosine_similarity

FUZZY_THRESHOLD = 90
EMBEDDING_THRESHOLD = 0.85

def patient_to_string(patient: PatientData) -> str:
    return " ".join(
        str(x) for x in filter(None, [
            patient.name,
            patient.dob,
            patient.ssn,
            patient.insurance_number,
            patient.gender,
            patient.address,
            patient.phone,
            patient.email,
            patient.medical_record_number,
            patient.diagnosis,
            patient.doctor_name,
            patient.hospital_name,
            " ".join(patient.medical_conditions or []),
            " ".join(patient.medications or [])
        ])
    )

def parse_incoming_json(raw_json: List[dict]) -> List[PatientData]:
    cleaned_patients = []
    for item in raw_json:
        try:
            patient = PatientData(**item)
            cleaned_patients.append(patient)
        except Exception as e:
            print(f"Skipping invalid record: {e}")
    return cleaned_patients

def process_fuzzy_match(patients_json: List[Dict], db) -> Dict:
    existing_patients = get_all_patients(db)
    matched_patients = []
    unmatched_patients = []
    new_patients = []

    for entry in patients_json:
        incoming = entry
        incoming_str = patient_to_string(incoming)

        best_match = None
        best_score = 0
        method = None

        for db_patient in existing_patients:
            is_match, score = is_fuzzy_match(db_patient, incoming)
            if is_match and score > best_score:
                best_score = score
                best_match = db_patient
                method = "fuzzy"

        if best_score >= FUZZY_THRESHOLD:
            incoming_data = incoming.dict()
            if isinstance(incoming_data.get("dob"), str):
                try:
                    incoming_data["dob"] = datetime.strptime(incoming_data["dob"], "%Y-%m-%d").date()
                except ValueError:
                    incoming_data["dob"] = None

            update_patient(db, best_match, incoming_data)
            matched_patients.append({
                "incoming": incoming.dict(),
                "matched_with": best_match.to_dict(),
                "method": method,
                "score": best_score,
                "status": "updated",
                "review_status": "Confirmed" if best_score >= 95 else "Human Review"
            })
            continue

        incoming_embedding = get_openai_embedding(incoming_str)
        emb_best = None
        emb_score = 0

        for db_patient in existing_patients:
            if db_patient.embedding:
                # Parse string embedding to list if needed
                embedding = db_patient.embedding
                if isinstance(embedding, str):
                    try:
                        embedding = ast.literal_eval(embedding)
                    except Exception:
                        continue  # skip if parsing fails
                score = cosine_similarity(incoming_embedding, embedding)
                if score > emb_score:
                    emb_score = score
                    emb_best = db_patient

        if emb_score >= EMBEDDING_THRESHOLD:
            incoming_data = incoming.dict()
            if isinstance(incoming_data.get("dob"), str):
                try:
                    incoming_data["dob"] = datetime.strptime(incoming_data["dob"], "%Y-%m-%d").date()
                except ValueError:
                    incoming_data["dob"] = None

            update_patient(db, emb_best, incoming_data)
            matched_patients.append({
                "incoming": incoming.dict(),
                "matched_with": emb_best.to_dict(),
                "method": "embedding",
                "score": round(emb_score * 100, 2),
                "status": "updated",
                "review_status": "Confirmed" if emb_score >= 0.95 else "Human Review"
            })
        elif all([incoming.name, incoming.dob, incoming.ssn, incoming.insurance_number]):
            new_patients.append({
                **incoming.dict(),
                "review_status": "Human Review"
            })
        else:
            unmatched_patients.append({
                **incoming.dict(),
                "reason": "no similar match found"
            })

    return {
        "matched_patients": matched_patients,
        "unmatched_patients": unmatched_patients,
        "new_patients": new_patients,
        "summary": {
            "total": len(patients_json),
            "matched": len(matched_patients),
            "unmatched": len(unmatched_patients),
            "new": len(new_patients),
            "review_required": len([m for m in matched_patients if m["review_status"] == "Human Review"]) + len(new_patients),
            "confirmed": len([m for m in matched_patients if m["review_status"] == "Confirmed"])
        }
    }

def find_embedding_match(incoming, db, similarity_threshold=0.85):
    incoming_text = patient_to_string(incoming)
    incoming_embedding = get_openai_embedding(incoming_text)
    existing_patients = get_all_patients(db)
    best_match = None
    best_score = 0

    for patient in existing_patients:
        if patient.embedding:
            score = cosine_similarity(incoming_embedding, patient.embedding)
            if score > similarity_threshold and score > best_score:
                best_match = patient
                best_score = score

    return best_match, best_score