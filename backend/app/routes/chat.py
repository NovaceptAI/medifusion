import os
from typing import Dict, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from app.services.chatbot_service import ChatBotService
from database.patient_context_repository import PatientContextRepository
from database.schemas import PatientContextCreate
from uuid import UUID

chat_router = APIRouter(prefix="/chat", tags=["Chat"])
chat_service = ChatBotService(openai_api_key=os.getenv("OPENAI_API_KEY"))
user_chat_histories: Dict[UUID, List[Dict[str, str]]] = {}

@chat_router.post("/ingest_context", response_model=dict)
def ingest_context(payload: PatientContextCreate, db: Session = Depends(get_db)):
    result = chat_service.ingest_patient_context(db, payload.patient_id, payload.context_json)
    return {"message": "Context ingested", "id": result.id}

@chat_router.post("/chat/{patient_id}")
async def chat_with_patient(patient_id: int, question: str, db: Session = Depends(get_db)):
    repo = PatientContextRepository(db)
    context_record = repo.get_context_by_patient_id(patient_id)

    if not context_record:
        raise HTTPException(status_code=404, detail="Patient context not found.")

    # Retrieve past conversation
    history = user_chat_histories.get(patient_id, [])

    # Ask OpenAI
    answer = await chat_service.answer_question(
        context_json=context_record.context_json,
        question=question,
        history=history
    )

    # Update history
    history.append({"role": "user", "content": question})
    history.append({"role": "assistant", "content": answer})
    user_chat_histories[patient_id] = history[-10:]  # keep last 5 exchanges

    return {"answer": answer}