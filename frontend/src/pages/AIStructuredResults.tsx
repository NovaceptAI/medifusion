import {
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationCircle,
  FaFileAlt,
  FaSearch,
} from "react-icons/fa";
import { useEffect, useState } from "react";

import type { MatchedResult } from "../data/mockAIData";
import { mockAIData } from "../data/mockAIData";
import { useNavigate } from "react-router-dom";
import { usePatientStore } from "../store/patientStore";

const AIStructuredResults = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"matched" | "review">("matched");
  const { aiResults, setAIResults, nerResults, ocrResults } = usePatientStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Call the fuzzy match API on mount
    const fetchAndMatch = async () => {
      console.log(
        "AIStructuredResults: componentDidMount - fetching and matching"
      );
      setLoading(true);
      setError(null);
      try {
        // Use nerResults from global store
        console.log("NER nerResults loaded", nerResults);
        if (!Array.isArray(nerResults) || nerResults.length === 0)
          throw new Error("No NER data available");

        const patients = nerResults.map((p) => {
          const extractedText = (p as Record<string, unknown>)
            .extracted_text as Record<string, unknown> | undefined;
          const structuredDataRaw = extractedText?.structured_data;
          const structuredArr: unknown[] = Array.isArray(structuredDataRaw)
            ? structuredDataRaw
            : [structuredDataRaw];
          const s = (structuredArr[0] || {}) as Record<string, unknown>;
          const e = (s.ExtractedData || {}) as Record<string, unknown>;
          const lab = (e.LaboratoryResults || {}) as Record<string, unknown>;
          const nullify = (val: unknown) =>
            !val || val === "N/A" ? null : val;
          const toISO = (val: unknown) => {
            if (!val || val === "N/A" || typeof val !== "string") return null;
            const d = new Date(val);
            if (isNaN(d.getTime())) return null;
            return d.toISOString().slice(0, 10);
          };
          let medical_conditions: string[] = [];
          if (typeof e.Diagnosis === "string" && e.Diagnosis !== "N/A")
            medical_conditions = [e.Diagnosis];
          else if (
            Array.isArray(e.MedicalConditions) &&
            e.MedicalConditions[0] !== "N/A"
          )
            medical_conditions = e.MedicalConditions as string[];
          return {
            name: nullify(e.PatientName) as string | null,
            dob: nullify(e.DateOfBirth) as string | null,
            ssn: null,
            insurance_number: null,
            medical_conditions,
            address: nullify(e.Address) as string | null,
            phone: nullify(e.ContactNumber) as string | null,
            email: nullify(e.Email) as string | null,
            gender: nullify(e.Gender) as string | null,
            hospital_name:
              (nullify(e.Department) as string | null) ||
              (nullify(e.HospitalName) as string | null),
            visit_date: toISO(e.VisitDate),
            report_date: toISO(lab.TestDate),
            doctor_name: nullify(e.DoctorName) as string | null,
            test_name: nullify(lab.TestName) as string | null,
            test_result: Array.isArray(lab.Results)
              ? (nullify(lab.Results[0]) as string | null)
              : null,
          };
        });
        console.log("Prepared patients for fuzzy match", patients);
        console.log("About to call /api/matching/fuzzy-match");
        console.log(
          "Fuzzy Match API Request Body:",
          JSON.stringify({ patients }, null, 2)
        );
        const res = await fetch("/api/matching/fuzzy-match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patients }),
          credentials: "include",
        });
        console.log("API call returned, status:", res.status);
        if (!res.ok) throw new Error("Fuzzy match API failed");
        const data = await res.json();
        console.log("Fuzzy Match API Response:", JSON.stringify(data, null, 2));
        const { matched_patients, unmatched_patients } = data.summary;
        const matched = matched_patients.filter(
          (p: { review_status: string }) => p.review_status === "Confirmed"
        );
        const review = [
          ...matched_patients.filter(
            (p: { review_status: string }) => p.review_status !== "Confirmed"
          ),
          ...unmatched_patients.filter(
            (p: { review_status: string }) => p.review_status !== "Confirmed"
          ),
        ];
        setAIResults(matched, review);
      } catch (err) {
        console.error("Error processing AI structure, using mock data:", err);
        const { matched_patients, unmatched_patients } = mockAIData.summary;
        const matched = matched_patients.filter(
          (p) => p.review_status === "Confirmed"
        );
        const review = [
          ...matched_patients.filter((p) => p.review_status !== "Confirmed"),
          ...(unmatched_patients
            ? unmatched_patients.filter((p) => p.review_status !== "Confirmed")
            : []),
        ];
        setAIResults(matched, review);
        setError("Failed to process AI structure. Showing mock data.");
      } finally {
        setLoading(false);
        console.log("AIStructuredResults: fetchAndMatch finished");
      }
    };
    fetchAndMatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBack = () => {
    // Preserve all states when navigating back
    navigate("/home", {
      state: {
        preserveState: true,
        ocrResults: ocrResults,
        nerResults: nerResults,
        currentView: "patient-list",
      },
    });
  };

  const handleReview = (patient: MatchedResult) => {
    console.log("Review patient data:", patient); // Debug log
    navigate(`/review/${patient.matched_with.id}`, {
      state: {
        patient: {
          ...patient,
          incoming: {
            name: patient.incoming.name || "Unknown",
            dob: patient.incoming.dob || "Unknown",
            insurance_number: patient.incoming.insurance_number || "Unknown",
            medical_conditions: patient.incoming.medical_conditions || [],
            phone: patient.incoming.phone || "",
            email: patient.incoming.email || "",
            address: patient.incoming.address || "",
            gender: patient.incoming.gender || "",
            ssn: patient.incoming.ssn || "",
          },
          matched_with: {
            ...patient.matched_with,
            id: patient.matched_with.id || 0,
            name: patient.matched_with.name || "Unknown",
            dob: patient.matched_with.dob || "Unknown",
            insurance_number:
              patient.matched_with.insurance_number || "Unknown",
            medical_conditions: patient.matched_with.medical_conditions || "",
            embedding: patient.matched_with.embedding || null,
          },
          method: patient.method || "manual",
          score: patient.score || 0,
          status: patient.status || "pending",
          review_status: patient.review_status || "Pending",
        },
      },
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _suppressLoadingWarning = loading;

  const renderPatientCard = (patient: MatchedResult) => (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-4 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-gray-800">
            {patient.incoming.name}
          </h3>
          <p className="text-gray-600 flex items-center gap-2">
            <FaFileAlt className="text-indigo-500" />
            DOB: {patient.incoming.dob}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {patient.review_status === "Confirmed" ? (
            <span className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full">
              <FaCheckCircle className="text-green-500" /> Confirmed
            </span>
          ) : (
            <button
              onClick={() => handleReview(patient)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-full hover:bg-yellow-100 transition-colors"
            >
              <FaExclamationCircle className="text-yellow-500" /> Review
              Required
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaSearch className="text-indigo-500" /> Contact Information
          </h4>
          <div className="space-y-2">
            <p className="text-gray-600">Phone: {patient.incoming.phone}</p>
            <p className="text-gray-600">Email: {patient.incoming.email}</p>
            <p className="text-gray-600">Address: {patient.incoming.address}</p>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaFileAlt className="text-indigo-500" /> Medical Information
          </h4>
          <div className="space-y-2">
            <p className="text-gray-600">Gender: {patient.incoming.gender}</p>
            <p className="text-gray-600">
              Conditions: {patient.incoming.medical_conditions.join(", ")}
            </p>
            <p className="text-gray-600">
              Insurance: {patient.incoming.insurance_number}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="font-semibold text-gray-700 mb-3">Matching Details</h4>
        <div className="grid grid-cols-2 gap-4 bg-indigo-50 p-4 rounded-lg">
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-medium text-indigo-700">Match Method:</span>{" "}
              {patient.method}
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-indigo-700">Match Score:</span>{" "}
              {patient.score}%
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-medium text-indigo-700">Status:</span>{" "}
              {patient.status}
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-indigo-700">SSN:</span>{" "}
              {patient.incoming.ssn}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 relative">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
          >
            <FaArrowLeft />
            <span>Back to Upload</span>
          </button>
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent py-1">
              Patient Matching Summary
            </h1>
            <p className="text-gray-600 mt-2">
              Review and manage patient data matches from uploaded documents
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <FaExclamationCircle className="text-red-500" />
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab("matched")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                activeTab === "matched"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <FaCheckCircle
                className={
                  activeTab === "matched" ? "text-white" : "text-gray-500"
                }
              />
              Matched ({aiResults.matched.length})
            </button>
            <button
              onClick={() => setActiveTab("review")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                activeTab === "review"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <FaExclamationCircle
                className={
                  activeTab === "review" ? "text-white" : "text-gray-500"
                }
              />
              Review ({aiResults.review.length})
            </button>
          </div>

          <div className="space-y-4">
            {activeTab === "matched"
              ? aiResults.matched.map((patient) => (
                  <div key={patient.matched_with.id || patient.incoming.name}>
                    {renderPatientCard(patient)}
                  </div>
                ))
              : aiResults.review.map((patient) => (
                  <div key={patient.matched_with.id || patient.incoming.name}>
                    {renderPatientCard(patient)}
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIStructuredResults;
