"""
Main entry point for the Medifusion FastAPI application.

This module initializes the FastAPI app, configures CORS, loads environment variables,
sets up database and vector index on startup, and includes API routers for document ingestion
and other functionalities.

Run this file to start the API server.

Routes:
    /api/ingestion - Document ingestion endpoints

Startup:
    - Initializes database connection
    - Loads vector index for embedding service

Shutdown:
    - Handles graceful shutdown tasks
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn
from app.routes.matching import fuzzy_match

# Route imports
from app.routes.ingestion import ingestion_router

# Fuzzy Import
from app.routes.matching import matching_router

from app.routes.patient import patient_router

from app.routes.chat import chat_router

# Optional: Setup logs, database, vector DB, etc.
# from app.database.db import init_db
# from app.services.embedding_service import load_vector_index

# Load environment variables from .env
load_dotenv()

# Import routers for different functionalities
app = FastAPI(
    title="Patient Data Intelligence API",
    description="Extract, classify, and match structured data from " \
    "unstructured documents using OCR + LLMs.",
    version="0.1.0"
)

# CORS setup (adjust origins in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(ingestion_router, prefix="/api/ingestion", tags=["Ingestion"])
# app.include_router(extraction_router, prefix="/api/extraction", tags=["Extraction"])
# app.include_router(matching_router, prefix="/api/matching", tags=["Matching"])
# app.include_router(feedback_router, prefix="/api/feedback", tags=["Human Feedback"])
# app.include_router(health_router, prefix="/api", tags=["Health Check"])
app.include_router(patient_router, prefix="/api", tags=["Patients"])

app.include_router(matching_router, prefix="/api/matching", tags=["Matching"])
app.include_router(chat_router, prefix="/api", tags=["Chat"])
# Startup and shutdown events
# @app.on_event("startup")
# async def startup_event():
#     print("🔧 Initializing database and vector index...")
#     await init_db()
#     await load_vector_index()
#     print("✅ System ready to process documents.")

# @app.on_event("shutdown")
# async def shutdown_event():
#     print("🚪 Shutting down...")

# Run the app via: `python main.py`
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
