import React, { useState, useEffect } from "react";
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
  MessageSquare,
} from "lucide-react";
import { assignmentsApi, coursesApi } from "../../lib/api-client";
import type { Assignment, Course, Submission } from "../../types";

export const FacultyAssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [gradingSubmission, setGradingSubmission] = useState<{
    submission: Submission;
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
      showToast("error", err.message || "Failed to load assignments");
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
      showToast("error", "Please fill in all required fields.");
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

      showToast("success", "Assignment created and published to students!");
      setIsCreateOpen(false);
      setNewTitle("");
      setNewDescription("");
      setNewDueDate("");
      await loadData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to create assignment");
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

      showToast("success", "Grade and evaluation feedback recorded!");
      setGradingSubmission(null);
      await loadData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to submit evaluation");
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E3E8F0] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#315EAA] mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>Academic Assessment & Coursework</span>
          </div>
          <h1 className="text-2xl font-bold text-[#142B4A]">
            Assignments & Submissions
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Create coursework briefs, inspect enrolled student submissions, and award grades with direct feedback.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-[#315EAA] hover:bg-[#254B8C] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Assignment</span>
        </button>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-[#E3E8F0] p-16 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#315EAA]" />
          <p className="text-sm font-medium">Loading coursework & submissions...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E3E8F0] p-16 text-center">
          <CheckSquare className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-[#142B4A]">No Assignments Created Yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            Get started by creating your first course assignment or lab problem set for students.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 bg-[#315EAA] text-white px-4 py-2.5 rounded-xl text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const submissions = assignment.submissions || [];
            const gradedCount = submissions.filter((s) => s.status === "GRADED").length;
            const isDuePassed = new Date() > new Date(assignment.dueDate);

            return (
              <div
                key={assignment.id}
                className="bg-white rounded-2xl border border-[#E3E8F0] p-6 shadow-xs space-y-4"
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
                    <h2 className="text-lg font-bold text-[#142B4A]">{assignment.title}</h2>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {assignment.description}
                    </p>
                  </div>

                  <div className="flex flex-row md:flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700">
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
                    <div className="flex items-center gap-1 text-xs font-bold text-[#315EAA] px-2 py-1">
                      <Award className="w-4 h-4" />
                      <span>Max Marks: {assignment.maxMarks}</span>
                    </div>
                  </div>
                </div>

                {/* Submissions Section */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <FileText className="w-4 h-4 text-[#315EAA]" />
                      <span>Student Submissions ({submissions.length})</span>
                      <span className="text-slate-400 font-normal">
                        ({gradedCount} of {submissions.length} Graded)
                      </span>
                    </div>
                  </div>

                  {submissions.length === 0 ? (
                    <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                      No student has submitted work for this assessment yet.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden bg-slate-50/50">
                      {submissions.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/80 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-[#142B4A]">
                                {sub.student?.name || "Enrolled Student"}
                              </span>
                              {sub.student?.studentId && (
                                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                  {sub.student.studentId}
                                </span>
                              )}
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                  sub.status === "GRADED"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : sub.status === "LATE"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {sub.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-1">{sub.content}</p>
                            {sub.feedback && (
                              <p className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                                <MessageSquare className="w-3 h-3" />
                                <span>Feedback: "{sub.feedback}"</span>
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                            {sub.marks !== null && sub.marks !== undefined && (
                              <span className="font-mono font-bold text-sm text-[#142B4A]">
                                {sub.marks} / {assignment.maxMarks}
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setGradingSubmission({ submission: sub, maxMarks: assignment.maxMarks });
                                setGradeMarks(sub.marks || 0);
                                setGradeFeedback(sub.feedback || "");
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#17A89B]/10 hover:bg-[#17A89B]/20 text-[#12887C] transition-colors cursor-pointer"
                            >
                              {sub.status === "GRADED" ? "Edit Evaluation" : "Grade & Feedback"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E3E8F0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E8F0]">
              <h2 className="text-base font-bold text-[#142B4A]">Create Course Assignment</h2>
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
                  Target Course
                </label>
                <select
                  value={newCourseId}
                  onChange={(e) => setNewCourseId(e.target.value)}
                  required
                  className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-sm font-medium text-[#142B4A]"
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
                  className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-sm text-[#142B4A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Instructions & Description
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="State the problem statements, required deliverables, and format expectations..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-sm text-[#142B4A]"
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
                    className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-sm text-[#142B4A]"
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
                    className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-sm text-[#142B4A]"
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
              <h2 className="text-base font-bold text-[#142B4A]">Evaluate Submission</h2>
              <button
                onClick={() => setGradingSubmission(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1 text-xs">
              <p className="font-semibold text-slate-700">
                Student: {gradingSubmission.submission.student?.name}
              </p>
              <p className="text-slate-500">
                Submitted on: {new Date(gradingSubmission.submission.submittedAt).toLocaleString()}
              </p>
              <div className="pt-2 text-slate-700 whitespace-pre-line border-t border-slate-200">
                <span className="font-semibold">Student Answer / Notes:</span>
                <p className="mt-0.5">{gradingSubmission.submission.content || "No text comments provided."}</p>
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
                  className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#142B4A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Academic Feedback & Recommendations
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Well-structured algorithm. Work on boundary condition tests for empty tree inputs."
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-sm text-[#142B4A]"
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
