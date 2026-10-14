import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Clock,
  Award,
  AlertCircle,
  CheckCircle2,
  Send,
  Loader2,
  X,
  MessageSquare,
  FileCheck2,
} from "lucide-react";
import { assignmentsApi } from "../../lib/api-client";
import type { Assignment, Submission } from "../../types";

export const StudentAssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToast(type === "success" ? { type: "success", text } : { type: "error", text });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await assignmentsApi.getAssignments();
      setAssignments(data || []);
    } catch (err: any) {
      showToast("error", err.message || "Failed to load assignments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment || !submissionContent.trim()) {
      showToast("error", "Please provide your solution or submission notes.");
      return;
    }

    setIsSubmitting(true);
    try {
      await assignmentsApi.submitAssignment(submittingAssignment.id, {
        content: submissionContent,
      });

      showToast("success", "Your coursework solution has been submitted!");
      setSubmittingAssignment(null);
      setSubmissionContent("");
      await loadData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to submit assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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
          <h1 className="text-2xl font-bold text-[#142B4A] flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-[#315EAA]" />
            <span>My Assignments</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View course deliverables, track submission deadlines, and review evaluated marks and faculty feedback.
          </p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-[#E3E8F0] p-16 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#315EAA]" />
          <p className="text-sm font-medium">Loading your assignments...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E3E8F0] p-16 text-center">
          <CheckSquare className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-[#142B4A]">No Assignments Assigned Yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
            You are all caught up! New problem sets and coursework deadlines will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const studentSubmission: Submission | undefined = assignment.submissions?.[0];
            const isSubmitted = !!studentSubmission;
            const isGraded = studentSubmission?.status === "GRADED";
            const dueDate = new Date(assignment.dueDate);
            const isPastDue = new Date() > dueDate;

            return (
              <div
                key={assignment.id}
                className="bg-white rounded-2xl border border-[#E3E8F0] p-6 shadow-xs space-y-4 hover:border-[#315EAA]/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
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

                  <div className="flex flex-row sm:flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Due: {dueDate.toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {isPastDue && !isSubmitted && (
                        <span className="text-[10px] text-amber-600 font-bold ml-1">(Past Due)</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-[#315EAA]">
                      Max Marks: {assignment.maxMarks}
                    </span>
                  </div>
                </div>

                {/* Status & Submission Banner */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {isGraded ? (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-lg">
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span>Score: {studentSubmission.marks} / {assignment.maxMarks}</span>
                      </span>
                    ) : isSubmitted ? (
                      <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-lg">
                        <FileCheck2 className="w-4 h-4 text-blue-600" />
                        <span>Submitted · Awaiting Review</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-3 py-1 rounded-lg">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Pending Submission</span>
                      </span>
                    )}

                    {studentSubmission?.submittedAt && (
                      <span className="text-xs text-slate-400">
                        Submitted {new Date(studentSubmission.submittedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSubmittingAssignment(assignment);
                      setSubmissionContent(studentSubmission?.content || "");
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSubmitted
                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        : "bg-[#315EAA] hover:bg-[#254B8C] text-white shadow-xs"
                    }`}
                  >
                    {isSubmitted ? "Update Submission" : "Submit Solution"}
                  </button>
                </div>

                {/* Graded Feedback Box */}
                {isGraded && studentSubmission.feedback && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1">
                    <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Faculty Feedback:</span>
                    </p>
                    <p className="text-emerald-800 italic">"{studentSubmission.feedback}"</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SUBMIT WORK MODAL */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E3E8F0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E8F0]">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#315EAA] bg-[#315EAA]/10 px-2 py-0.5 rounded">
                  {submittingAssignment.course?.code}
                </span>
                <h2 className="text-base font-bold text-[#142B4A] mt-1">
                  Submit: {submittingAssignment.title}
                </h2>
              </div>
              <button
                onClick={() => setSubmittingAssignment(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitWork} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Solution Text / LaTeX / Repository Link
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Paste your solution write-up, derivation steps, or link to your code repository..."
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-sm text-[#142B4A] focus:outline-none focus:ring-2 focus:ring-[#315EAA]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSubmittingAssignment(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 bg-[#17A89B] hover:bg-[#13887C] text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-xs"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{isSubmitting ? "Submitting..." : "Submit Coursework"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
