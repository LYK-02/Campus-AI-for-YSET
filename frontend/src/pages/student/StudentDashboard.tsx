import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  CheckSquare,
  Sparkles,
  Bell,
  ArrowRight,
  Award,
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../../context/auth-context";
import { branches } from "../../data/branches";
import { assignmentsApi, announcementsApi } from "../../lib/api-client";
import type { Assignment, Announcement } from "../../types";

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const studentName = user?.name || "Student";

  const userBranch = branches.find((b) => b.id === user?.branchId) || branches[0];
  const userSemester = user?.semester || 1;
  const currentSemesterData =
    userBranch.semesters.find((s) => s.semester === userSemester) || userBranch.semesters[0];
  const enrolledSubjects = currentSemesterData?.subjects || [];
  const totalCredits = enrolledSubjects.reduce((sum, s) => sum + s.credits, 0);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      assignmentsApi.getAssignments().catch(() => []),
      announcementsApi.getAnnouncements().catch(() => []),
    ])
      .then(([assignmentsData, announcementsData]) => {
        setAssignments(assignmentsData || []);
        setAnnouncements(announcementsData || []);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const activeAssignmentsCount = assignments.length;
  const pendingAssignmentsCount = assignments.filter((a) => !a.submissions || a.submissions.length === 0).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E3E8F0] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#142B4A] tracking-tight">
            Welcome back, {studentName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#315EAA]" />
            <span>
              {userBranch.name} · Semester {userSemester} · {user?.studentId || "YSET Student"}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/student/timetable"
            className="inline-flex items-center gap-2 bg-[#F6F8FC] hover:bg-slate-200 text-[#142B4A] text-xs font-semibold px-4 py-2.5 rounded-xl border border-[#CBD5E1] transition-colors shadow-2xs"
          >
            <Calendar className="w-4 h-4 text-[#315EAA]" />
            <span>Timetable</span>
          </Link>
          <Link
            to="/student/materials"
            className="inline-flex items-center gap-2 bg-[#F6F8FC] hover:bg-slate-200 text-[#142B4A] text-xs font-semibold px-4 py-2.5 rounded-xl border border-[#CBD5E1] transition-colors shadow-2xs"
          >
            <FileText className="w-4 h-4 text-[#17A89B]" />
            <span>Materials</span>
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
        <Link
          to="/student/courses"
          className="bg-white p-5 rounded-2xl border border-[#E3E8F0] hover:border-[#142B4A] shadow-xs flex items-center gap-4 transition-all block group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#142B4A]/10 text-[#142B4A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Semester Curriculum</p>
            <h3 className="text-xl font-bold text-[#142B4A]">{enrolledSubjects.length} Courses</h3>
            <span className="text-[11px] text-slate-400 font-medium">{totalCredits} Total Credits</span>
          </div>
        </Link>

        <Link
          to="/student/assignments"
          className="bg-white p-5 rounded-2xl border border-[#E3E8F0] hover:border-[#315EAA] shadow-xs flex items-center gap-4 transition-all block group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#315EAA]/10 text-[#315EAA] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Active Coursework</p>
            <h3 className="text-xl font-bold text-[#142B4A]">{activeAssignmentsCount} Assignments</h3>
            <span
              className={`text-[11px] font-semibold ${
                pendingAssignmentsCount > 0 ? "text-amber-600" : "text-emerald-600"
              }`}
            >
              {pendingAssignmentsCount > 0 ? `${pendingAssignmentsCount} To Submit` : "All Complete"}
            </span>
          </div>
        </Link>

        <Link
          to="/student/timetable"
          className="bg-white p-5 rounded-2xl border border-[#E3E8F0] hover:border-[#D99019] shadow-xs flex items-center gap-4 transition-all block group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#D99019]/10 text-[#D99019] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Timetable Schedule</p>
            <h3 className="text-xl font-bold text-[#142B4A]">5 Days / Week</h3>
            <span className="text-[11px] text-[#D99019] font-medium">Auto-Generated</span>
          </div>
        </Link>

        <Link
          to="/student/materials"
          className="bg-white p-5 rounded-2xl border border-[#E3E8F0] hover:border-[#17A89B] shadow-xs flex items-center gap-4 transition-all block group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#17A89B]/10 text-[#17A89B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Study Materials</p>
            <h3 className="text-xl font-bold text-[#142B4A]">Lecture Notes & PDFs</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Faculty Uploaded</span>
          </div>
        </Link>
      </div>

      {/* Main Grid: Enrolled Courses & Real-Time Academic Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Course Overview & Deadlines */}
        <div className="lg:col-span-2 space-y-6">
          {/* Courses List */}
          <div className="bg-white p-6 rounded-2xl border border-[#E3E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E8F0]">
              <div>
                <h2 className="text-base font-bold text-[#142B4A]">Enrolled Semester Curriculum</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Academic coursework structure under Yenepoya School of Technology
                </p>
              </div>
              <Link
                to="/student/courses"
                className="text-xs font-semibold text-[#315EAA] hover:underline flex items-center gap-1"
              >
                <span>View Full Syllabus</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {enrolledSubjects.map((sub, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-[#E3E8F0] hover:border-[#315EAA]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC]/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-[#315EAA] bg-[#315EAA]/10 px-2.5 py-1 rounded">
                      {sub.credits} {sub.credits === 1 ? "CREDIT" : "CREDITS"}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-[#142B4A]">{sub.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {userBranch.shortName} · Semester {userSemester}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      to="/student/materials"
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Materials
                    </Link>
                    <Link
                      to="/student/courses"
                      className="text-xs font-semibold text-[#315EAA] hover:bg-[#315EAA]/10 px-3 py-1.5 rounded-lg transition-colors border border-[#315EAA]/20"
                    >
                      Syllabus
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real Live Announcements Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#E3E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E8F0]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#D99019]" />
                <h2 className="text-base font-bold text-[#142B4A]">Institutional Circulars & Notices</h2>
              </div>
              <Link
                to="/student/announcements"
                className="text-xs font-semibold text-[#315EAA] hover:underline flex items-center gap-1"
              >
                <span>View All Circulars</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <p className="text-xs text-slate-400 italic">Loading university circulars...</p>
            ) : announcements.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No announcements published at this time.</p>
            ) : (
              <div className="space-y-3">
                {announcements.slice(0, 2).map((notice) => (
                  <div
                    key={notice.id}
                    className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200/80 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#315EAA] bg-[#315EAA]/10 px-2 py-0.5 rounded">
                        {notice.course?.code || "YSET University Circular"}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#142B4A] pt-1">{notice.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {notice.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Coursework Deadlines & AI Assistant */}
        <div className="space-y-6">
          {/* Active Assignments Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#E3E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E8F0]">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#315EAA]" />
                <h3 className="text-sm font-bold text-[#142B4A]">Active Coursework</h3>
              </div>
              <Link to="/student/assignments" className="text-xs font-semibold text-[#315EAA] hover:underline">
                View All
              </Link>
            </div>

            {isLoading ? (
              <p className="text-xs text-slate-400 italic">Checking active coursework...</p>
            ) : assignments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No coursework assigned right now.</p>
            ) : (
              <div className="space-y-3">
                {assignments.slice(0, 3).map((a) => {
                  const studentSub = a.submissions?.[0];
                  const isSubmitted = !!studentSub;
                  const isGraded = studentSub?.status === "GRADED";

                  return (
                    <div
                      key={a.id}
                      className="p-3.5 bg-[#F8FAFC] rounded-xl border border-slate-200/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-[#315EAA]">
                          {a.course?.code}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{new Date(a.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <h5 className="text-xs font-bold text-[#142B4A] line-clamp-1">{a.title}</h5>
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-slate-500">Max: {a.maxMarks} Marks</span>
                        {isGraded ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {studentSub.marks}/{a.maxMarks} Graded
                          </span>
                        ) : isSubmitted ? (
                          <span className="text-blue-700 font-semibold">Submitted</span>
                        ) : (
                          <span className="text-amber-700 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            To Submit
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Assistant Quick Callout */}
          <div className="bg-gradient-to-br from-[#142B4A] to-[#1D3B63] p-6 rounded-2xl text-white shadow-xs">
            <div className="flex items-center gap-2 text-[#17A89B] text-xs font-semibold mb-3">
              <Sparkles className="w-4 h-4" />
              <span>YSET AI Tutor & Assistant</span>
            </div>
            <h3 className="text-lg font-bold mb-2">Academic Study Help</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Ask questions grounded directly in your CSE / AIFT curriculum, lecture notes, and syllabus modules.
            </p>

            <div className="space-y-2 mb-6">
              <Link
                to="/ai"
                className="block p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-200 border border-white/10 transition-colors"
              >
                💬 "Explain asymptotic notations in CSE-103"
              </Link>
              <Link
                to="/ai"
                className="block p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-200 border border-white/10 transition-colors"
              >
                💬 "Summarize Computational Mathematics unit 1"
              </Link>
            </div>

            <Link
              to="/ai"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#17A89B] hover:bg-[#13897E] text-white text-xs font-semibold py-2.5 rounded-xl transition-colors shadow-xs"
            >
              <span>Consult Academic AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
