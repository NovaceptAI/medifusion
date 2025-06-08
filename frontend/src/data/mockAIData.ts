import { faker } from "@faker-js/faker";

export interface IncomingPatient {
  name: string;
  dob: string;
  ssn: string;
  insurance_number: string;
  medical_conditions: string[];
  address: string;
  phone: string;
  email: string;
  gender: string;
}

export interface MatchedPatient {
  id: number;
  name: string;
  dob: string;
  ssn: string;
  insurance_number: string;
  medical_conditions: string;
  embedding: null;
  doctor_name?: string;
  hospital_name?: string;
  diagnosis?: string;
  medical_record_number?: string;
  medications?: string[];
}

export interface MatchedResult {
  incoming: IncomingPatient;
  matched_with: MatchedPatient;
  method: string;
  score: number;
  status: string;
  review_status: string;
}

export interface AISummary {
  matched_patients: MatchedResult[];
  unmatched_patients: MatchedResult[];
  new_patients: MatchedResult[];
  summary: {
    total: number;
    matched: number;
    unmatched: number;
    new: number;
    review_required: number;
    confirmed: number;
  };
}

const medicalConditions = [
  "Acute Myocardial Infarction",
  "Pneumonia",
  "Diabetes Management",
  "Hypertension",
  "Fracture",
  "Respiratory Infection",
  "Gastrointestinal Issues",
  "Neurological Symptoms",
  "Heart Disease",
  "Arthritis",
  "Asthma",
  "Cancer",
  "Depression",
  "Anxiety",
  "Migraine",
  "Thyroid Disorder",
  "COPD",
  "Osteoporosis",
  "Fibromyalgia",
  "Epilepsy",
];

const methods = ["fuzzy", "exact", "semantic"];
const statuses = ["updated", "new", "unchanged"];
const reviewStatuses = ["Confirmed", "Pending", "Rejected"];

function generateRandomPatient(id: number): MatchedResult {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const name = `${firstName} ${lastName}`;
  const dob = faker.date
    .birthdate({ mode: "age", min: 18, max: 90 })
    .toLocaleDateString();
  const ssn = faker.string
    .numeric(9)
    .replace(/(\d{3})(\d{2})(\d{4})/, "$1-$2-$3");
  const insuranceNumber = `INS${faker.string.numeric(6)}`;
  const numConditions = faker.number.int({ min: 1, max: 4 });
  const conditions = faker.helpers.arrayElements(
    medicalConditions,
    numConditions
  );
  const address = faker.location.streetAddress();
  const phone = faker.phone.number();
  const email = faker.internet.email({ firstName, lastName });
  const gender = faker.person.sex();
  const method = faker.helpers.arrayElement(methods);
  const score = faker.number.int({ min: 60, max: 100 });
  const status = faker.helpers.arrayElement(statuses);
  const reviewStatus = faker.helpers.arrayElement(reviewStatuses);

  return {
    incoming: {
      name,
      dob,
      ssn,
      insurance_number: insuranceNumber,
      medical_conditions: conditions,
      address,
      phone,
      email,
      gender,
    },
    matched_with: {
      id,
      name,
      dob,
      ssn,
      insurance_number: insuranceNumber,
      medical_conditions: conditions.join(","),
      embedding: null,
    },
    method,
    score,
    status,
    review_status: reviewStatus,
  };
}

// Generate 2000 random patients
const matchedPatients = Array.from({ length: 2000 }, (_, index) =>
  generateRandomPatient(index + 1)
);

// Calculate summary statistics
const confirmed = matchedPatients.filter(
  (p) => p.review_status === "Confirmed"
).length;
const pending = matchedPatients.filter(
  (p) => p.review_status === "Pending"
).length;
const rejected = matchedPatients.filter(
  (p) => p.review_status === "Rejected"
).length;

export const mockAIData: { summary: AISummary } = {
  summary: {
    matched_patients: matchedPatients,
    unmatched_patients: [],
    new_patients: [],
    summary: {
      total: 2000,
      matched: 2000,
      unmatched: 0,
      new: 0,
      review_required: pending,
      confirmed: confirmed,
    },
  },
};
