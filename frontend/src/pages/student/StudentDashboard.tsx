import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckSquare, Sparkles, Bell, ArrowRight, Award, FileText } from "lucide-react";
import { useAuth } from "../../context/auth-context";
import { branches } from "../../data/branches";

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const studentName = user?.name || "Student";

  const userBranch = branches.find((b) => b.id === user?.branchId) || branches[0];
  const userSemester = user?.semester || 1;
  const currentSemesterData =
    userBranch.semesters.find((s) => s.semester === userSemester) || userBranch.semesters[0];
  const enrolledSubjects = currentSemesterData?.subjects || [];
  const totalCredits = enrolledSubjects.reduce((sum, s) => sum + s.credits, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E3E8F0] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#17A89B]/10 text-[#17A89B] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Portal · YSET</span>
          </div>
          <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
            Good day, {studentName}
          </h1>
          <p className="text-xs text-[#68758A] mt-1">
            {userBranch.name} · Semester {userSemester}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/student/courses"
            className="inline-flex items-center gap-2 bg-[#142B4A] hover:bg-[#0F2038] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <BookOpen className="w-4 h-4 text-[#17A89B]" />
            <span>View Syllabus</span>
          </Link>
          <Link
            to="/ai"
            className="inline-flex items-center gap-2 bg-[#17A89B] hover:bg-[#13897E] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask YSET AI</span>
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E3E8F0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#142B4A]/10 text-[#142B4A] flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#68758A] font-medium">Semester Courses</p>
            <h3 className="text-xl font-bold text-[#172033]">{enrolledSubjects.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3E8F0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#315EAA]/10 text-[#315EAA] flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#68758A] font-medium">Total Credits</p>
            <h3 className="text-xl font-bold text-[#172033]">{totalCredits}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3E8F0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#D99019]/10 text-[#D99019] flex items-center justify-center shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#68758A] font-medium">Pending Tasks</p>
            <h3 className="text-xl font-bold text-[#172033]">3</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3E8F0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#16845B]/10 text-[#16845B] flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#68758A] font-medium">Branch Scheme</p>
            <h3 className="text-sm font-bold text-[#172033]">{userBranch.shortName}</h3>
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming Deadlines & AI Assistant Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Course Overview & Deadlines */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E3E8F0] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#172033]">Enrolled Semester Courses</h2>
              <Link to="/student/courses" className="text-xs font-semibold text-[#315EAA] hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {enrolledSubjects.map((sub, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-[#E3E8F0] hover:border-[#315EAA]/40 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-[#142B4A] bg-[#142B4A]/10 px-2 py-0.5 rounded">
                      {sub.credits} {sub.credits === 1 ? "CR" : "CRS"}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-[#172033]">{sub.name}</h4>
                      <p className="text-xs text-[#68758A] mt-0.5">
                        {userBranch.shortName} · Semester {userSemester}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/student/courses"
                    className="text-xs font-semibold text-[#315EAA] hover:bg-[#315EAA]/10 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    View Syllabus
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Announcements Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#E3E8F0] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#D99019]" />
                Recent Announcements
              </h2>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-[#142B4A] uppercase tracking-wider">YSET Academic Dean</span>
              <h4 className="text-sm font-bold text-[#172033] mt-1">Mid-Term Examination Schedule Released</h4>
              <p className="text-xs text-[#68758A] mt-1">
                The comprehensive schedule for Semester 5 laboratory and theory exams is now published under Notice Board.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: AI Assistant Quick Action */}
        <div className="space-y-6">
          <div className="bg-linear-to-br from-[#142B4A] to-[#1D3B63] p-6 rounded-2xl text-white shadow-xs">
            <div className="flex items-center gap-2 text-[#17A89B] text-xs font-semibold mb-3">
              <Sparkles className="w-4 h-4" />
              <span>YSET AI Assistant</span>
            </div>
            <h3 className="text-lg font-bold mb-2">Need Help Studying?</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Ask questions grounded directly in your syllabus notes, uploaded PDFs, and official YSET knowledge base.
            </p>

            <div className="space-y-2 mb-6">
              <Link
                to="/ai"
                className="block p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-200 border border-white/10 transition-colors"
              >
                💬 "Explain process synchronization from OS notes"
              </Link>
              <Link
                to="/ai"
                className="block p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-200 border border-white/10 transition-colors"
              >
                💬 "Quiz me on binary search trees"
              </Link>
            </div>

            <Link
              to="/ai"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#17A89B] hover:bg-[#13897E] text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
            >
              Open Full AI Chat
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
