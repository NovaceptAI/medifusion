import { FaChartLine, FaFileUpload, FaUsers } from "react-icons/fa";
import { useEffect, useState } from "react";

import CheckpointLoaderExample from "../components/CheckLoadingExample";
import PatientList from "../components/PatientList";
import UploadSection from "../components/UploadSection";
import { motion } from "framer-motion";
import { usePatientStore } from "../store/patientStore";

interface FollowUpCare {
  Medications: string;
  Diet: string;
  Exercise: string;
  Lifestyle: string;
  FollowUp: string;
}

interface Patient {
  id: string;
  name: string;
  dob: string;
  mrn: string;
  admissionDate: string;
  dischargeDate: string;
  reason: string;
  procedures: string[];
  medications: string[];
  condition: string;
  documentType: string;
  followUpCare: FollowUpCare;
}

interface UploadResult {
  filename: string;
  s3_path: string;
  extracted_text: string;
  file_size: string;
  file_type: string;
  ocr_engine_used: string;
  text_lines_count: number;
  upload_location: string;
}

interface NERResponse {
  structured_data: {
    ExtractedData: {
      PatientName: string;
      DateOfBirth: string;
      MRN: string;
      DateOfAdmission?: string;
      DateOfDischarge?: string;
      ReasonForAdmission?: string;
      ProceduresPerformed?: string[];
      MedicationsPrescribed?: string[];
      PatientConditionAtDischarge?: string;
      DocumentType: string;
      FollowUpCareInstructions?: {
        Medications: string;
        FollowUp: string;
      };
      Medication?: {
        StartDate?: string;
        StopDate?: string;
        Instructions?: string;
        Name?: string;
      };
      PrescriptionStatus?: string;
    };
  };
}

type CheckpointStatus = "pending" | "loading" | "completed";

interface CheckpointState {
  uploaded: CheckpointStatus;
  ocr: CheckpointStatus;
  ner: CheckpointStatus;
}

const Home = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);
  const [checkpointState, setCheckpointState] = useState<CheckpointState>({
    uploaded: "pending",
    ocr: "pending",
    ner: "pending",
  });
  const {
    setPatients: setStorePatients,
    setNERResults,
    patients: storePatients,
    setFiles: setStoreFiles,
    files: storeFiles,
  } = usePatientStore();

  // Initialize patients, files and state from store if available
  useEffect(() => {
    if (storePatients && storePatients.length > 0) {
      setPatients(storePatients);
      // Restore checkpoint state based on store data
      setCheckpointState({
        uploaded: "completed",
        ocr: "completed",
        ner: "completed",
      });
    }
    if (storeFiles && storeFiles.length > 0) {
      setFiles(storeFiles);
    }
  }, [storePatients, storeFiles]);

  // Save patients and files to store when they change
  useEffect(() => {
    if (patients.length > 0) {
      setStorePatients(patients);
    }
    if (files.length > 0) {
      setStoreFiles(files);
    }
  }, [patients, files, setStorePatients, setStoreFiles]);

  // Handle page reload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear the store only on actual page reload
      if (
        window.performance &&
        window.performance.navigation.type ===
          window.performance.navigation.TYPE_RELOAD
      ) {
        localStorage.removeItem("patient-storage");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleFileSelect = () => {
    setCheckpointState((prev) => ({
      ...prev,
      uploaded: "loading",
    }));
  };

  const handleFilesSelected = () => {
    setCheckpointState((prev) => ({
      ...prev,
      uploaded: "completed",
    }));
  };

  const handleSimulateUpload = async () => {
    setError(undefined);

    setCheckpointState((prev) => ({
      ...prev,
      ocr: "loading",
    }));

    try {
      // Check file sizes before uploading
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
      const largeFiles = files.filter((file) => file.size > MAX_FILE_SIZE);

      if (largeFiles.length > 0) {
        const fileNames = largeFiles.map((file) => file.name).join(", ");
        setError(`The following files are too large (max 5MB): ${fileNames}`);
        return;
      }

      // Create FormData instance
      const formData = new FormData();
      console.log("files", files);

      // Append each file to the FormData
      files.forEach((file) => {
        formData.append("files", file);
      });

      // Step 1: Upload files
      const uploadResponse = await fetch("/api/ingestion/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      console.log("Upload Response Status:", uploadResponse.status);
      console.log(
        "Upload Response Headers:",
        Object.fromEntries(uploadResponse.headers.entries())
      );

      if (uploadResponse.status === 413) {
        setError("File size too large. Please upload files smaller than 5MB.");
        return;
      }

      if (uploadResponse.status === 429) {
        setError("Rate limited. Please try again later.");
        return;
      }

      if (!uploadResponse.ok) {
        throw new Error(`HTTP error! status: ${uploadResponse.status}`);
      }

      const uploadData = await uploadResponse.json();
      console.log(
        "Upload API Response Data:",
        JSON.stringify(uploadData, null, 2)
      );

      if (!uploadData?.results) {
        throw new Error("Invalid response format from upload API");
      }

      // Mark OCR as completed and start NER
      setCheckpointState((prev) => ({
        ...prev,
        ocr: "completed",
        ner: "loading",
      }));

      // Step 2: Extract NER for each uploaded file
      const nerPromises = uploadData.results.map(
        async (result: UploadResult) => {
          console.log("\nProcessing file:", result.filename);
          console.log("Sending to NER API:", {
            extracted_text: result.extracted_text,
          });

          const nerResponse = await fetch("/api/ner/extract_ner", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              extracted_text: result.extracted_text,
            }),
            credentials: "include",
          });

          console.log("NER Response Status:", nerResponse.status);
          console.log(
            "NER Response Headers:",
            Object.fromEntries(nerResponse.headers.entries())
          );

          if (!nerResponse.ok) {
            throw new Error(
              `NER extraction failed for file ${result.filename}`
            );
          }

          const nerData = (await nerResponse.json()) as NERResponse;
          console.log(
            "NER API Response Data:",
            JSON.stringify(nerData, null, 2)
          );

          return {
            ...result,
            extracted_text: nerData,
          };
        }
      );

      const processedResults = await Promise.all(nerPromises);
      console.log(
        "\nFinal Processed Results:",
        JSON.stringify(processedResults, null, 2)
      );

      // Mark NER as completed
      setCheckpointState((prev) => ({
        ...prev,
        ner: "completed",
      }));

      console.log("processedResults", processedResults);

      // Transform API response to match our mock data structure
      const transformedPatients = processedResults.map((result) => {
        const structuredData = result.extracted_text?.structured_data;
        console.log("result", result);
        const extractedData = structuredData?.ExtractedData;
        const followUp = extractedData?.FollowUpCareInstructions || {};

        if (!extractedData) {
          console.error("ExtractedData is undefined for result:", result);
          return {
            id: result.filename,
            name: "Unknown",
            dob: "N/A",
            mrn: "N/A",
            admissionDate: "N/A",
            dischargeDate: "N/A",
            reason: "N/A",
            procedures: [],
            medications: [],
            condition: "N/A",
            documentType: structuredData?.DocumentType || "Unknown",
            followUpCare: {
              Medications: "N/A",
              Diet: "N/A",
              Exercise: "N/A",
              Lifestyle: "N/A",
              FollowUp: "N/A",
            },
          };
        }

        const patient = {
          id: result.filename,
          name: extractedData.PatientName || "Unknown",
          dob: extractedData.DateOfBirth || "N/A",
          mrn: extractedData.MRN || "N/A",
          admissionDate: extractedData.DateOfAdmission || "N/A",
          dischargeDate: extractedData.DateOfDischarge || "N/A",
          reason: extractedData.ReasonForAdmission || "N/A",
          procedures: Array.isArray(extractedData.ProceduresPerformed)
            ? extractedData.ProceduresPerformed
            : [],
          medications: Array.isArray(extractedData.MedicationsPrescribed)
            ? extractedData.MedicationsPrescribed
            : [],
          condition: extractedData.PatientConditionAtDischarge || "N/A",
          documentType: structuredData?.DocumentType || "Unknown",
          followUpCare: {
            Medications: followUp.Medications || "N/A",
            Diet: followUp.Diet || "N/A",
            Exercise: followUp.Exercise || "N/A",
            Lifestyle: followUp.Lifestyle || "N/A",
            FollowUp: followUp.FollowUp || "N/A",
          },
        };

        console.log(
          "Transformed patient data:",
          JSON.stringify(patient, null, 2)
        );
        return patient;
      });

      console.log(
        "\nFinal Transformed Patients:",
        JSON.stringify(transformedPatients, null, 2)
      );
      setPatients(transformedPatients);
      setStorePatients(transformedPatients);
      setStoreFiles(files);
      setNERResults(processedResults);

      // Update checkpoint state
      setCheckpointState({
        uploaded: "completed",
        ocr: "completed",
        ner: "completed",
      });
    } catch (error: unknown) {
      console.error("Upload failed:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to process documents. Please try again.");
      }
      // Reset checkpoint states on error
      setCheckpointState({
        uploaded: "pending",
        ocr: "pending",
        ner: "pending",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Welcome to MediFusion
          </h1>
          <p className="text-gray-600 text-lg">
            Upload and process your medical documents with AI-powered analysis
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <FaFileUpload className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Documents Processed
                </h3>
                <p className="text-2xl font-bold text-indigo-600">
                  {files.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <FaUsers className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Patients Analyzed
                </h3>
                <p className="text-2xl font-bold text-purple-600">
                  {patients.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-pink-100 p-3 rounded-lg">
                <FaChartLine className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Success Rate
                </h3>
                <p className="text-2xl font-bold text-pink-600">98%</p>
              </div>
            </div>
          </div>
        </motion.div>

        <CheckpointLoaderExample checkpointState={checkpointState} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100"
          >
            <UploadSection
              onSimulateUpload={handleSimulateUpload}
              files={files}
              setFiles={(newFiles) => {
                setFiles(newFiles);
                if (newFiles.length > 0) {
                  handleFilesSelected();
                }
              }}
              onFileSelect={handleFileSelect}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100 overflow-hidden"
          >
            <div className="h-[65vh] overflow-y-auto">
              <PatientList patients={patients} error={error} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;
