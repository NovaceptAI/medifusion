import json
from database.patient_context_repository import PatientContextRepository
import openai 
from sqlalchemy.orm import Session
from typing import List, Dict, Any


class ChatBotService:
    def __init__(self, openai_api_key: str):
        openai.api_key = openai_api_key
        
    
    def ingest_patient_context(self, db: Session, patient_id: int, context_json: dict):
        return PatientContextRepository.save_patient_context(db, patient_id, context_json)
        

    async def answer_question(self, context_json: Dict[str, Any], question: str, history: List[Dict[str, str]] = None) -> str:
        system_prompt = (
            "You are a medical assistant. Use the provided structured patient information to answer the user's questions."
        )

        formatted_context = json.dumps(context_json, indent=2)

        messages = [{"role": "system", "content": system_prompt}]
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": f"Here is the patient data: {formatted_context}\n\nQuestion: {question}"})

        try:
            response = openai.ChatCompletion.create(
                model="gpt-4-turbo",
                messages=messages,
                temperature=0.3,
                max_tokens=500,
            )
            return response['choices'][0]['message']['content'].strip()
        except Exception as e:
            raise RuntimeError(f"Failed to get response from OpenAI: {e}")