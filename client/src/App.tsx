import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardPage from "@/pages/DashboardPage";
import MasterSubjectPage from "@/pages/admin/MasterSubjectPage";
import MasterClassPage from "@/pages/admin/MasterClassPage";
import MasterStudentPage from "@/pages/admin/MasterStudentPage";
import InputGradePage from "@/pages/academic/InputGradePage";
import P5Dashboard from "@/pages/p5/P5Dashboard";
import P5AssessmentPage from "@/pages/p5/P5AssessmentPage";
import StudentAffairsDashboard from "@/pages/student-affairs/StudentAffairsDashboard";
import UksDashboard from "@/pages/uks/UksDashboard";
import LibraryDashboard from "@/pages/library/LibraryDashboard";

import FinanceDashboard from "@/pages/finance/FinanceDashboard";
import AssetDashboard from "@/pages/assets/AssetDashboard";
import LandingPage from "@/pages/LandingPage";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />

          {/* Admin Routes */}
          <Route path="academic/subjects" element={<MasterSubjectPage />} />
          <Route path="academic/classes" element={<MasterClassPage />} />
          <Route path="academic/students" element={<MasterStudentPage />} />

          <Route path="p5" element={<P5Dashboard />} />
          <Route path="p5/:projectId" element={<P5AssessmentPage />} />

          {/* Student Affairs Routes */}
          <Route path="student-affairs" element={<StudentAffairsDashboard />} />

          {/* UKS Routes */}
          <Route path="uks" element={<UksDashboard />} />

          {/* Library Routes */}
          <Route path="library" element={<LibraryDashboard />} />

          {/* Finance Routes */}
          <Route path="finance" element={<FinanceDashboard />} />

          {/* Assets / Sarpras Routes */}
          <Route path="assets" element={<AssetDashboard />} />

          {/* Teacher Routes */}
          <Route path="academic/grades" element={<InputGradePage />} />
        </Route>

        {/* <Route path="/" element={<Navigate to="/login" replace />} /> Note: Root is now LandingPage */}
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
