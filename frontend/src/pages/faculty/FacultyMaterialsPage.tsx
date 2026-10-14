import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Download,
  BookOpen,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  UploadCloud,
} from "lucide-react";
import { materialsApi, coursesApi } from "../../lib/api-client";
import type { Material, Course } from "../../types";

export const FacultyMaterialsPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  // Form states
  const [newCourseId, setNewCourseId] = useState<string>("");
  const [newTitle, setNewTitle] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");
  const [newFilename, setNewFilename] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [materialsData, coursesData] = await Promise.all([
        materialsApi.getMaterials(),
        coursesApi.getCourses("cse-aift", 1),
      ]);
      setMaterials(materialsData || []);
      setCourses(coursesData || []);
      if (coursesData && coursesData.length > 0 && !newCourseId) {
        setNewCourseId(coursesData[0].id);
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to load materials");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newFilename) {
      showToast("error", "Please provide a title and filename.");
      return;
    }

    setIsSubmitting(true);
    try {
      await materialsApi.createMaterial({
        courseId: newCourseId || undefined,
        title: newTitle,
        description: newDescription,
        originalFilename: newFilename.endsWith(".pdf") ? newFilename : `${newFilename}.pdf`,
        sizeBytes: 1024 * 1024 * 2, // ~2 MB
      });

      showToast("success", "Learning resource published to students!");
      setIsUploadOpen(false);
      setNewTitle("");
      setNewDescription("");
      setNewFilename("");
      await loadData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to upload material");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await materialsApi.deleteMaterial(id);
      showToast("success", "Material removed.");
      await loadData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete material");
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
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#315EAA] mb-1">
            <FileText className="w-4 h-4" />
            <span>Courseware Repository & Handouts</span>
          </div>
          <h1 className="text-2xl font-bold text-[#142B4A]">
            Learning Materials
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Upload lecture notes, laboratory rubrics, and recommended reading materials for enrolled students.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 bg-[#315EAA] hover:bg-[#254B8C] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Resource</span>
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-[#E3E8F0] p-16 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#315EAA]" />
          <p className="text-sm font-medium">Loading course materials...</p>
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E3E8F0] p-16 text-center">
          <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-[#142B4A]">No Materials Uploaded Yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            Upload course handbooks, presentation slides, or lab manuals to support student learning.
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-2 bg-[#315EAA] text-white px-4 py-2.5 rounded-xl text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.map((mat) => (
            <div
              key={mat.id}
              className="bg-white rounded-2xl border border-[#E3E8F0] p-5 shadow-xs flex flex-col justify-between gap-4 hover:border-[#315EAA]/40 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#315EAA]/10 text-[#315EAA]">
                    {mat.course?.code || "GENERAL"}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {(mat.sizeBytes / (1024 * 1024)).toFixed(1)} MB · PDF
                  </span>
                </div>
                <h2 className="text-base font-bold text-[#142B4A] leading-snug">{mat.title}</h2>
                <p className="text-xs text-slate-600 line-clamp-2">{mat.description || "Course lecture notes."}</p>
                <p className="text-[11px] font-mono text-slate-400 truncate">
                  📄 {mat.originalFilename}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Uploaded: {new Date(mat.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDelete(mat.id, mat.title)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete material"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E3E8F0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E8F0]">
              <h2 className="text-base font-bold text-[#142B4A]">Upload Course Material</h2>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Associated Course
                </label>
                <select
                  value={newCourseId}
                  onChange={(e) => setNewCourseId(e.target.value)}
                  className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-sm text-[#142B4A]"
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
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 2: Linear Vector Spaces & Matrix Decomposition"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-sm text-[#142B4A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  File Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. YSET_CSE101_Lecture2_Handout.pdf"
                  value={newFilename}
                  onChange={(e) => setNewFilename(e.target.value)}
                  className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-sm font-mono text-[#142B4A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Summary / Overview Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe topics, page readings, or formulas included in this document..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-sm text-[#142B4A]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
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
                    <UploadCloud className="w-3.5 h-3.5" />
                  )}
                  <span>{isSubmitting ? "Uploading..." : "Publish Document"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
