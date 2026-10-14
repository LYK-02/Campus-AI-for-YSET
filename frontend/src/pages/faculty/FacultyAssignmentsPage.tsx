import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckSquare,
  Plus,
  Clock,
  Award,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Search,
  Filter,
  Users,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { assignmentsApi, coursesApi } from "../../lib/api-client";
import type { Assignment, Course, Submission } from "../../types";

export const FacultyAssignmentsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "submissions" ? "submissions" : "assignments";

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters & Search
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("ALL");
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [gradingSubmission, setGradingSubmission] = useState<{
    submission: Submission;
    assignmentTitle: string;
    courseCode: string;
    maxMarks: number;
  } | null>(null);

  // Form states
  const [newCourseId, setNewCourseId] = useState<string>("");
  const [newTitle, setNewTitle] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");
  const [newDueDate, setNewDueDate] = useState<string>("");
  const [newMaxMarks, setNewMaxMarks] = useState<number>(100);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Grading form states
  const [gradeMarks, setGradeMarks] = useState<number>(0);
  const [gradeFeedback, setGradeFeedback] = useState<string>("");

  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToast(type === "success" ? { type: "success", text } : { type: "error", text });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [assignmentsData, coursesData] = await Promise.all([
        assignmentsApi.getAssignments(),
        coursesApi.getCourses("cse-aift", 1),
      ]);
      setAssignments(assignmentsData || []);
      setCourses(coursesData || []);
      if (coursesData && coursesData.length > 0 && !newCourseId) {
        setNewCourseId(coursesData[0].id);
      }
    } catch (err: any) {
      showToast("error", err?.message || "Failed to load coursework data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseId || !newTitle || !newDescription || !newDueDate) {
      showToast("error", "Please fill in all mandatory fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await assignmentsApi.createAssignment({
        courseId: newCourseId,
        title: newTitle,
        description: newDescription,
        dueDate: newDueDate,
        maxMarks: newMaxMarks,
      });

      showToast("success", "Assignment successfully published to students!");
      setIsCreateOpen(false);
      setNewTitle("");
      setNewDescription("");
      setNewDueDate("");
      await loadData();
    } catch (err: any) {
      showToast("error", err?.message || "Failed to create assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    setIsSubmitting(true);
    try {
      await assignmentsApi.gradeSubmission(gradingSubmission.submission.id, {
        marks: Number(gradeMarks),
        feedback: gradeFeedback,
      });

      showToast("success", "Grade and qualitative feedback successfully saved!");
      setGradingSubmission(null);
      await loadData();
    } catch (err: any) {
      showToast("error", err?.message || "Failed to submit grading evaluation");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Flattened submissions list for unified review
  const allSubmissions = useMemo(() => {
    const list: Array<{
      submission: Submission;
      assignmentTitle: string;
      assignmentId: string;
      courseCode: string;
      courseName: string;
      maxMarks: number;
      dueDate: string;
    }> = [];

    assignments.forEach((a) => {
      (a.submissions || []).forEach((sub) => {
        list.push({
          submission: sub,
          assignmentTitle: a.title,
          assignmentId: a.id,
          courseCode: a.course?.code || "COURSE",
          courseName: a.course?.name || "Curriculum Course",
          maxMarks: a.maxMarks,
          dueDate: a.dueDate,
        });
      });
    });

    return list;
  }, [assignments]);

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return allSubmissions.filter((item) => {
      const matchCourse =
        selectedCourseFilter === "ALL" ||
        item.courseCode === selectedCourseFilter ||
        item.assignmentId === selectedCourseFilter;

      const matchStatus =
        submissionStatusFilter === "ALL" ||
        (submissionStatusFilter === "PENDING" && item.submission.status !== "GRADED") ||
        item.submission.status === submissionStatusFilter;

      const studentName = item.submission.student?.name || "";
      const studentId = item.submission.student?.studentId || "";
      const matchSearch =
        !searchQuery ||
        studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.assignmentTitle.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCourse && matchStatus && matchSearch;
    });
  }, [allSubmissions, selectedCourseFilter, submissionStatusFilter, searchQuery]);

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchCourse = selectedCourseFilter === "ALL" || a.course?.code === selectedCourseFilter;
      const matchSearch =
        !searchQuery ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.course?.name && a.course.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCourse && matchSearch;
    });
  }, [assignments, selectedCourseFilter, searchQuery]);

  // Aggregate metrics
  const totalAssignmentsCount = assignments.length;
  const totalSubmissionsCount = allSubmissions.length;
  const gradedCount = allSubmissions.filter((s) => s.submission.status === "GRADED").length;
  const pendingCount = totalSubmissionsCount - gradedCount;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="bg-white rounded-2xl border border-[#E3E8F0] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#142B4A] flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-[#315EAA]" />
            <span>Coursework & Submissions Review</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage course problem sets, inspect student deliverables, and evaluate coursework with qualitative feedback.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-[#315EAA] hover:bg-[#254B8C] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E3E8F0] shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Published Assignments</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#142B4A]">{totalAssignmentsCount}</span>
            <span className="text-xs text-slate-400 font-medium">Active</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E3E8F0] shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Total Submissions</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#142B4A]">{totalSubmissionsCount}</span>
            <span className="text-xs text-slate-400 font-medium">Received</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E3E8F0] shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Evaluated / Graded</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-600">{gradedCount}</span>
            <span className="text-xs text-emerald-600 font-semibold">Done</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E3E8F0] shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Pending Review</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-600">{pendingCount}</span>
            <span className="text-xs text-amber-600 font-semibold">Needs Grade</span>
          </div>
        </div>
      </div>

      {/* Integrated Tab Bar & Controls */}
      <div className="bg-white rounded-2xl border border-[#E3E8F0] shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E3E8F0] px-6 pt-4 pb-0 gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSearchParams({ tab: "assignments" })}
              className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "assignments"
                  ? "border-[#315EAA] text-[#315EAA]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Assignments & Problem Sets</span>
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {assignments.length}
              </span>
            </button>

            <button
              onClick={() => setSearchParams({ tab: "submissions" })}
              className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "submissions"
                  ? "border-[#315EAA] text-[#315EAA]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Submissions & Grading Review</span>
              <span
                className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                  pendingCount > 0 ? "bg-amber-100 text-amber-800 font-bold" : "bg-slate-100 text-slate-600"
                }`}
              >
                {allSubmissions.length}
              </span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="pb-3 sm:pb-0 flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={activeTab === "assignments" ? "Search assignments..." : "Search student, roll ID..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl text-xs text-[#142B4A] w-52 sm:w-64 focus:outline-none focus:ring-1 focus:ring-[#315EAA]"
              />
            </div>

            {/* Course Filter */}
            <div className="flex items-center gap-1.5 bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-2.5 py-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                className="bg-transparent text-xs text-[#142B4A] focus:outline-none font-medium"
              >
                <option value="ALL">All Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Submissions Status Filter (Only on submissions tab) */}
            {activeTab === "submissions" && (
              <select
                value={submissionStatusFilter}
                onChange={(e) => setSubmissionStatusFilter(e.target.value)}
                className="bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-2.5 py-1.5 text-xs text-[#142B4A] focus:outline-none font-medium"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending Review</option>
                <option value="GRADED">Graded</option>
                <option value="LATE">Late</option>
              </select>
            )}
          </div>
        </div>

        {/* Tab 1: ASSIGNMENTS VIEW */}
        {activeTab === "assignments" && (
          <div className="p-6">
            {isLoading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-[#315EAA]" />
                <p className="text-sm font-medium">Loading coursework items...</p>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="p-12 text-center">
                <CheckSquare className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <h3 className="text-base font-bold text-[#142B4A]">No Assignments Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  {searchQuery
                    ? "No assignments matching your search criteria."
                    : "Create problem sets or lab assessments for your assigned classes."}
                </p>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="inline-flex items-center gap-2 bg-[#315EAA] text-white px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Assignment</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredAssignments.map((assignment) => {
                  const submissions = assignment.submissions || [];
                  const graded = submissions.filter((s) => s.status === "GRADED").length;
                  const isDuePassed = new Date() > new Date(assignment.dueDate);

                  return (
                    <div
                      key={assignment.id}
                      className="bg-white rounded-xl border border-[#E3E8F0] p-5 hover:border-[#315EAA]/50 transition-all shadow-xs space-y-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#315EAA]/10 text-[#315EAA]">
                              {assignment.course?.code || "COURSE"}
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                              {assignment.course?.name}
                            </span>
                          </div>
                          <h2 className="text-base font-bold text-[#142B4A]">{assignment.title}</h2>
                          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line line-clamp-2">
                            {assignment.description}
                          </p>
                        </div>

                        <div className="flex flex-row md:flex-col items-end gap-2 shrink-0">
                          <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              Due: {new Date(assignment.dueDate).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            {isDuePassed && (
                              <span className="text-[10px] text-amber-600 font-bold ml-1">(Past Due)</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold text-[#315EAA] px-1 py-0.5">
                            <Award className="w-3.5 h-3.5" />
                            <span>Max Marks: {assignment.maxMarks}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom action bar */}
                      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 text-slate-500">
                          <span className="flex items-center gap-1 font-medium">
                            <Users className="w-3.5 h-3.5 text-[#315EAA]" />
                            {submissions.length} Submissions
                          </span>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold">
                            {graded} Evaluated
                          </span>
                          {submissions.length - graded > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-amber-700 font-semibold">
                                {submissions.length - graded} Pending Review
                              </span>
                            </>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            setSelectedCourseFilter(assignment.course?.code || "ALL");
                            setSearchParams({ tab: "submissions" });
                          }}
                          className="flex items-center gap-1 font-semibold text-[#315EAA] hover:text-[#254B8C] transition-colors"
                        >
                          <span>Review Submissions</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: SUBMISSIONS & GRADING TABLE */}
        {activeTab === "submissions" && (
          <div className="p-6">
            {isLoading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-[#315EAA]" />
                <p className="text-sm font-medium">Loading student submissions...</p>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <h3 className="text-base font-bold text-[#142B4A]">No Submissions Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  {searchQuery || submissionStatusFilter !== "ALL" || selectedCourseFilter !== "ALL"
                    ? "No student submissions match your filter settings."
                    : "No student submissions have been recorded for your coursework yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#E3E8F0] rounded-xl bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] border-b border-[#E3E8F0] text-slate-600 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Assignment / Course</th>
                      <th className="py-3 px-4">Submitted At</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4 text-right">Evaluation Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3E8F0]">
                    {filteredSubmissions.map((item) => {
                      const { submission, assignmentTitle, courseCode, maxMarks } = item;
                      const isGraded = submission.status === "GRADED";

                      return (
                        <tr key={submission.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">
                              {submission.student?.name || "Student"}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500">
                              {submission.student?.studentId || "Roll ID Not Set"}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-medium text-[#142B4A] line-clamp-1">
                              {assignmentTitle}
                            </div>
                            <div className="text-[11px] text-[#315EAA] font-mono font-semibold">
                              {courseCode}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600">
                            {new Date(submission.submittedAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                submission.status === "GRADED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : submission.status === "LATE"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {submission.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            {isGraded && submission.marks !== null ? (
                              <div className="font-mono font-bold text-sm text-[#142B4A]">
                                {submission.marks} / {maxMarks}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Not graded</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                setGradingSubmission({
                                  submission,
                                  assignmentTitle,
                                  courseCode,
                                  maxMarks,
                                });
                                setGradeMarks(submission.marks || 0);
                                setGradeFeedback(submission.feedback || "");
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                                isGraded
                                  ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                  : "bg-[#17A89B] hover:bg-[#13887C] text-white shadow-xs"
                              }`}
                            >
                              {isGraded ? "Edit Evaluation" : "Grade & Feedback"}
                            </button>
                          </td>
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

      {/* CREATE ASSIGNMENT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E3E8F0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E8F0]">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[#315EAA]" />
                <h2 className="text-base font-bold text-[#142B4A]">Create Course Assignment</h2>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Target Course Offering
                </label>
                <select
                  value={newCourseId}
                  onChange={(e) => setNewCourseId(e.target.value)}
                  required
                  className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-sm font-medium text-[#142B4A] focus:outline-none focus:ring-1 focus:ring-[#315EAA]"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab 4: Binary Search Trees & Big-O Analysis"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-sm text-[#142B4A] focus:outline-none focus:ring-1 focus:ring-[#315EAA]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Instructions & Problem Deliverables
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="State the problem statements, required deliverables, and format expectations..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-sm text-[#142B4A] focus:outline-none focus:ring-1 focus:ring-[#315EAA]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-sm text-[#142B4A] focus:outline-none focus:ring-1 focus:ring-[#315EAA]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Maximum Marks
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={newMaxMarks}
                    onChange={(e) => setNewMaxMarks(parseInt(e.target.value, 10))}
                    className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-sm text-[#142B4A] focus:outline-none focus:ring-1 focus:ring-[#315EAA]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 bg-[#315EAA] hover:bg-[#254B8C] text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-xs"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Publish Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GRADE EVALUATION MODAL */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E3E8F0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E8F0]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#17A89B]" />
                <h2 className="text-base font-bold text-[#142B4A]">Evaluate Submission</h2>
              </div>
              <button
                onClick={() => setGradingSubmission(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800">
                  {gradingSubmission.submission.student?.name}
                </span>
                <span className="font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {gradingSubmission.submission.student?.studentId || "Roll ID Not Set"}
                </span>
              </div>
              <div className="text-slate-500 text-[11px]">
                {gradingSubmission.courseCode} · {gradingSubmission.assignmentTitle}
              </div>
              <div className="text-slate-400 text-[11px]">
                Submitted: {new Date(gradingSubmission.submission.submittedAt).toLocaleString()}
              </div>

              <div className="pt-2 text-slate-700 whitespace-pre-line border-t border-slate-200">
                <span className="font-semibold text-slate-800">Student Solution / Repository:</span>
                <p className="mt-1 bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 break-all select-all">
                  {gradingSubmission.submission.content || "No submission text provided."}
                </p>
              </div>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Marks Awarded (Max: {gradingSubmission.maxMarks})
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={gradingSubmission.maxMarks}
                  value={gradeMarks}
                  onChange={(e) => setGradeMarks(parseFloat(e.target.value))}
                  className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#142B4A] focus:outline-none focus:ring-1 focus:ring-[#17A89B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Qualitative Academic Feedback
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Well-structured algorithm. Work on boundary condition tests for empty tree inputs."
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-sm text-[#142B4A] focus:outline-none focus:ring-1 focus:ring-[#17A89B]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 bg-[#17A89B] hover:bg-[#13887C] text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-xs"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Grade & Feedback</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
