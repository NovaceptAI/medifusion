import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

import AIStructuredResults from "./pages/AIStructuredResults";
import Header from "./components/Header";
import Home from "./pages/Home";
import ReviewPage from "./pages/Reviewpage";
import Sidebar from "./components/Sidebar";
import { SidebarProvider } from "./contexts/SidebarContext";
import Statistics from "./pages/Statistics";
import SuccessPage from "./components/SuccessPage";
import Welcome from "./pages/Welcome";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route
          path="/*"
          element={
            <SidebarProvider>
              <div className="flex h-screen overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
                <Sidebar />
                <div className="flex flex-col flex-1 overflow-hidden">
                  <Header />
                  <main className="flex-1 overflow-y-auto p-6 space-y-6">
                    <Routes>
                      <Route path="/home" element={<Home />} />
                      <Route path="/statistics" element={<Statistics />} />
                      <Route
                        path="/ai-results"
                        element={<AIStructuredResults />}
                      />
                      <Route path="/review/:id" element={<ReviewPage />} />
                      <Route path="/success" element={<SuccessPage />} />
                      <Route
                        path="*"
                        element={<Navigate to="/home" replace />}
                      />
                    </Routes>
                  </main>
                </div>
              </div>
            </SidebarProvider>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
