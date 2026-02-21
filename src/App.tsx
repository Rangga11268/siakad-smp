import { Routes, Route } from "react-router-dom"; // Restored import
import PublicLayout from "@/layouts/PublicLayout";
import AboutPage from "@/pages/public/AboutPage";
import AcademicPage from "@/pages/public/AcademicPage";
import FacilitiesPage from "@/pages/public/FacilitiesPage";
import ContactPage from "@/pages/public/ContactPage";
import NewsPage from "@/pages/public/NewsPage";
import NewsDetailPage from "@/pages/public/NewsDetailPage";

import LoginPage from "@/pages/auth/LoginPage";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import MasterSubjectPage from "@/pages/admin/MasterSubjectPage";
import MasterClassPage from "@/pages/admin/MasterClassPage";
import MasterStudentPage from "@/pages/admin/MasterStudentPage";
import StudentDetailPage from "@/pages/admin/StudentDetailPage";
import MasterTeacherPage from "@/pages/admin/MasterTeacherPage";
import MasterNewsPage from "./pages/admin/MasterNewsPage";
import InputGradePage from "@/pages/academic/InputGradePage";
import TeacherRemedialPage from "@/pages/academic/TeacherRemedialPage";
import AssessmentPage from "@/pages/academic/AssessmentPage";
import StudentAssignmentPage from "@/pages/student/StudentAssignmentPage";
import StudentBillPage from "@/pages/student/StudentBillPage";
import StudentP5Page from "@/pages/student/StudentP5Page";
import StudentP5DetailPage from "@/pages/student/StudentP5DetailPage";
import StudentUksPage from "@/pages/student/StudentUksPage";
import StudentLibraryPage from "@/pages/student/StudentLibraryPage";
import StudentLearningPage from "@/pages/student/StudentLearningPage";
import TeacherHubPage from "@/pages/academic/TeacherHubPage";
import HomeroomDashboardPage from "@/pages/academic/HomeroomDashboardPage";
import HomeroomAttendancePage from "@/pages/academic/HomeroomAttendancePage";
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
import PPDBInfoPage from "@/pages/public/PPDBInfoPage";
import PPDBStatusPage from "./pages/public/PPDBStatusPage";
import PPDBAdminPage from "@/pages/admin/PPDBAdminPage";
import SchedulePage from "@/pages/academic/SchedulePage";
import StudentAttendancePage from "@/pages/student/StudentAttendancePage";
import StudentGradePage from "@/pages/student/StudentGradePage";
import StudentMaterialPage from "@/pages/student/StudentMaterialPage";
import StudentReportPage from "@/pages/student/StudentReportPage";
import TeacherMaterialPage from "@/pages/academic/TeacherMaterialPage";
import AttendanceScannerPage from "@/pages/attendance/AttendanceScannerPage";

import FinanceDashboard from "@/pages/finance/FinanceDashboard";
import AssetDashboard from "@/pages/assets/AssetDashboard";
import LandingPage from "@/pages/public/LandingPage";
import PrintReportPage from "@/pages/common/PrintReportPage";
import { Toaster } from "@/components/ui/toaster";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";

function App() {
  return (
    <>
      <ErrorBoundary>
        <Routes>
          {/* Standalone Print Route */}
          <Route
            path="/print/report"
            element={
              <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
                <PrintReportPage />
              </ProtectedRoute>
            }
          />

          {/* Public Routes with Layout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/academic" element={<AcademicPage />} />
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            {/* Public PPDB Routes */}
            <Route path="/ppdb" element={<PPDBInfoPage />} />
            <Route path="/ppdb/register" element={<PPDBRegisterPage />} />
            <Route path="/ppdb/status" element={<PPDBStatusPage />} />

            {/* Public News Routes */}
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:slug" element={<NewsDetailPage />} />
          </Route>

          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            {/* Admin Routes */}
            <Route path="academic/subjects" element={<MasterSubjectPage />} />
            <Route path="academic/classes" element={<MasterClassPage />} />
            <Route path="academic/students" element={<MasterStudentPage />} />
            <Route
              path="academic/students/:id"
              element={<StudentDetailPage />}
            />
            <Route path="academic/teachers" element={<MasterTeacherPage />} />
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
            <Route path="student/grades" element={<StudentGradePage />} />
            <Route path="p5" element={<P5Dashboard />} />
            <Route path="p5/:projectId" element={<P5AssessmentPage />} />
            <Route path="p5/report" element={<P5ReportPage />} />
            {/* Student Affairs Routes */}
            <Route
              path="student-affairs"
              element={<StudentAffairsDashboard />}
            />
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
            {/* Scan QR Route */}
            <Route path="academic/scan" element={<AttendanceScannerPage />} />
            {/* Content Routes */}
            <Route path="content/news" element={<MasterNewsPage />} />{" "}
            {/* News Management */}
            {/* Teacher Routes */}
            <Route path="teacher/hub" element={<TeacherHubPage />} />
            <Route
              path="teacher/homeroom"
              element={<HomeroomDashboardPage />}
            />
            <Route
              path="teacher/homeroom/attendance"
              element={<HomeroomAttendancePage />}
            />
            <Route path="academic/assessment" element={<AssessmentPage />} />
            <Route path="academic/grades" element={<InputGradePage />} />
            <Route path="academic/remedial" element={<TeacherRemedialPage />} />
            <Route
              path="academic/materials"
              element={<TeacherMaterialPage />}
            />
            {/* Student Hub */}
            <Route path="student/hub" element={<StudentLearningPage />} />
            <Route path="student/bills" element={<StudentBillPage />} />
            <Route
              path="student/assignments"
              element={<StudentAssignmentPage />}
            />
            <Route path="student/materials" element={<StudentMaterialPage />} />
            <Route path="student/p5" element={<StudentP5Page />} />
            <Route
              path="student/p5/:projectId"
              element={<StudentP5DetailPage />}
            />
            <Route path="student/uks" element={<StudentUksPage />} />
            <Route path="student/library" element={<StudentLibraryPage />} />
            <Route path="student/report" element={<StudentReportPage />} />
          </Route>
        </Routes>
      </ErrorBoundary>
      <Toaster />
    </>
  );
}

export default App;
