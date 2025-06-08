import type { MatchedResult } from "../data/mockAIData";
import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  followUpCare: {
    Medications: string;
    Diet: string;
    Exercise: string;
    Lifestyle: string;
    FollowUp: string;
  };
}

interface AIResults {
  matched: MatchedResult[];
  review: MatchedResult[];
}

interface OCRResult {
  filename: string;
  extracted_text: string;
}

interface PatientStore {
  patients: Patient[];
  aiResults: AIResults;
  nerResults: unknown[];
  ocrResults: OCRResult[];
  files: File[];
  setPatients: (patients: Patient[]) => void;
  setAIResults: (matched: MatchedResult[], review: MatchedResult[]) => void;
  setNERResults: (nerResults: unknown[]) => void;
  setOCRResults: (results: OCRResult[]) => void;
  setFiles: (files: File[]) => void;
  updateAIResults: (updatedPatient: MatchedResult) => void;
}

export const usePatientStore = create<PatientStore>()(
  persist(
    (set) => ({
      patients: [],
      aiResults: {
        matched: [],
        review: [],
      },
      nerResults: [],
      ocrResults: [],
      files: [],
      setPatients: (patients) => set({ patients }),
      setAIResults: (matched, review) =>
        set({
          aiResults: {
            matched,
            review,
          },
        }),
      setNERResults: (nerResults) => set({ nerResults }),
      setOCRResults: (results) => set({ ocrResults: results }),
      setFiles: (files) => set({ files }),
      updateAIResults: (updatedPatient) =>
        set((state) => {
          const { matched, review } = state.aiResults;
          const patientId = updatedPatient.matched_with.id;

          // Remove patient from both lists
          const updatedMatched = matched.filter(
            (p) => p.matched_with.id !== patientId
          );
          const updatedReview = review.filter(
            (p) => p.matched_with.id !== patientId
          );

          // Add updated patient to matched list with confirmed status
          const confirmedPatient = {
            ...updatedPatient,
            review_status: "Confirmed",
          };

          return {
            aiResults: {
              matched: [...updatedMatched, confirmedPatient],
              review: updatedReview,
            },
          };
        }),
    }),
    {
      name: "patient-storage", // unique name for localStorage
      partialize: (state) => ({
        patients: state.patients,
        aiResults: state.aiResults,
        nerResults: state.nerResults,
        ocrResults: state.ocrResults,
        files: state.files,
      }), // only persist these fields
    }
  )
);
