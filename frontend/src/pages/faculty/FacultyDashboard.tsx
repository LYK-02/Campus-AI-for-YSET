import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckSquare, FileText, Sparkles, Upload, Plus } from "lucide-react";
import { useAuth } from "../../context/auth-context";

export const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const facultyName = user?.name || "Faculty Member";

  const [activeCount, setActiveCount] = useState<number>(2);
  const [submissionsCount, setSubmissionsCount] = useState<number>(1);

  useEffect(() => {
    assignmentsApi.getAssignments()
      .then((data) => {
        if (data) {
          setActiveCount(data.length);
          const totalSubs = data.reduce((sum, a) => sum + (a.submissions?.length || 0), 0);
          setSubmissionsCount(totalSubs);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E3E8F0] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#17A89B]/10 text-[#17A89B] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Faculty Workspace · YSET</span>
          </div>
          <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
            Welcome, {facultyName}
          </h1>
          <p className="text-xs text-[#68758A] mt-1">
            Department of Computer Science & Engineering · Yenepoya School of Technology
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/faculty/materials"
            className="flex items-center gap-1.5 bg-[#142B4A] hover:bg-[#0F2038] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Material</span>
          </Link>
          <Link
            to="/faculty/assignments"
            className="flex items-center gap-1.5 bg-[#315EAA] hover:bg-[#254B8C] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Assignment</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/faculty/courses"
          className="bg-white p-5 rounded-2xl border border-[#E3E8F0] hover:border-[#142B4A] shadow-xs flex items-center gap-4 transition-all block"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#142B4A]/10 text-[#142B4A] flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-[#68758A] font-medium">Assigned Courses</p>
              <h3 className="text-xl font-bold text-[#172033]">2 Offerings</h3>
            </div>
          </div>
        </Link>

        <Link
          to="/faculty/assignments"
          className="bg-white p-5 rounded-2xl border border-[#E3E8F0] hover:border-[#315EAA] shadow-xs flex items-center gap-4 transition-all block"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#315EAA]/10 text-[#315EAA] flex items-center justify-center shrink-0">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-[#68758A] font-medium">Coursework & Tasks</p>
              <h3 className="text-xl font-bold text-[#172033]">{activeCount} Active</h3>
            </div>
          </div>
        </Link>

        <Link
          to="/faculty/assignments"
          className="bg-white p-5 rounded-2xl border border-[#E3E8F0] hover:border-[#D99019] shadow-xs flex items-center gap-4 transition-all block"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#D99019]/10 text-[#D99019] flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-[#68758A] font-medium">Student Submissions</p>
              <h3 className="text-xl font-bold text-[#172033]">{submissionsCount} Received</h3>
            </div>
          </div>
        </Link>

        <div className="bg-white p-5 rounded-2xl border border-[#E3E8F0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#17A89B]/10 text-[#17A89B] flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#68758A] font-medium">AI Assistance</p>
            <h3 className="text-xl font-bold text-[#17A89B]">Active</h3>
          </div>
        </div>
      </div>

      {/* Courses Table / List */}
      <div className="bg-white p-6 rounded-2xl border border-[#E3E8F0] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E3E8F0]">
          <div>
            <h2 className="text-base font-bold text-[#172033]">Assigned Curriculum Courses</h2>
            <p className="text-xs text-[#68758A] mt-0.5">Faculty teaching duties for academic year 2026-2027</p>
          </div>
          <Link to="/faculty/courses" className="text-xs font-semibold text-[#315EAA] hover:underline">
            View All Syllabus →
          </Link>
        </div>

        <div className="divide-y divide-[#E3E8F0]">
          {[
            {
              code: "CSE-101",
              name: "Computational Mathematics – I",
              dept: "Computer Science & Engineering",
              credits: 4,
            },
            {
              code: "CSE-103",
              name: "Problem Solving using Programming",
              dept: "Computer Science & Engineering",
              credits: 4,
            },
          ].map((c) => (
            <div key={c.code} className="py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#315EAA] bg-[#315EAA]/10 px-2 py-0.5 rounded">
                    {c.code}
                  </span>
                  <h4 className="text-sm font-semibold text-[#172033]">{c.name}</h4>
                </div>
                <p className="text-xs text-[#68758A] mt-1">
                  {c.dept} · {c.credits} Credits Weight
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/faculty/assignments"
                  className="text-xs font-semibold text-[#315EAA] hover:bg-[#315EAA]/10 px-3 py-1.5 rounded-lg transition-colors border border-[#315EAA]/20"
                >
                  Manage Coursework
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
