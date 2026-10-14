import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Loader2,
  MapPin,
  GraduationCap,
} from "lucide-react";
import { branches } from "../../data/branches";
import { coursesApi, timetableApi } from "../../lib/api-client";
import type { Course, TimetableSlot } from "../../types";

const DAYS_OF_WEEK = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"] as const;

export const AdminCoursesPage: React.FC = () => {
  const [selectedBranchId, setSelectedBranchId] = useState<string>("cse-aift");
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"courses" | "timetable">("courses");

  const [courses, setCourses] = useState<Course[]>([]);
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const selectedBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  // Fetch courses and timetable when branch or semester changes
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [coursesData, timetableData] = await Promise.all([
        coursesApi.getCourses(selectedBranchId, selectedSemester),
        timetableApi.getTimetable(selectedBranchId, selectedSemester),
      ]);
      setCourses(coursesData || []);
      setTimetableSlots(timetableData || []);
    } catch (err: any) {
      showToast("error", err.message || "Failed to load courses data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBranchId, selectedSemester]);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Toggle course visibility
  const handleToggleVisibility = async (course: Course) => {
    const nextState = !course.isPublished;
    // Optimistic update
    setCourses((prev) =>
      prev.map((c) => (c.id === course.id ? { ...c, isPublished: nextState } : c))
    );

    try {
      await coursesApi.setVisibility(course.id, nextState);
      showToast(
        "success",
        `${course.code} is now ${nextState ? "visible to students" : "hidden from students"}.`
      );
    } catch (err: any) {
      // Revert on error
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, isPublished: !nextState } : c))
      );
      showToast("error", err.message || "Failed to update course visibility.");
    }
  };

  // Auto-generate timetable
  const handleAutoGenerate = async () => {
    const publishedCount = courses.filter((c) => c.isPublished).length;
    if (publishedCount === 0) {
      showToast("error", "Cannot generate schedule: Please publish at least one course first.");
      return;
    }

    setIsGenerating(true);
    try {
      const generated = await timetableApi.generateTimetable(selectedBranchId, selectedSemester);
      setTimetableSlots(generated || []);
      setActiveTab("timetable");
      showToast(
        "success",
        `Timetable auto-generated successfully! 30 weekly slots scheduled across 5 days.`
      );
    } catch (err: any) {
      showToast("error", err.message || "Failed to generate timetable.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Clear timetable
  const handleClearTimetable = async () => {
    if (!confirm("Are you sure you want to clear the timetable for this semester?")) return;
    try {
      await timetableApi.clearTimetable(selectedBranchId, selectedSemester);
      setTimetableSlots([]);
      showToast("success", "Timetable has been cleared.");
    } catch (err: any) {
      showToast("error", err.message || "Failed to clear timetable.");
    }
  };

  const publishedCourses = courses.filter((c) => c.isPublished);
  const hiddenCourses = courses.filter((c) => !c.isPublished);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toastMessage.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-[#E3E8F0] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#142B4A] flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-[#315EAA]" />
            <span>Course Visibility & Timetable Automation</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Decide exactly which courses students can see and auto-generate balanced 5-day academic schedules.
          </p>
        </div>

        {/* Quick Auto-Generate Timetable Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleAutoGenerate}
            disabled={isGenerating || isLoading}
            className="flex items-center gap-2 bg-[#17A89B] hover:bg-[#13897E] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-xs transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{isGenerating ? "Auto-Generating..." : "Auto-Generate Timetable"}</span>
          </button>
        </div>
      </div>

      {/* Selectors Bar: Branch & Semester */}
      <div className="bg-white rounded-2xl border border-[#E3E8F0] p-5 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Branch Selector */}
        <div className="flex-1 max-w-xl">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Academic Branch
          </label>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#142B4A] focus:outline-none focus:ring-2 focus:ring-[#315EAA]"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.shortName})
              </option>
            ))}
          </select>
        </div>

        {/* Semester Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Curriculum Semester
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedSemester === sem
                    ? "bg-[#315EAA] text-white shadow-xs"
                    : "bg-[#F6F8FC] text-slate-600 hover:bg-slate-200"
                }`}
              >
                Sem {sem}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#E3E8F0] p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Total Courses</p>
          <p className="text-2xl font-bold text-[#142B4A] mt-1">{courses.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-100 bg-emerald-50/20 p-4 shadow-xs">
          <p className="text-xs font-medium text-emerald-700 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>Visible to Students</span>
          </p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{publishedCourses.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 bg-amber-50/20 p-4 shadow-xs">
          <p className="text-xs font-medium text-amber-700 flex items-center gap-1">
            <EyeOff className="w-3.5 h-3.5" />
            <span>Hidden / Draft</span>
          </p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{hiddenCourses.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E3E8F0] p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#315EAA]" />
            <span>Scheduled Slots</span>
          </p>
          <p className="text-2xl font-bold text-[#315EAA] mt-1">
            {timetableSlots.length} <span className="text-xs font-normal text-slate-400">/ 30 periods</span>
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#E3E8F0] gap-4">
        <button
          onClick={() => setActiveTab("courses")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "courses"
              ? "border-[#315EAA] text-[#315EAA]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Course Visibility Control ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("timetable")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "timetable"
              ? "border-[#315EAA] text-[#315EAA]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Weekly Timetable Schedule ({timetableSlots.length} Slots)</span>
        </button>
      </div>

      {/* TAB 1: Course Visibility Control */}
      {activeTab === "courses" && (
        <div className="bg-white rounded-2xl border border-[#E3E8F0] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#E3E8F0] bg-slate-50/60 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#142B4A]">
                {selectedBranch.shortName} — Semester {selectedSemester} Subjects
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Toggle the switch to show or hide a course from student dashboards, catalogs, and AI reasoning.
              </p>
            </div>
            <span className="text-xs bg-[#315EAA]/10 text-[#315EAA] px-2.5 py-1 rounded-full font-semibold">
              Admin Exclusive Authority
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="w-7 h-7 animate-spin text-[#315EAA]" />
              <p className="text-sm font-medium">Loading courses for {selectedBranch.shortName}...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-base font-semibold text-slate-700">No courses found for this semester.</p>
              <p className="text-xs text-slate-400 mt-1">
                Courses will automatically initialize from the university syllabus.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E3E8F0]">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className={`p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    course.isPublished ? "hover:bg-slate-50/50" : "bg-slate-50/70 opacity-90"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-mono font-bold text-xs ${
                        course.isPublished
                          ? "bg-[#315EAA]/10 text-[#315EAA]"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {course.credits}C
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {course.code}
                        </span>
                        <h3 className="text-sm font-bold text-[#142B4A]">{course.name}</h3>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                        <span>{course.credits} Credits Weight</span>
                        <span>•</span>
                        <span>{course.semester}</span>
                        <span>•</span>
                        <span
                          className={`font-semibold flex items-center gap-1 ${
                            course.isPublished ? "text-emerald-600" : "text-amber-600"
                          }`}
                        >
                          {course.isPublished ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              Visible to Students
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              Hidden from Students
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visibility Action Toggle Button */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleToggleVisibility(course)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                        course.isPublished
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                          : "bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200"
                      }`}
                      title={course.isPublished ? "Click to hide from students" : "Click to publish to students"}
                    >
                      {course.isPublished ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Published (Click to Hide)</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-slate-400" />
                          <span>Hidden (Click to Publish)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Generated Weekly Timetable Preview */}
      {activeTab === "timetable" && (
        <div className="bg-white rounded-2xl border border-[#E3E8F0] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#E3E8F0] bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#142B4A]">
                Weekly Timetable Matrix ({selectedBranch.shortName} - Sem {selectedSemester})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                30 weekly periods (Mon–Fri) generated automatically based on credit weights.
              </p>
            </div>
            {timetableSlots.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAutoGenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-[#17A89B] hover:bg-[#13887C] text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Re-Generate</span>
                </button>
                <button
                  onClick={handleClearTimetable}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <span>Reset</span>
                </button>
              </div>
            )}
          </div>

          {timetableSlots.length === 0 ? (
            <div className="p-16 text-center">
              <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <h3 className="text-lg font-bold text-[#142B4A]">No Timetable Generated Yet</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
                Click the "Auto-Generate Timetable" button above to dynamically build a complete 5-day schedule for {selectedBranch.shortName} Semester {selectedSemester}.
              </p>
              <button
                onClick={handleAutoGenerate}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 bg-[#17A89B] hover:bg-[#13887C] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Auto-Generate Timetable Now</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto p-4">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#142B4A] text-white text-xs font-semibold uppercase tracking-wider">
                    <th className="p-3.5 rounded-tl-xl w-32">Day / Time</th>
                    <th className="p-3.5">
                      P1 <span className="font-normal block text-[10px] text-slate-300">09:00 - 10:00</span>
                    </th>
                    <th className="p-3.5">
                      P2 <span className="font-normal block text-[10px] text-slate-300">10:00 - 11:00</span>
                    </th>
                    <th className="p-3.5">
                      P3 <span className="font-normal block text-[10px] text-slate-300">11:15 - 12:15</span>
                    </th>
                    <th className="p-3.5">
                      P4 <span className="font-normal block text-[10px] text-slate-300">01:15 - 02:15</span>
                    </th>
                    <th className="p-3.5">
                      P5 <span className="font-normal block text-[10px] text-slate-300">02:15 - 03:15</span>
                    </th>
                    <th className="p-3.5 rounded-tr-xl">
                      P6 <span className="font-normal block text-[10px] text-slate-300">03:15 - 04:15</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E8F0] text-xs">
                  {DAYS_OF_WEEK.map((day) => {
                    const daySlots = timetableSlots.filter((s) => s.dayOfWeek === day);
                    return (
                      <tr key={day} className="hover:bg-slate-50/50">
                        <td className="p-3.5 font-bold text-[#142B4A] bg-slate-50/60 border-r border-[#E3E8F0]">
                          {day}
                        </td>
                        {[1, 2, 3, 4, 5, 6].map((pNum) => {
                          const slot = daySlots.find((s) => s.periodNumber === pNum);
                          return (
                            <td key={pNum} className="p-2.5 align-top border-r border-[#E3E8F0] last:border-r-0">
                              {slot ? (
                                <div className="p-2.5 rounded-xl bg-[#F6F8FC] border border-[#CBD5E1]/60 hover:border-[#315EAA]/50 transition-colors shadow-2xs space-y-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-mono font-bold text-[10px] text-[#315EAA] bg-[#315EAA]/10 px-1.5 py-0.5 rounded">
                                      {slot.course?.code || "COURSE"}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-semibold">
                                      {slot.course?.credits}C
                                    </span>
                                  </div>
                                  <p className="font-semibold text-xs text-[#142B4A] line-clamp-2 leading-tight">
                                    {slot.course?.name || "Subject"}
                                  </p>
                                  <div className="flex items-center gap-1 text-[10px] text-slate-500 pt-0.5">
                                    <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                    <span className="truncate">{slot.room}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-16 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-[11px]">
                                  Free
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
