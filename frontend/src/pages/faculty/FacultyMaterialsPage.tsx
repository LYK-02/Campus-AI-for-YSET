import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  UploadCloud,
  Download,
  FileCheck,
} from "lucide-react";
import { materialsApi, coursesApi } from "../../lib/api-client";
import type { Material, Course } from "../../types";

export const FacultyMaterialsPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  // File Upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Form states
  const [newCourseId, setNewCourseId] = useState<string>("");
  const [newTitle, setNewTitle] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");
  const [newFilename, setNewFilename] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
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
      showToast("error", err?.message || "Failed to load course materials");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProcessFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      showToast("error", "Only PDF documents (.pdf) are supported for course materials.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      showToast("error", "File size exceeds the 25MB upload limit.");
      return;
    }

    setSelectedFile(file);
    setNewFilename(file.name);

    if (!newTitle) {
      const cleanName = file.name
        .replace(/\.pdf$/i, "")
        .replace(/[_-]/g, " ")
        .trim();
      setNewTitle(cleanName);
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.onerror = () => {
      showToast("error", "Failed to read file from disk.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const resetUploadModal = () => {
    setIsUploadOpen(false);
    setSelectedFile(null);
    setFileBase64("");
    setNewTitle("");
    setNewDescription("");
    setNewFilename("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast("error", "Please provide a document title.");
      return;
    }

    if (!selectedFile && !newFilename.trim()) {
      showToast("error", "Please select or attach a PDF file to upload.");
      return;
    }

    setIsSubmitting(true);
    try {
      const finalFilename = selectedFile
        ? selectedFile.name
        : newFilename.endsWith(".pdf")
        ? newFilename
        : `${newFilename}.pdf`;

      await materialsApi.createMaterial({
        courseId: newCourseId || undefined,
        title: newTitle,
        description: newDescription,
        originalFilename: finalFilename,
        mimeType: "application/pdf",
        sizeBytes: selectedFile ? selectedFile.size : 1024 * 1024 * 2,
        fileBase64: fileBase64 || undefined,
      });

      showToast("success", "PDF course material uploaded and published!");
      resetUploadModal();
      await loadData();
    } catch (err: any) {
      showToast("error", err?.message || "Failed to upload PDF material.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async (mat: Material) => {
    setDownloadingId(mat.id);
    try {
      await materialsApi.downloadMaterial(mat.id, mat.originalFilename);
      showToast("success", `Downloaded ${mat.originalFilename}`);
    } catch (err: any) {
      showToast("error", err?.message || "Failed to download PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await materialsApi.deleteMaterial(id);
      showToast("success", "Material removed.");
      await loadData();
    } catch (err: any) {
      showToast("error", err?.message || "Failed to delete material.");
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
            <span>Courseware Repository & Digital Handouts</span>
          </div>
          <h1 className="text-2xl font-bold text-[#142B4A]">
            Learning Materials & Lecture Notes
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Upload PDF lecture handouts, problem sets, and lab manuals for enrolled students.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 bg-[#315EAA] hover:bg-[#254B8C] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload PDF Resource</span>
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
            className="inline-flex items-center gap-2 bg-[#315EAA] text-white px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
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
                <p className="text-xs text-slate-600 line-clamp-2">
                  {mat.description || "Course lecture notes."}
                </p>
                <p className="text-[11px] font-mono text-slate-400 truncate flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{mat.originalFilename}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Uploaded: {new Date(mat.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(mat)}
                    disabled={downloadingId === mat.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    title="Download PDF"
                  >
                    {downloadingId === mat.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => handleDelete(mat.id, mat.title)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete material"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD PDF MODAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E3E8F0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E8F0]">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#17A89B]" />
                <h2 className="text-base font-bold text-[#142B4A]">Upload Course Material (PDF)</h2>
              </div>
              <button
                onClick={resetUploadModal}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Drag and Drop Zone */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Select PDF Document
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,application/pdf"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 truncate">{selectedFile.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready to upload
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setFileBase64("");
                        setNewFilename("");
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-[#17A89B] bg-[#17A89B]/10"
                        : "border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#315EAA]/60 hover:bg-slate-100/50"
                    }`}
                  >
                    <UploadCloud className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <p className="text-xs font-bold text-[#142B4A]">
                      Click to browse or drag and drop your PDF here
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Supports Adobe PDF format (.pdf) up to 25MB
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Target Course Offering
                </label>
                <select
                  value={newCourseId}
                  onChange={(e) => setNewCourseId(e.target.value)}
                  className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-sm text-[#142B4A] focus:outline-none focus:ring-1 focus:ring-[#315EAA]"
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
                  className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-sm text-[#142B4A] focus:outline-none focus:ring-1 focus:ring-[#315EAA]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Summary / Overview Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe topics, page readings, or formulas included in this document..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-sm text-[#142B4A] focus:outline-none focus:ring-1 focus:ring-[#315EAA]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetUploadModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 bg-[#17A89B] hover:bg-[#13887C] text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UploadCloud className="w-3.5 h-3.5" />
                  )}
                  <span>{isSubmitting ? "Uploading PDF..." : "Publish PDF"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
