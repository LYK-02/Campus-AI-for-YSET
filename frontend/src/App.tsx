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

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<RegisterPage />} />

          {/* App Shell with Role Workspaces */}
          <Route element={<AppLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/courses" element={<CurriculumPage />} />
            <Route path="/student/*" element={<StudentDashboard />} />
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/faculty/*" element={<FacultyDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
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
