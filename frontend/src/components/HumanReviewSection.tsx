import { FaArrowLeft, FaCheck, FaEdit, FaTimes } from "react-icons/fa";
import React, { useState } from "react";

import type { MatchedResult } from "../data/mockAIData";
import { useNavigate } from "react-router-dom";

interface HumanReviewSectionProps {
  patient: MatchedResult;
  onConfirm: (updatedPatient: MatchedResult) => void;
  onReject: () => void;
}

const HumanReviewSection = ({
  patient,
  onConfirm,
  onReject,
}: HumanReviewSectionProps) => {
  const navigate = useNavigate();
  // Ensure we have default values for all required fields
  const defaultPatient: MatchedResult = {
    incoming: {
      name: "John Smith",
      dob: "1985-06-15",
      insurance_number: "INS789012",
      medical_conditions: ["Hypertension", "Type 2 Diabetes", "Asthma"],
      phone: "(555) 123-4567",
      email: "john.smith@example.com",
      address: "456 Health Street, Medical City, MC 12345",
      gender: "Male",
      ssn: "123-45-6789",
    },
    matched_with: {
      id: 1,
      name: "John Smith",
      dob: "1985-06-15",
      insurance_number: "INS789012",
      medical_conditions: "Hypertension, Type 2 Diabetes, Asthma",
      embedding: null,
      ssn: "123-45-6789",
    },
    method: "exact",
    score: 95,
    status: "matched",
    review_status: "Pending",
  };

  // Merge the provided patient data with defaults
  const safePatient = {
    ...defaultPatient,
    ...patient,
    incoming: {
      ...defaultPatient.incoming,
      ...(patient?.incoming || {}),
    },
    matched_with: {
      ...defaultPatient.matched_with,
      ...(patient?.matched_with || {}),
    },
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editedPatient, setEditedPatient] =
    useState<MatchedResult>(safePatient);

  const handleInputChange = (field: string, value: string) => {
    setEditedPatient((prev: MatchedResult) => ({
      ...prev,
      incoming: {
        ...prev.incoming,
        [field]: value,
      },
    }));
  };

  const handleMedicalConditionsChange = (value: string) => {
    setEditedPatient((prev: MatchedResult) => ({
      ...prev,
      incoming: {
        ...prev.incoming,
        medical_conditions: value
          .split(",")
          .map((condition) => condition.trim())
          .filter((condition) => condition !== ""),
      },
    }));
  };

  const handleEdit = () => {
    setEditedPatient(safePatient);
    setIsEditing(true);
  };

  const handleConfirm = () => {
    onConfirm(editedPatient);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedPatient(safePatient);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 relative">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent py-1">
              Human Review
            </h1>
            <p className="text-gray-600 mt-2">
              Review and verify patient information
            </p>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Review Patient Details
            </h2>
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <FaEdit /> Edit Details
                </button>
              ) : (
                <>
                  <button
                    onClick={handleConfirm}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
                  >
                    <FaCheck /> Confirm
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                  >
                    <FaTimes /> Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedPatient.incoming.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 font-medium"
                    placeholder="Enter patient name"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">
                    {safePatient.incoming.name}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedPatient.incoming.dob}
                    onChange={(e) => handleInputChange("dob", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 font-medium"
                    placeholder="YYYY-MM-DD"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">
                    {safePatient.incoming.dob}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Number
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedPatient.incoming.insurance_number}
                    onChange={(e) =>
                      handleInputChange("insurance_number", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 font-medium"
                    placeholder="Enter insurance number"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">
                    {safePatient.incoming.insurance_number}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Conditions
                </label>
                {isEditing ? (
                  <textarea
                    value={editedPatient.incoming.medical_conditions.join(", ")}
                    onChange={(e) =>
                      handleMedicalConditionsChange(e.target.value)
                    }
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 font-medium resize-none"
                    rows={3}
                    placeholder="Enter medical conditions (comma-separated)"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">
                    {safePatient.incoming.medical_conditions.join(", ") ||
                      "None"}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedPatient.incoming.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 font-medium"
                    placeholder="(XXX) XXX-XXXX"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">
                    {safePatient.incoming.phone || "N/A"}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedPatient.incoming.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 font-medium"
                    placeholder="Enter email address"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">
                    {safePatient.incoming.email || "N/A"}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedPatient.incoming.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 font-medium"
                    placeholder="Enter full address"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">
                    {safePatient.incoming.address || "N/A"}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedPatient.incoming.gender}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 font-medium"
                    placeholder="Enter gender"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">
                    {safePatient.incoming.gender || "N/A"}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Matching Information
              </h3>
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-indigo-700">
                        Match Method:
                      </span>{" "}
                      <span className="text-gray-800">
                        {safePatient.method}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-indigo-700">
                        Match Score:
                      </span>{" "}
                      <span className="text-gray-800">
                        {safePatient.score}%
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-indigo-700">
                        Status:
                      </span>{" "}
                      <span className="text-gray-800">
                        {safePatient.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HumanReviewSection;
