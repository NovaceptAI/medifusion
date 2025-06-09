import {
  Activity,
  CalendarDays,
  Eye,
  FileText,
  HeartHandshake,
  Users,
} from "lucide-react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Card, CardContent } from "../components/ui/card";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Common chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

export default function Statistics() {
  // Mock data for bar chart - Stage-wise document processing
  const barData = {
    labels: ["OCR", "NER", "Matching", "Feedback"],
    datasets: [
      {
        label: "Processed Documents",
        data: [250, 220, 180, 150],
        backgroundColor: [
          "rgba(56, 189, 248, 0.8)", // blue
          "rgba(34, 197, 94, 0.8)", // green
          "rgba(245, 158, 11, 0.8)", // yellow
          "rgba(239, 68, 68, 0.8)", // red
        ],
        borderColor: [
          "rgb(56, 189, 248)",
          "rgb(34, 197, 94)",
          "rgb(245, 158, 11)",
          "rgb(239, 68, 68)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Mock data for doughnut chart - Match feedback status
  const doughnutData = {
    labels: ["Accepted", "Rejected", "Pending"],
    datasets: [
      {
        data: [120, 45, 35],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)", // green
          "rgba(239, 68, 68, 0.8)", // red
          "rgba(250, 204, 21, 0.8)", // yellow
        ],
        borderColor: [
          "rgb(34, 197, 94)",
          "rgb(239, 68, 68)",
          "rgb(250, 204, 21)",
        ],
        borderWidth: 1,
        hoverOffset: 4,
      },
    ],
  };

  // Mock data for line chart - Daily processing trend
  const lineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Documents Processed",
        data: [30, 45, 35, 50, 40, 25, 35],
        borderColor: "rgb(56, 189, 248)",
        backgroundColor: "rgba(56, 189, 248, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          MediFusion Analytics Hub
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Real-time insights and performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="flex flex-col items-start p-4">
            <div className="bg-blue-200 dark:bg-blue-700 p-2 rounded-lg mb-2">
              <Users className="text-blue-700 dark:text-blue-300 w-6 h-6" />
            </div>
            <p className="text-xl font-semibold text-gray-800 dark:text-white">
              Patients
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              250
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="flex flex-col items-start p-4">
            <div className="bg-green-200 dark:bg-green-700 p-2 rounded-lg mb-2">
              <HeartHandshake className="text-green-700 dark:text-green-300 w-6 h-6" />
            </div>
            <p className="text-xl font-semibold text-gray-800 dark:text-white">
              Matched
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              180
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900 dark:to-red-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="flex flex-col items-start p-4">
            <div className="bg-red-200 dark:bg-red-700 p-2 rounded-lg mb-2">
              <Eye className="text-red-700 dark:text-red-300 w-6 h-6" />
            </div>
            <p className="text-xl font-semibold text-gray-800 dark:text-white">
              Reviews
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              45
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900 dark:to-yellow-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="flex flex-col items-start p-4">
            <div className="bg-yellow-200 dark:bg-yellow-700 p-2 rounded-lg mb-2">
              <CalendarDays className="text-yellow-700 dark:text-yellow-300 w-6 h-6" />
            </div>
            <p className="text-xl font-semibold text-gray-800 dark:text-white">
              Last Updated
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              June 9
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                <FileText className="text-blue-600 dark:text-blue-300 w-5 h-5" />
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Stage-Wise Document Count
              </p>
            </div>
            <div className="h-[300px]">
              <Bar data={barData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                <Activity className="text-purple-600 dark:text-purple-300 w-5 h-5" />
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Match Feedback Status
              </p>
            </div>
            <div className="h-[300px]">
              <Doughnut data={doughnutData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                <Activity className="text-green-600 dark:text-green-300 w-5 h-5" />
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Daily Processing Trend
              </p>
            </div>
            <div className="h-[300px]">
              <Line data={lineData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-lg">
                <Activity className="text-indigo-600 dark:text-indigo-300 w-5 h-5" />
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Summary Stats
              </p>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-gray-800 dark:text-gray-200">
              <li className="font-medium">Total Files Processed: 250</li>
              <li className="font-medium">Entities Extracted: 5000+</li>
              <li className="font-medium">Unique Patients Identified: 200</li>
              <li className="font-medium">Match Accuracy: 92%</li>
              <li className="font-medium">Average Processing Time: 2.5s</li>
              <li className="font-medium">
                Top Fields: Name, ID, Phone, Diagnosis
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-pink-100 dark:bg-pink-900 p-2 rounded-lg">
                <CalendarDays className="text-pink-600 dark:text-pink-300 w-5 h-5" />
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Upcoming Reviews
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <p className="font-bold text-blue-800 dark:text-blue-200">
                  June 6
                </p>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  Human Feedback Cycle
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  15 documents pending
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <p className="font-bold text-green-800 dark:text-green-200">
                  June 7
                </p>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  Model Retraining
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  New data available
                </p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <p className="font-bold text-yellow-800 dark:text-yellow-200">
                  June 8
                </p>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  Final Evaluation
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  System performance review
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
