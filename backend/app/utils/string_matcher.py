from fuzzywuzzy import fuzz
from database.models import Patient
from database.schemas import PatientData

def is_fuzzy_match(existing: Patient, incoming: PatientData, threshold=90):
    """
    Enhanced fuzzy matching that considers multiple fields with individual weights.
    """
    score = 0

    # Name match
    name_score = fuzz.token_sort_ratio(existing.name or "", incoming.name or "")
    score += 0.5 * name_score

    # Date of Birth match
    if existing.dob and incoming.dob and existing.dob == incoming.dob:
        score += 10

    # SSN match
    if existing.ssn and incoming.ssn and existing.ssn == incoming.ssn:
        score += 10

    # Insurance Number match
    if existing.insurance_number and incoming.insurance_number and existing.insurance_number == incoming.insurance_number:
        score += 5

    # Address match
    address_score = fuzz.token_sort_ratio(existing.address or "", incoming.address or "")
    score += 0.2 * address_score

    # Email match
    email_score = fuzz.token_sort_ratio(existing.email or "", incoming.email or "")
    score += 0.1 * email_score

    # Phone match
    phone_score = fuzz.token_sort_ratio(existing.phone or "", incoming.phone or "")
    score += 0.1 * phone_score

    final_score = min(score, 100)  # Cap score at 100

    return final_score >= threshold, round(final_score, 2)