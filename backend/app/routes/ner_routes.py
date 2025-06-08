from fastapi import APIRouter, HTTPException, Body
from app.services.ner_openai_service import analyze_medical_document  # Adjust import as needed

ner_router = APIRouter()

@ner_router.post("/extract_ner")
async def extract_ner(extracted_text: str = Body(..., embed=True)):
    try:
        result = analyze_medical_document(extracted_text, is_file=False)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NER extraction failed: {str(e)}")