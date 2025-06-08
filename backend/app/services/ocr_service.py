import boto3
import logging
from urllib.parse import urlparse
from botocore.exceptions import ClientError
import os
from dotenv import load_dotenv
import time
from app.services.ner_openai_service import analyze_medical_document

# Setup logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Load AWS credentials
load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")


logger = logging.getLogger(__name__)

def get_textract_client():
    logger.info("Creating Textract client")
    return boto3.client(
        'textract',
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION
    )


def get_s3_client():
    logger.info("Creating S3 client")
    return boto3.client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION
    )


def extract_text_with_textract(s3_path: str, file_type: str) -> str:
    try:
        logger.info(f"Starting text extraction from S3 path: {s3_path} with file type: {file_type}")
        parsed = urlparse(s3_path)
        bucket = "medifusion"
        key = parsed.path.lstrip("/")
        logger.info(f"Parsed bucket: {bucket}, key: {key}")

        textract_client = get_textract_client()

        if file_type.lower() == "pdf":
            logger.info("Using Textract async API for PDF")
            # Start async job
            response = textract_client.start_document_text_detection(
                DocumentLocation={'S3Object': {'Bucket': bucket, 'Name': key}}
            )
            job_id = response['JobId']
            # Poll for result
            while True:
                result = textract_client.get_document_text_detection(JobId=job_id)
                status = result['JobStatus']
                if status in ['SUCCEEDED', 'FAILED']:
                    break
                logger.info(f"Textract job status: {status}, waiting...")
                time.sleep(5)
            if status == 'SUCCEEDED':
                blocks = result.get('Blocks', [])
            else:
                logger.error("Textract PDF job failed")
                return ""
        elif file_type.lower() in ['image', 'jpg', 'jpeg', 'png']:
            logger.info("Using Textract sync API for image")
            s3 = get_s3_client()
            obj = s3.get_object(Bucket=bucket, Key=key)
            document_bytes = obj['Body'].read()
            logger.info(f"Read {len(document_bytes)} bytes from S3 object")
            response = textract_client.detect_document_text(
                Document={'Bytes': document_bytes}
            )
            blocks = response.get('Blocks', [])
        else:
            logger.warning(f"Unsupported file type: {file_type}")
            return ""

        logger.info(f"Textract response contains {len(blocks)} blocks")

        if len(blocks) == 0:
            logger.warning("No blocks found in Textract response")

        # Log first 5 blocks for inspection to avoid too large logs
        for i, block in enumerate(blocks[:5]):
            logger.debug(f"Block {i}: Type={block['BlockType']} Text={block.get('Text', '')}")

        extracted_lines = [block['Text'] for block in blocks if block['BlockType'] == 'LINE' and 'Text' in block]
        logger.info(f"Extracted {len(extracted_lines)} lines from Textract response")

        if not extracted_lines:
            logger.warning("No lines extracted from Textract response")

        full_text = "\n".join(extracted_lines)
        return full_text

    except ClientError as e:
        logger.error(f"AWS Textract or S3 error: {e}")
        return ""
    except Exception as e:
        logger.error(f"Textract extraction failed: {e}")
        return ""