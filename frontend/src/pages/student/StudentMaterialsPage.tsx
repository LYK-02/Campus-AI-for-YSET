import React, { useState, useEffect } from "react";
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileDown,
} from "lucide-react";
import { materialsApi } from "../../lib/api-client";
import type { Material } from "../../types";

export const StudentMaterialsPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("ALL");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToast(type === "success" ? { type: "success", text } : { type: "error", text });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await materialsApi.getMaterials();
      setMaterials(data || []);
    } catch (err: any) {
      showToast("error", err?.message || "Failed to load learning resources");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownload = async (mat: Material) => {
    setDownloadingId(mat.id);
    try {
      await materialsApi.downloadMaterial(mat.id, mat.originalFilename);
      showToast("success", `Downloaded ${mat.originalFilename}`);
    } catch (err: any) {
      showToast("error", err?.message || "Failed to download PDF resource.");
    } finally {
      setDownloadingId(null);
    }
  };

  const uniqueCourseCodes = Array.from(
    new Set(materials.map((m) => m.course?.code).filter(Boolean))
  ) as string[];

  const filteredMaterials =
    selectedCourseFilter === "ALL"
      ? materials
      : materials.filter((m) => m.course?.code === selectedCourseFilter);

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
            <span>Academic Handouts & Digital Library</span>
          </div>
          <h1 className="text-2xl font-bold text-[#142B4A]">
            Learning Materials & Lecture Notes
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Access verified lecture presentations, problem sheets, and lab manuals provided by YSET faculty.
          </p>
        </div>
      </div>

      {/* Course Filter Pills */}
      {uniqueCourseCodes.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCourseFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCourseFilter === "ALL"
                ? "bg-[#142B4A] text-white shadow-xs"
                : "bg-white border border-[#E3E8F0] text-slate-600 hover:bg-slate-50"
            }`}
          >
            All Courses ({materials.length})
          </button>
          {uniqueCourseCodes.map((code) => (
            <button
              key={code}
              onClick={() => setSelectedCourseFilter(code)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCourseFilter === code
                  ? "bg-[#315EAA] text-white shadow-xs"
                  : "bg-white border border-[#E3E8F0] text-slate-600 hover:bg-slate-50"
              }`}
            >
              {code}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-[#E3E8F0] p-16 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#315EAA]" />
          <p className="text-sm font-medium">Loading course materials...</p>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E3E8F0] p-16 text-center">
          <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-[#142B4A]">No Materials Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
            Course lecture materials and PDFs uploaded by your faculty members will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMaterials.map((mat) => (
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
                <p className="text-xs text-slate-600 line-clamp-2">{mat.description || "Lecture document."}</p>
                <p className="text-[11px] font-mono text-slate-400 truncate flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{mat.originalFilename}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {mat.owner?.name ? `By ${mat.owner.name}` : "Faculty Upload"}
                </span>
                <button
                  onClick={() => handleDownload(mat)}
                  disabled={downloadingId === mat.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#17A89B]/10 hover:bg-[#17A89B]/20 text-[#12887C] transition-colors cursor-pointer"
                >
                  {downloadingId === mat.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileDown className="w-3.5 h-3.5" />
                  )}
                  <span>{downloadingId === mat.id ? "Downloading..." : "Download PDF"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
