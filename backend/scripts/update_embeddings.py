import openai
import psycopg2
import os
import json

openai.api_key = "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"

conn = psycopg2.connect(dbname="medifusion", user="postgres", password="postgres")
cursor = conn.cursor()

cursor.execute("SELECT id, name, diagnosis, medical_conditions FROM patients WHERE embedding IS NULL")
rows = cursor.fetchall()

for row in rows:
    pid, name, diagnosis, conditions = row
    text = f"{name}, {diagnosis or ''}, {', '.join(conditions or [])}"
    response = openai.Embedding.create(model="text-embedding-3-small", input=text)
    embedding = response['data'][0]['embedding']

    cursor.execute("UPDATE patients SET embedding = %s WHERE id = %s", (embedding, pid))

conn.commit()
cursor.close()
conn.close()