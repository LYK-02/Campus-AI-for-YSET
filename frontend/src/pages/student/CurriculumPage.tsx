import React, { useState, useEffect } from "react";
import { ExternalLink, Award, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { branches } from "../../data/branches";
import { coursesApi } from "../../lib/api-client";
import type { Course } from "../../types";

export const CurriculumPage: React.FC = () => {
  const [selectedBranchId, setSelectedBranchId] = useState<string>("cse-aift");
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [publishedCourses, setPublishedCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const currentBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];
  const semesterData = currentBranch.semesters.find((s) => s.semester === selectedSemester);
  const fallbackSubjects = semesterData?.subjects || [];

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    coursesApi
      .getCourses(selectedBranchId, selectedSemester)
      .then((data) => {
        if (isMounted) {
          setPublishedCourses(data || []);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPublishedCourses([]);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedBranchId, selectedSemester]);

  // Use published courses if available, otherwise fallback
  const displaySubjects = publishedCourses.length > 0
    ? publishedCourses.map((c) => ({ code: c.code, name: c.name, credits: c.credits }))
    : fallbackSubjects.map((s, idx) => ({ code: `CSE-${selectedSemester}0${idx + 1}`, name: s.name, credits: s.credits }));

  const totalSemesterCredits = displaySubjects.reduce((sum, s) => sum + s.credits, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E3E8F0] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#315EAA] bg-[#315EAA]/10 px-2.5 py-0.5 rounded-full mb-2">
            Academic Curriculum
          </span>
          <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
            YSET Syllabus & Credit Sheets
          </h1>
          <p className="text-xs text-[#68758A] mt-1">
            Explore approved course schemes, subjects, and official credit distributions for Yenepoya School of Technology.
          </p>
        </div>

        <a
          href={currentBranch.creditSheetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#142B4A] hover:bg-[#0F2038] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-xs"
        >
          <FileText className="w-4 h-4 text-[#17A89B]" />
          <span>Official Credit Sheet (PDF)</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>

      {/* Branch Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {branches.map((branch) => {
          const isSelected = branch.id === selectedBranchId;
          return (
            <button
              key={branch.id}
              onClick={() => {
                setSelectedBranchId(branch.id);
                setSelectedSemester(1);
              }}
              className={`p-4 rounded-xl text-left border transition-all ${
                isSelected
                  ? "bg-[#142B4A] text-white border-[#142B4A] shadow-xs"
                  : "bg-white text-[#172033] border-[#E3E8F0] hover:border-[#315EAA]/40"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                    isSelected ? "bg-white/15 text-[#17A89B]" : "bg-slate-100 text-[#142B4A]"
                  }`}
                >
                  {branch.shortName}
                </span>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-[#17A89B]" />}
              </div>
              <h3 className="text-xs font-semibold leading-snug line-clamp-2">
                {branch.name}
              </h3>
            </button>
          );
        })}
      </div>

      {/* Semester Selector & Info Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E3E8F0] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E3E8F0] gap-4">
          <div>
            <h2 className="text-base font-bold text-[#172033]">
              {currentBranch.name}
            </h2>
            <p className="text-xs text-[#68758A] mt-0.5">
              Select semester to view syllabus breakdown and credit weightage
            </p>
          </div>

          <div className="inline-flex items-center gap-2 bg-[#17A89B]/10 text-[#17A89B] border border-[#17A89B]/20 px-3 py-1.5 rounded-xl text-xs font-bold">
            <Award className="w-4 h-4" />
            <span>Semester {selectedSemester} Total: {totalSemesterCredits} Credits</span>
          </div>
        </div>

        {/* Semester Buttons (1 to 8) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {currentBranch.semesters.map((sem) => {
            const isCurrent = sem.semester === selectedSemester;
            return (
              <button
                key={sem.semester}
                onClick={() => setSelectedSemester(sem.semester)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isCurrent
                    ? "bg-[#315EAA] text-white shadow-xs"
                    : "bg-slate-100 text-[#172033] hover:bg-slate-200"
                }`}
              >
                Semester {sem.semester}
              </button>
            );
          })}
        </div>

        {/* Subjects Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-[#68758A] font-semibold border-y border-[#E3E8F0]">
                <th className="py-3 px-4 w-12">#</th>
                <th className="py-3 px-4">Subject Title</th>
                <th className="py-3 px-4 w-28 text-center">Credits</th>
                <th className="py-3 px-4 w-32 text-right">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8F0]">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin text-[#315EAA] mx-auto mb-2" />
                    <span>Loading verified curriculum courses...</span>
                  </td>
                </tr>
              ) : (
                displaySubjects.map((sub, index) => (
                  <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-400">{index + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#315EAA]/10 text-[#315EAA]">
                          {sub.code}
                        </span>
                        <span className="font-semibold text-[#172033] text-sm">
                          {sub.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-[#315EAA]/10 text-[#315EAA] font-bold font-mono">
                        {sub.credits} {sub.credits === 1 ? "Credit" : "Credits"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-[11px] text-slate-500 font-medium">
                        {sub.credits >= 4 ? "Core Course" : sub.credits === 1 ? "Lab / Skill" : "Departmental"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
