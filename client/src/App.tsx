import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardPage from "@/pages/DashboardPage";
import MasterSubjectPage from "@/pages/admin/MasterSubjectPage";
import MasterClassPage from "@/pages/admin/MasterClassPage";
import InputGradePage from "@/pages/academic/InputGradePage";
import P5Dashboard from "@/pages/p5/P5Dashboard";
import P5AssessmentPage from "@/pages/p5/P5AssessmentPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />

        {/* Admin Routes */}
        <Route path="academic/subjects" element={<MasterSubjectPage />} />
        <Route path="academic/classes" element={<MasterClassPage />} />

        {/* P5 Routes */}
        <Route path="p5" element={<P5Dashboard />} />
        <Route path="p5/:projectId" element={<P5AssessmentPage />} />

        {/* Teacher Routes */}
        <Route path="academic/grades" element={<InputGradePage />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
