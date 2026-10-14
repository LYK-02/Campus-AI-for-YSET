import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/auth-context";
import { AppLayout } from "./components/layout/AppLayout";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { FacultyDashboard } from "./pages/faculty/FacultyDashboard";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AIChatPage } from "./pages/ai/AIChatPage";
import { CurriculumPage } from "./pages/student/CurriculumPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { AdminCoursesPage } from "./pages/admin/AdminCoursesPage";
import { TimetablePage } from "./pages/student/TimetablePage";
import { FacultyAssignmentsPage } from "./pages/faculty/FacultyAssignmentsPage";
import { FacultyMaterialsPage } from "./pages/faculty/FacultyMaterialsPage";
import { StudentAssignmentsPage } from "./pages/student/StudentAssignmentsPage";
import { StudentMaterialsPage } from "./pages/student/StudentMaterialsPage";
import { AnnouncementsPage } from "./pages/AnnouncementsPage";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* App Shell with Role Workspaces */}
          <Route element={<AppLayout />}>
            {/* Student workspace */}
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/courses" element={<CurriculumPage />} />
            <Route path="/student/assignments" element={<StudentAssignmentsPage />} />
            <Route path="/student/materials" element={<StudentMaterialsPage />} />
            <Route path="/student/timetable" element={<TimetablePage />} />
            <Route path="/student/announcements" element={<AnnouncementsPage />} />
            <Route path="/student/*" element={<StudentDashboard />} />

            {/* Faculty workspace */}
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/faculty/courses" element={<CurriculumPage />} />
            <Route path="/faculty/assignments" element={<FacultyAssignmentsPage />} />
            <Route path="/faculty/submissions" element={<FacultyAssignmentsPage />} />
            <Route path="/faculty/materials" element={<FacultyMaterialsPage />} />
            <Route path="/faculty/announcements" element={<AnnouncementsPage />} />
            <Route path="/faculty/*" element={<FacultyDashboard />} />

            {/* Admin workspace */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/courses" element={<AdminCoursesPage />} />
            <Route path="/admin/timetable" element={<AdminCoursesPage />} />
            <Route path="/admin/announcements" element={<AnnouncementsPage />} />
            <Route path="/admin/*" element={<AdminDashboard />} />

            {/* AI Assistant */}
            <Route path="/ai" element={<AIChatPage />} />
            <Route path="/ai/*" element={<AIChatPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
