import React, { useState, useEffect } from "react";
import {
  Bell,
  Plus,
  Pin,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Megaphone,
} from "lucide-react";
import { announcementsApi, coursesApi } from "../lib/api-client";
import { useAuth } from "../context/auth-context";
import type { Announcement, Course } from "../types";

export const AnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPostOpen, setIsPostOpen] = useState<boolean>(false);

  // Form states
  const [newTitle, setNewTitle] = useState<string>("");
  const [newContent, setNewContent] = useState<string>("");
  const [newCourseId, setNewCourseId] = useState<string>("");
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const roles = user?.roles || [];
  const canPost = roles.includes("FACULTY") || roles.includes("ADMIN");

  const showToast = (type: "success" | "error", text: string) => {
    setToast(type === "success" ? { type: "success", text } : { type: "error", text });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [annData, coursesData] = await Promise.all([
        announcementsApi.getAnnouncements(),
        canPost ? coursesApi.getCourses("cse-aift", 1) : Promise.resolve([]),
      ]);
      setAnnouncements(annData || []);
      setCourses(coursesData || []);
    } catch (err: any) {
      showToast("error", err.message || "Failed to load announcements");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      showToast("error", "Please provide title and content.");
      return;
    }

    setIsSubmitting(true);
    try {
      await announcementsApi.createAnnouncement({
        title: newTitle,
        content: newContent,
        courseId: newCourseId || undefined,
        isPinned,
      });

      showToast("success", "Announcement published successfully!");
      setIsPostOpen(false);
      setNewTitle("");
      setNewContent("");
      setNewCourseId("");
      setIsPinned(false);
      await loadData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to post announcement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await announcementsApi.deleteAnnouncement(id);
      showToast("success", "Announcement removed.");
      await loadData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete announcement");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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
            <Bell className="w-4 h-4" />
            <span>Campus Communication & Notices</span>
          </div>
          <h1 className="text-2xl font-bold text-[#142B4A]">
            Announcements & Circulars
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Stay informed with verified institutional circulars, exam dates, and course-specific notifications.
          </p>
        </div>

        {canPost && (
          <button
            onClick={() => setIsPostOpen(true)}
            className="flex items-center gap-2 bg-[#315EAA] hover:bg-[#254B8C] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Post Announcement</span>
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-[#E3E8F0] p-16 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#315EAA]" />
          <p className="text-sm font-medium">Loading circulars and notices...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E3E8F0] p-16 text-center">
          <Megaphone className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-[#142B4A]">No Announcements Posted Yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
            University circulars and departmental notifications will be broadcast here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`rounded-2xl border p-5 shadow-xs transition-all ${
                ann.isPinned
                  ? "bg-gradient-to-r from-amber-50/50 to-white border-amber-300/80 ring-1 ring-amber-300/30"
                  : "bg-white border-[#E3E8F0] hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    {ann.isPinned && (
                      <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                        <Pin className="w-3 h-3 fill-white" />
                        Pinned Notice
                      </span>
                    )}
                    {ann.course ? (
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#315EAA]/10 text-[#315EAA]">
                        {ann.course.code}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        Campus-Wide
                      </span>
                    )}
                  </div>

                  <h2 className="text-base font-bold text-[#142B4A]">{ann.title}</h2>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {ann.content}
                  </p>
                </div>

                {canPost && (
                  <button
                    onClick={() => handleDelete(ann.id, ann.title)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Posted by <span className="font-medium text-slate-600">{ann.creator?.name || "Administration"}</span>
                </span>
                <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POST ANNOUNCEMENT MODAL */}
      {isPostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E3E8F0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E8F0]">
              <h2 className="text-base font-bold text-[#142B4A]">Post Campus Notice</h2>
              <button
                onClick={() => setIsPostOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Scope / Course (Optional)
                </label>
                <select
                  value={newCourseId}
                  onChange={(e) => setNewCourseId(e.target.value)}
                  className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-sm text-[#142B4A]"
                >
                  <option value="">Institution-Wide Notice (All Students & Faculty)</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      Course: {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Notice Headline
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule Update: Computer Networks Midterm Lab"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-sm text-[#142B4A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Announcement Details
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide circular details, reporting venues, or requirements..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-sm text-[#142B4A]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinNotice"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-[#315EAA] focus:ring-[#315EAA]"
                />
                <label htmlFor="pinNotice" className="text-xs font-medium text-slate-700">
                  Pin this circular to the top of notice boards
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPostOpen(false)}
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
                  <span>Publish Circular</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
