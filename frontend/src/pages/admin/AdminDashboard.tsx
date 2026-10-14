import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  Database,
  Calendar,
  Bell,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../../context/auth-context";

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const adminName = user?.name || "Administrator";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E3E8F0] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#142B4A] tracking-tight">
            System Administration · {adminName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#315EAA]" />
            <span>Yenepoya School of Technology · Academic Session 2026-2027</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/announcements"
            className="flex items-center gap-1.5 bg-[#F6F8FC] hover:bg-slate-200 text-[#142B4A] text-xs font-semibold px-4 py-2.5 rounded-xl border border-[#CBD5E1] transition-colors shadow-2xs"
          >
            <Bell className="w-3.5 h-3.5 text-[#D99019]" />
            <span>Post Circular</span>
          </Link>
          <Link
            to="/admin/courses"
            className="flex items-center gap-1.5 bg-[#142B4A] hover:bg-[#0F2038] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-[#17A89B]" />
            <span>Generate Timetable</span>
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/users"
          className="bg-white p-5 rounded-2xl border border-[#E3E8F0] hover:border-[#142B4A] shadow-xs flex items-center gap-4 transition-all block group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#142B4A]/10 text-[#142B4A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Registered Community</p>
            <h3 className="text-xl font-bold text-[#142B4A]">1,280 Verified</h3>
            <span className="text-[11px] text-slate-400 font-medium">@yenepoya.edu.in</span>
          </div>
        </Link>

        <Link
          to="/admin/courses"
          className="bg-white p-5 rounded-2xl border border-[#E3E8F0] hover:border-[#315EAA] shadow-xs flex items-center gap-4 transition-all block group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#315EAA]/10 text-[#315EAA] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Curriculum Courses</p>
            <h3 className="text-xl font-bold text-[#142B4A]">48 Offerings</h3>
            <span className="text-[11px] text-[#315EAA] font-medium">Auto-Timetable Active</span>
          </div>
        </Link>

        <Link
          to="/admin/knowledge-base"
          className="bg-white p-5 rounded-2xl border border-[#E3E8F0] hover:border-[#17A89B] shadow-xs flex items-center gap-4 transition-all block group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#17A89B]/10 text-[#17A89B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Institutional RAG Docs</p>
            <h3 className="text-xl font-bold text-[#142B4A]">36 Artifacts</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Vector Index Synced</span>
          </div>
        </Link>

        <div className="bg-white p-5 rounded-2xl border border-[#E3E8F0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#16845B] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Audit Compliance</p>
            <h3 className="text-xl font-bold text-[#142B4A]">100% Compliant</h3>
            <span className="text-[11px] text-emerald-700 font-medium">Zero Policy Breaches</span>
          </div>
        </div>
      </div>

      {/* Admin Operations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Course Visibility & Auto-Timetable Generation */}
        <Link
          to="/admin/courses"
          className="bg-gradient-to-br from-white to-[#F0FDFA] p-6 rounded-2xl border-2 border-[#17A89B]/40 hover:border-[#17A89B] shadow-xs transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#17A89B]/15 text-[#17A89B] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase bg-[#17A89B]/15 text-[#17A89B] px-2 py-0.5 rounded-full">
                Core Feature
              </span>
            </div>
            <h3 className="text-base font-bold text-[#142B4A]">Course Visibility & Auto-Timetable</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Control student course visibility toggles and trigger conflict-free algorithmic weekly timetable generation with 1 click.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#17A89B]/20 flex items-center justify-between text-xs font-semibold text-[#12887C]">
            <span>Manage Timetable</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Notices & Circulars */}
        <Link
          to="/admin/announcements"
          className="bg-white p-6 rounded-2xl border border-[#E3E8F0] hover:border-[#D99019] shadow-xs transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#D99019]/15 text-[#D99019] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Bell className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase bg-[#D99019]/15 text-[#D99019] px-2 py-0.5 rounded-full">
                Broadcast
              </span>
            </div>
            <h3 className="text-base font-bold text-[#142B4A]">Campus Circulars & Notices</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Publish university bulletins, examination dates, and departmental announcements with pin-to-top highlights.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#D99019]">
            <span>Broadcast Circular</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* AI & Knowledge Base RAG */}
        <Link
          to="/admin/knowledge-base"
          className="bg-white p-6 rounded-2xl border border-[#E3E8F0] hover:border-[#315EAA] shadow-xs transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#315EAA]/15 text-[#315EAA] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase bg-[#315EAA]/15 text-[#315EAA] px-2 py-0.5 rounded-full">
                RAG Engine
              </span>
            </div>
            <h3 className="text-base font-bold text-[#142B4A]">Institutional Knowledge Base</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Upload institutional handbooks, syllabus regulations, and policy guides for AI retrieval grounding.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#315EAA]">
            <span>Manage Knowledge Base</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
};
