import openai
import os
from dotenv import load_dotenv
from typing import Union
import json
import re
import uuid
# Load environment variables
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# Prompt template
PROMPT_TEMPLATE = """
You are an expert medical document parser, Named Entity Recognition (NER) specialist, and document classifier. Your task is to:

1. Identify and classify the type of medical document (e.g., Lab Report, Prescription, Insurance Form, Discharge Summary, etc.).
2. Analyze the provided medical document or image and extract ALL relevant patient and clinical information.
3. Evaluate the document's tone, urgency, completeness, and legibility.
4. Return a well-structured JSON object following the exact format shown below.

Document Text:
\"\"\"
{document_text}
\"\"\"

Return the output in this exact JSON schema — do NOT add any explanation or extra text:

{
  "structured_data": 
    {
      "DocumentType": "Discharge Summary",
      "ExtractedData": {
        "PatientName": "John Doe",
        "DateOfBirth": "1980-01-01",
        "Age": "44",
        "Gender": "Male",
        "ContactNumber": "555-1234",
        "Email": "john.doe@example.com",
        "Address": "123 Main St, Springfield",
        "MRN": "MRN123456",
        "VisitDate": "2023-05-25",
        "DateOfAdmission": "2023-04-01",
        "DateOfDischarge": "2023-05-25",
        "DoctorName": "Dr. Smith",
        "Department": "Cardiology",
        "HospitalName": "Springfield Medical Center",
        "Diagnosis": "Acute Myocardial Infarction",
        "SecondaryDiagnosis": "Hypertension",
        "Symptoms": ["Chest pain", "Shortness of breath"],
        "MedicalConditions": ["Heart Disease"],
        "MedicationsPrescribed": [
          "Aspirin, 81 mg daily",
          "Atorvastatin, 40 mg daily"
        ],
        "Allergies": ["Penicillin"],
        "VitalSigns": {
          "BloodPressure": "130/85",
          "HeartRate": "78 bpm",
          "Temperature": "98.6 F",
          "Weight": "70 kg",
          "Height": "175 cm"
        },
        "ProceduresPerformed": [
          "Coronary Angioplasty",
          "Stent Placement"
        ],
        "LaboratoryResults": {
          "TestName": "Lipid Panel",
          "TestDate": "2023-04-02",
          "Results": ["LDL: 160 mg/dL", "HDL: 40 mg/dL"],
          "ReferenceRanges": ["LDL: <100 mg/dL", "HDL: >40 mg/dL"],
          "AbnormalFindings": ["LDL elevated"],
          "CriticalValues": []
        },
        "PatientConditionAtDischarge": "Stable",
        "FollowUpCareInstructions": {
          "Medications": "Continue current medication as prescribed",
          "Diet": "Low-sodium, low-fat",
          "Exercise": "Light walking daily",
          "Lifestyle": "Quit smoking",
          "FollowUp": "Visit cardiologist in 2 weeks"
        },
        "InsuranceInfo": "BlueCross ID# 789456",
        "EmergencyContact": "Jane Doe - 555-5678",
        "ProviderNotes": "Patient to monitor blood pressure daily.",
        "BillingCodes": ["I21.9", "Z95.5"],
        "DocumentMetadata": {
          "ConfidenceScore": "98%",
          "ClassificationReasoning": "Mentions discharge instructions and admission/discharge dates",
          "UrgencyLevel": "medium",
          "OverallTone": "professional",
          "Completeness": "complete",
          "Legibility": "clear",
          "DocumentCondition": "good",
          "InformationCompleteness": "90%",
          "DataReliability": "high",
          "MissingCriticalInfo": [],
          "ExtractionChallenges": []
        }
      }
    }
  
}
"""

def read_txt_input(input_path_or_text: Union[str, os.PathLike], is_file: bool = True) -> str:
    if is_file:
        with open(input_path_or_text, 'r', encoding='utf-8') as f:
            return f.read()
    return input_path_or_text

def extract_ner_with_openai(document: str) -> dict:
    """
    Extract structured data from a medical document using OpenAI's GPT model.

    Args:
        document (str): The raw text of the medical document.
        client: Optional custom OpenAI client. Defaults to global openai if not provided.
        PROMPT_TEMPLATE (str): The parsing prompt including instructions and schema.

    Returns:
        dict: Parsed JSON response with structured medical data.
    """
    openai_client = openai

    try:
        messages = [
            {
                "role": "user",
                "content": PROMPT_TEMPLATE + f"\n\nDocument text to analyze:\n{document}"
            }
        ]

        response = openai_client.ChatCompletion.create(
            model="gpt-4",
            messages=messages,
            temperature=0.1,
            max_tokens=3000,
        )

        result_text = response.choices[0].message.content.strip()

        try:
            parsed_json = json.loads(result_text)
        except json.JSONDecodeError:
            json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
            if json_match:
                try:
                    parsed_json = json.loads(json_match.group())
                except json.JSONDecodeError:
                    return {
                        "error": "Cleaned JSON also failed to parse",
                        "raw_response": result_text
                    }
            else:
                return {
                    "error": "Could not parse JSON from OpenAI response",
                    "raw_response": result_text
                }

        # ✅ Add DocumentID
        doc_id = str(uuid.uuid4())
        parsed_json["structured_data"]["ExtractedData"]["DocumentID"] = doc_id
        return parsed_json

    except Exception as e:
        return {
            "error": f"OpenAI API error: {str(e)}"
        }

def analyze_medical_document(input_path_or_text: Union[str, os.PathLike], is_file: bool = True) -> dict:
    text = read_txt_input(input_path_or_text, is_file)
    result = extract_ner_with_openai(text)
    return result
