import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  CheckSquare,
  FileText,
  Upload,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../../context/auth-context";
import { assignmentsApi } from "../../lib/api-client";
import type { Assignment } from "../../types";

export const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const facultyName = user?.name || "Faculty Member";

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [submissionsCount, setSubmissionsCount] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    assignmentsApi
      .getAssignments()
      .then((data: Assignment[]) => {
        if (data) {
          setAssignments(data);
          setActiveCount(data.length);
          let totalSubs = 0;
          let gradedSubs = 0;
          data.forEach((a) => {
            (a.submissions || []).forEach((s) => {
              totalSubs++;
              if (s.status === "GRADED") gradedSubs++;
            });
          });
          setSubmissionsCount(totalSubs);
          setPendingCount(totalSubs - gradedSubs);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E3E8F0] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#142B4A] tracking-tight">
            Welcome back, {facultyName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#315EAA]" />
            <span>Department of Computer Science & Engineering · Academic Session 2026-2027</span>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/faculty/materials"
            className="flex items-center gap-1.5 bg-[#142B4A] hover:bg-[#0F2038] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Material</span>
          </Link>
          <Link
            to="/faculty/assignments?tab=assignments"
            className="flex items-center gap-1.5 bg-[#315EAA] hover:bg-[#254B8C] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Assignment</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Assigned Courses */}
        <Link
          to="/faculty/courses"
          className="bg-white p-5 rounded-2xl border border-[#E3E8F0] hover:border-[#142B4A] shadow-xs flex items-center gap-4 transition-all block group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#142B4A]/10 text-[#142B4A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Assigned Courses</p>
            <h3 className="text-xl font-bold text-[#142B4A]">2 Active Offerings</h3>
            <span className="text-[11px] text-slate-400 font-medium">CSE / AIFT · Sem 1</span>
          </div>
        </Link>

        {/* Unified Assignments & Review Submissions Card */}
        <Link
          to="/faculty/assignments"
          className="bg-white p-5 rounded-2xl border border-[#E3E8F0] hover:border-[#315EAA] shadow-xs flex items-center gap-4 transition-all block group sm:col-span-2"
        >
          <div className="w-12 h-12 rounded-xl bg-[#315EAA]/10 text-[#315EAA] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 font-medium">Assignments & Review Submissions</p>
              <span className="text-[11px] font-semibold text-[#315EAA] group-hover:underline flex items-center gap-1">
                Open Workspace <ArrowRight className="w-3 h-3" />
              </span>
            </div>
            <div className="flex items-baseline gap-4 mt-1">
              <div>
                <span className="text-xl font-bold text-[#142B4A]">{activeCount}</span>
                <span className="text-xs text-slate-500 ml-1">Problem Sets</span>
              </div>
              <span className="text-slate-300">|</span>
              <div>
                <span className="text-xl font-bold text-[#142B4A]">{submissionsCount}</span>
                <span className="text-xs text-slate-500 ml-1">Submissions</span>
              </div>
              {pendingCount > 0 && (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {pendingCount} Pending Review
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Course Materials */}
        <Link
          to="/faculty/materials"
          className="bg-white p-5 rounded-2xl border border-[#E3E8F0] hover:border-[#17A89B] shadow-xs flex items-center gap-4 transition-all block group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#17A89B]/10 text-[#17A89B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Learning Materials</p>
            <h3 className="text-xl font-bold text-[#142B4A]">Syllabus & Lecture Notes</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Sync with Students</span>
          </div>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assigned Courses */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E3E8F0] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3E8F0]">
            <div>
              <h2 className="text-base font-bold text-[#142B4A]">Assigned Curriculum Offerings</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Accredited academic courses assigned under Yenepoya School of Technology
              </p>
            </div>
            <Link to="/faculty/courses" className="text-xs font-semibold text-[#315EAA] hover:underline flex items-center gap-1">
              <span>View Curriculum</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#E3E8F0]">
            {[
              {
                code: "CSE-101",
                name: "Computational Mathematics – I",
                dept: "Computer Science & Engineering",
                credits: 4,
                sessions: "Mon, Wed (09:00 - 10:00 AM)",
                venue: "Lecture Hall LH-101",
              },
              {
                code: "CSE-103",
                name: "Problem Solving using Programming",
                dept: "Computer Science & Engineering",
                credits: 4,
                sessions: "Tue, Thu (10:00 - 11:00 AM)",
                venue: "Systems Lab 2",
              },
            ].map((c) => (
              <div key={c.code} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#315EAA] bg-[#315EAA]/10 px-2.5 py-0.5 rounded">
                      {c.code}
                    </span>
                    <h4 className="text-sm font-semibold text-[#142B4A]">{c.name}</h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    {c.dept} · {c.credits} Credits · {c.venue}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{c.sessions}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to="/faculty/materials"
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Materials
                  </Link>
                  <Link
                    to="/faculty/assignments?tab=assignments"
                    className="text-xs font-semibold text-[#315EAA] hover:bg-[#315EAA]/10 px-3 py-1.5 rounded-lg transition-colors border border-[#315EAA]/20"
                  >
                    Coursework
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Quick Submissions & Review Queue */}
        <div className="bg-white p-6 rounded-2xl border border-[#E3E8F0] shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E8F0]">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#315EAA]" />
                <h3 className="text-sm font-bold text-[#142B4A]">Submissions Review Queue</h3>
              </div>
              <Link
                to="/faculty/assignments?tab=submissions"
                className="text-xs font-semibold text-[#315EAA] hover:underline"
              >
                Review All
              </Link>
            </div>

            {isLoading ? (
              <p className="text-xs text-slate-400 italic">Checking for student submissions...</p>
            ) : assignments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No assignments active yet.</p>
            ) : (
              <div className="space-y-3">
                {assignments.slice(0, 3).map((a) => {
                  const subs = a.submissions || [];
                  const graded = subs.filter((s) => s.status === "GRADED").length;
                  const pending = subs.length - graded;

                  return (
                    <div
                      key={a.id}
                      className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-[#315EAA]">
                          {a.course?.code}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Due: {new Date(a.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-[#142B4A] line-clamp-1">{a.title}</h5>
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-slate-500">{subs.length} Total Submissions</span>
                        {pending > 0 ? (
                          <span className="text-amber-700 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {pending} To Grade
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            All Evaluated
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Link
              to="/faculty/assignments?tab=submissions"
              className="w-full flex items-center justify-center gap-2 bg-[#17A89B] hover:bg-[#13887C] text-white py-2.5 px-4 rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Evaluate All Submissions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
