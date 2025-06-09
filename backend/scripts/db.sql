CREATE DATABASE medifusion;

use DATABASE medifusion;

CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    gender VARCHAR,
    age INT,
    dob DATE,
    ssn VARCHAR UNIQUE,
    medical_conditions TEXT,
    insurance_number VARCHAR
);

select * from patients;

ALTER TABLE patients
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS medications TEXT,
    ADD COLUMN IF NOT EXISTS diagnosis TEXT,
    ADD COLUMN IF NOT EXISTS doctor_name TEXT,
    ADD COLUMN IF NOT EXISTS hospital_name TEXT,
    ADD COLUMN IF NOT EXISTS visit_date DATE,
    ADD COLUMN IF NOT EXISTS follow_up TEXT,
    ADD COLUMN IF NOT EXISTS provider_notes TEXT;

CREATE TABLE IF NOT EXISTS patient_contexts (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES patients(id),
    context_json JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);