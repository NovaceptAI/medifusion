import openai
import os
import json
from datetime import datetime
from sqlalchemy.orm import Session
from database.models import Patient
from database.database import engine
from sqlalchemy.orm import sessionmaker
from app.utils.embeddings_utils import get_openai_embedding

openai.api_key = os.getenv("OPENAI_API_KEY")
SessionLocal = sessionmaker(bind=engine)

PATIENT_GENERATION_PROMPT = """
Generate a list of 10 fake patient records in the following JSON format:

[
  {
    "name": "Full Name",
    "dob": "YYYY-MM-DD",
    "ssn": "XXX-XX-XXXX",
    "insurance_number": "INS-XXXX-XXX",
    "conditions": "comma-separated medical conditions"
  },
  ...
]

Make the patients diverse and realistic.
"""

def generate_fake_patients_via_openai() -> list:
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a data generator for healthcare testing."},
                {"role": "user", "content": PATIENT_GENERATION_PROMPT}
            ],
            temperature=0.5
        )
        content = response.choices[0].message.content.strip()
        data = json.loads(content)
        return data
    except json.JSONDecodeError:
        print("❌ Failed to parse JSON from GPT response.")
        return []
    except Exception as e:
        print(f"❌ OpenAI API error: {e}")
        return []

def insert_generated_patients(patients: list, db: Session):
    for p in patients:
        try:
            # Convert dob string to datetime.date
            dob = datetime.strptime(p["dob"], "%Y-%m-%d").date() if p.get("dob") else None

            # Generate embedding
            embedding_input = f"{p['name']} {p['dob']} {p['conditions']}"
            embedding = get_openai_embedding(embedding_input)

            patient = Patient(
                name=p['name'],
                dob=dob,
                ssn=p['ssn'],
                insurance_number=p['insurance_number'],
                conditions=p['conditions'],
                embedding=embedding
            )
            db.add(patient)
        except Exception as e:
            print(f"❌ Error inserting patient {p.get('name', 'Unknown')}: {e}")
    db.commit()
    print(f"✅ Inserted {len(patients)} GPT-generated patients.")

def main():
    db = SessionLocal()
    patients = generate_fake_patients_via_openai()
    if patients:
        insert_generated_patients(patients, db)
    db.close()

if __name__ == "__main__":
    main()