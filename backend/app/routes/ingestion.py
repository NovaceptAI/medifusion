import uuid
from typing import List
from pathlib import Path
import os
import tempfile

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import boto3
from botocore.exceptions import BotoCoreError, ClientError

from app.services.ocr_service import extract_text_from_s3  # For PDFs
from app.services.extract_text_and_analyze_openai import extract_text_and_analyze_openai  # For images
from app.services.ner_openai_service import analyze_medical_document  # For NER extraction
import logging
# Setup logger
logger = logging.getLogger(__name__)

# AWS Config
AWS_REGION = "us-east-1"
S3_BUCKET = "medifusion"
TEMP_UPLOAD_PREFIX = "uploads"

# Initialize router
ingestion_router = APIRouter()

# Initialize S3 client
s3_client = boto3.client("s3", region_name=AWS_REGION)


def upload_file_to_s3(file_path: str, s3_filename: str) -> str:
    """
    Uploads a file from local disk to S3 and returns the S3 URI.
    """
    s3_key = f"{TEMP_UPLOAD_PREFIX}/{s3_filename}"
    try:
        with open(file_path, "rb") as f:
            s3_client.put_object(Bucket=S3_BUCKET, Key=s3_key, Body=f)
        return f"s3://{S3_BUCKET}/{s3_key}"
    except (BotoCoreError, ClientError, OSError) as e:
        raise HTTPException(status_code=500, detail=f"S3 upload failed: {str(e)}")


@ingestion_router.post("/upload")
async def ingest_documents(files: List[UploadFile] = File(...)):
    """
    Accepts files, stores them in /tmp, uploads to S3, and routes
    to either OpenAI image OCR or AWS Textract based on file type.
    """
    responses = []

    for file in files:
        try:
            # Get file extension
            file_ext = Path(file.filename).suffix.lower()
            unique_filename = f"{uuid.uuid4().hex}{file_ext}"

            # Save to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext, dir="/tmp") as tmp_file:
                tmp_file.write(await file.read())
                tmp_file_path = tmp_file.name

            # Upload to S3
            s3_path = upload_file_to_s3(tmp_file_path, unique_filename)

            # Route based on file type
            if file_ext == ".pdf":
                extracted_text = extract_text_from_s3(s3_path)
            elif file_ext in [".jpg", ".jpeg", ".png"]:
                extracted_text = extract_text_and_analyze_openai(s3_path)
            else:
                raise HTTPException(status_code=400, detail=f"Unsupported file type: {file_ext}")

            # Call NER extractor on extracted text
            try:
                ner_result = analyze_medical_document(extracted_text, is_file=False)
            except Exception as e:
                logger.error(f"NER extraction failed: {str(e)}")
                ner_result = {}

            responses.append({
                "filename": file.filename,
                "s3_path": s3_path,
                "extracted_text": extracted_text,
                "structured_data": ner_result
            })

        except Exception as e:
            responses.append({
                "filename": file.filename,
                "error": str(e)
            })

    return JSONResponse(status_code=200, content={"results": responses})