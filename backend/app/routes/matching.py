"""
Matching API Routes

This module defines FastAPI routes for patient fuzzy matching in the Medifusion application.
It provides an endpoint to match incoming patient data with existing records using fuzzy string
matching and embedding similarity.

Endpoints:
- POST /fuzzy-match/: Accepts a list of patients and returns a summary of matched and unmatched records.

Dependencies:
- Requires database access and patient matching services.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.schemas import FuzzyMatchRequest
from database.database import get_db
from app.services.patient_matcher import process_fuzzy_match

matching_router = APIRouter()
null = None  # Placeholder for null values in JSON responses
@matching_router.post("/fuzzy-match")
def fuzzy_match(request: FuzzyMatchRequest, db: Session = Depends(get_db)):
    result = process_fuzzy_match(request.patients, db)
    return result
    