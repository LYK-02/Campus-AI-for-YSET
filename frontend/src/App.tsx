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
            <Route path="/student/timetable" element={<TimetablePage />} />
            <Route path="/student/*" element={<StudentDashboard />} />

            {/* Faculty workspace */}
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/faculty/*" element={<FacultyDashboard />} />

            {/* Admin workspace */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/courses" element={<AdminCoursesPage />} />
            <Route path="/admin/timetable" element={<AdminCoursesPage />} />
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
