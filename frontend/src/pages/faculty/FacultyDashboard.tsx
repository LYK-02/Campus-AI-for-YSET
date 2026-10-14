import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckSquare, FileText, Sparkles, Upload, Plus } from "lucide-react";
import { useAuth } from "../../context/auth-context";

export const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const facultyName = user?.name || "Faculty Member";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E3E8F0] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#315EAA] bg-[#315EAA]/10 px-2.5 py-0.5 rounded-full mb-2">
            Faculty Workspace
          </span>
          <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
            Welcome, {facultyName}
          </h1>
          <p className="text-xs text-[#68758A] mt-1">
            Manage your assigned courses, review student submissions, and upload teaching materials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/faculty/materials"
            className="flex items-center gap-1.5 bg-[#142B4A] hover:bg-[#0F2038] text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Material</span>
          </Link>
          <Link
            to="/faculty/assignments"
            className="flex items-center gap-1.5 bg-[#315EAA] hover:bg-[#264A86] text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Assignment</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E3E8F0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#142B4A]/10 text-[#142B4A] flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#68758A] font-medium">Assigned Courses</p>
            <h3 className="text-xl font-bold text-[#172033]">3</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3E8F0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#D99019]/10 text-[#D99019] flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#68758A] font-medium">Submissions to Grade</p>
            <h3 className="text-xl font-bold text-[#172033]">14</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3E8F0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#315EAA]/10 text-[#315EAA] flex items-center justify-center shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#68758A] font-medium">Active Assignments</p>
            <h3 className="text-xl font-bold text-[#172033]">4</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3E8F0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#17A89B]/10 text-[#17A89B] flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#68758A] font-medium">AI Tools Enabled</p>
            <h3 className="text-xl font-bold text-[#172033]">Ready</h3>
          </div>
        </div>
      </div>

      {/* Courses Table / List */}
      <div className="bg-white p-6 rounded-2xl border border-[#E3E8F0] shadow-xs">
        <h2 className="text-base font-bold text-[#172033] mb-4">Assigned Course Offerings</h2>
        <div className="divide-y divide-[#E3E8F0]">
          {[
            { code: "CS-304", name: "Operating Systems & Concurrency", dept: "Computer Science", students: 58 },
            { code: "CS-401", name: "Distributed Systems Architecture", dept: "Computer Science", students: 42 },
          ].map((c) => (
            <div key={c.code} className="py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#142B4A] bg-[#142B4A]/10 px-2 py-0.5 rounded">
                    {c.code}
                  </span>
                  <h4 className="text-sm font-semibold text-[#172033]">{c.name}</h4>
                </div>
                <p className="text-xs text-[#68758A] mt-1">{c.dept} · {c.students} enrolled students</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/faculty/courses/${c.code}`}
                  className="text-xs font-semibold text-[#315EAA] hover:bg-[#315EAA]/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Manage Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
