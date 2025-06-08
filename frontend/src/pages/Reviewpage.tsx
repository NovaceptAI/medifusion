// src/pages/ReviewPage.tsx
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import HumanReviewSection from "../components/HumanReviewSection";
import type { MatchedResult } from "../data/mockAIData";
import { usePatientStore } from "../store/patientStore";

// Mock data for fallback
const mockPatientData: MatchedResult = {
  incoming: {
    name: "John Doe",
    dob: "1980-05-15",
    insurance_number: "INS123456",
    medical_conditions: ["Hypertension", "Type 2 Diabetes"],
    phone: "555-0123",
    email: "john.doe@example.com",
    address: "123 Medical St, Healthcare City, HC 12345",
    gender: "Male",
    ssn: "123-45-6789",
  },
  matched_with: {
    id: 1,
    name: "John Doe",
    dob: "1980-05-15",
    insurance_number: "INS123456",
    medical_conditions: "Hypertension, Type 2 Diabetes",
    embedding: null,
  },
  method: "exact",
  score: 95,
  status: "matched",
  review_status: "Pending",
};

const ReviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateAIResults } = usePatientStore();
  const patient = (location.state?.patient as MatchedResult) || mockPatientData;

  useEffect(() => {
    console.log("Review page patient data:", patient); // Debug log
  }, [patient]);

  const handleConfirm = async (updatedPatient: MatchedResult) => {
    console.log("Confirming patient data:", updatedPatient); // Debug log
    try {
      const requestBody = {
        name: updatedPatient.incoming.name,
        dob: updatedPatient.incoming.dob,
        ssn: updatedPatient.incoming.ssn,
        insurance_number: updatedPatient.incoming.insurance_number,
        medical_conditions: updatedPatient.incoming.medical_conditions,
        address: updatedPatient.incoming.address,
        phone: updatedPatient.incoming.phone,
        email: updatedPatient.incoming.email,
        gender: updatedPatient.incoming.gender,
        doctor_name: updatedPatient.matched_with.doctor_name,
        hospital_name: updatedPatient.matched_with.hospital_name,
        diagnosis: updatedPatient.matched_with.diagnosis,
        medical_record_number:
          updatedPatient.matched_with.medical_record_number,
        medications: updatedPatient.matched_with.medications,
      };

      console.log(
        "Review API Request Body:",
        JSON.stringify(requestBody, null, 2)
      );

      const response = await fetch("/api/patients/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to confirm patient review");
      }

      const data = await response.json();
      console.log("Review API Response:", JSON.stringify(data, null, 2));

      // Update the patient in the store
      updateAIResults(updatedPatient);

      // Call onReject to navigate back to AI Results
      handleReject();
    } catch (error) {
      console.error("Error confirming patient review:", error);
      // You might want to show an error message to the user here
    }
  };

  const handleReject = () => {
    // Navigate back to AI Results
    navigate("/ai-results");
  };

  // Add validation for patient data
  if (!patient || !patient.incoming || !patient.matched_with) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center text-gray-600">
            <h2 className="text-xl font-semibold mb-4">Patient Not Found</h2>
            <p className="mb-4">
              The requested patient record could not be found.
            </p>
            <button
              onClick={() => navigate("/ai-results")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to AI Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <HumanReviewSection
        patient={patient}
        onConfirm={handleConfirm}
        onReject={handleReject}
      />
    </div>
  );
};

export default ReviewPage;
