"""
MediFusion FastAPI application.

- Loads env vars
- Configures CORS
- Mounts all API routers
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# --- Routers (keep these module names consistent with your repo) ---
from app.routes.ingestion import ingestion_router          # /api/ingestion
from app.routes.matching import matching_router            # /api/matching
from app.routes.patient import patient_router              # /api (patients)
from app.routes.chat import chat_router                    # /api (chat)
from app.routes.ner_routes import ner_router               # /api/ner
from app.routes.review import review_router                # /api/review

# Load environment variables from .env (before app creation if any settings read at import)
load_dotenv()

app = FastAPI(
    title="Patient Data Intelligence API",
    description=(
        "Extract, classify, and match structured data from "
        "unstructured documents using OCR + LLMs."
    ),
    version="0.1.0",
)

# CORS (tighten allow_origins in prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # e.g. ["https://your-frontend.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Router mounts ---
app.include_router(ingestion_router, prefix="/api/ingestion", tags=["Ingestion"])
app.include_router(ner_router,        prefix="/api/ner",       tags=["NER"])
app.include_router(matching_router,   prefix="/api/matching",  tags=["Matching"])
app.include_router(patient_router,    prefix="/api",           tags=["Patients"])
app.include_router(chat_router,       prefix="/api",           tags=["Chat"])
app.include_router(review_router,     prefix="/api/review",    tags=["Review"])

# Optional startup/shutdown hooks
# @app.on_event("startup")
# async def startup_event():
#     ...
# @app.on_event("shutdown")
# async def shutdown_event():
#     ...
