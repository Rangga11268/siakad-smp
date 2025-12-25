import { Routes, Route } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardPage from "@/pages/DashboardPage";
import MasterSubjectPage from "@/pages/admin/MasterSubjectPage";
import MasterClassPage from "@/pages/admin/MasterClassPage";
import MasterStudentPage from "@/pages/admin/MasterStudentPage";
import InputGradePage from "@/pages/academic/InputGradePage";
import P5Dashboard from "@/pages/p5/P5Dashboard";
import P5AssessmentPage from "@/pages/p5/P5AssessmentPage";
import P5ReportPage from "@/pages/p5/P5ReportPage";
import StudentAffairsDashboard from "@/pages/student-affairs/StudentAffairsDashboard";
import BKLetterPage from "@/pages/student-affairs/BKLetterPage";
// import ParentDashboard from "@/pages/parent/ParentDashboard";
import UksDashboard from "@/pages/uks/UksDashboard";
import LibraryDashboard from "@/pages/library/LibraryDashboard";
import LearningGoalPage from "@/pages/academic/LearningGoalPage";
import AttendancePage from "@/pages/academic/AttendancePage";
import JournalPage from "@/pages/academic/JournalPage";
import ReportCardPage from "@/pages/academic/ReportCardPage";
import PPDBRegisterPage from "@/pages/public/PPDBRegisterPage";
import PPDBStatusPage from "./pages/public/PPDBStatusPage";
import PPDBAdminPage from "@/pages/admin/PPDBAdminPage";
import SchedulePage from "@/pages/academic/SchedulePage";
import StudentAttendancePage from "@/pages/student/StudentAttendancePage";

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

        {/* Public PPDB Routes */}
        <Route path="/ppdb/register" element={<PPDBRegisterPage />} />
        <Route path="/ppdb/status" element={<PPDBStatusPage />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />

          {/* Admin Routes */}
          <Route path="academic/subjects" element={<MasterSubjectPage />} />
          <Route path="academic/classes" element={<MasterClassPage />} />
          <Route path="academic/students" element={<MasterStudentPage />} />
          <Route path="academic/students" element={<MasterStudentPage />} />
          <Route path="academic/attendance" element={<AttendancePage />} />
          <Route path="academic/journal" element={<JournalPage />} />
          <Route path="ppdb" element={<PPDBAdminPage />} />
          <Route
            path="academic/learning-goals"
            element={<LearningGoalPage />}
          />
          <Route path="academic/report" element={<ReportCardPage />} />
          <Route path="academic/schedule" element={<SchedulePage />} />

          {/* Student Routes */}
          <Route
            path="student/attendance"
            element={<StudentAttendancePage />}
          />

          <Route path="p5" element={<P5Dashboard />} />
          <Route path="p5/:projectId" element={<P5AssessmentPage />} />
          <Route path="p5/report" element={<P5ReportPage />} />

          {/* Student Affairs Routes */}
          <Route path="student-affairs" element={<StudentAffairsDashboard />} />
          <Route
            path="student-affairs/letter/:studentId"
            element={<BKLetterPage />}
          />

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
