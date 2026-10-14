import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Lock,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between selection:bg-[#17A89B]/20">
      {/* Top Accreditation Strip */}
      <div className="bg-[#142B4A] text-slate-300 text-xs py-2 px-6 border-b border-[#1D3B63]">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] sm:text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#17A89B] animate-pulse" />
            <span className="font-semibold text-white">Yenepoya (Deemed to be University)</span>
            <span className="hidden sm:inline text-slate-400">· NAAC Accredited 'A+' Grade</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <span className="hidden md:inline font-mono">domain: @yenepoya.edu.in</span>
            <span className="text-[#17A89B] font-semibold">Official Academic Portal</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-[#E3E8F0]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#142B4A] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              Y
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-[#142B4A] leading-tight">YSET</h1>
                <span className="text-[10px] font-mono bg-[#315EAA]/10 text-[#315EAA] px-1.5 py-0.5 rounded font-semibold">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Yenepoya School of Technology</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-700 hover:text-[#142B4A] px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Portal Login
            </Link>
            <Link
              to="/signup"
              className="text-xs font-semibold text-white bg-[#315EAA] hover:bg-[#254B8C] px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>Student Registration</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 sm:py-20 text-center relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#17A89B]/10 border border-[#17A89B]/25 text-[#12887C] text-xs font-semibold mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Academic LMS with Context-Aware YSET AI</span>
        </div>

        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#142B4A] tracking-tight mb-6 leading-tight">
          Where Engineering Excellence Meets <br className="hidden sm:block" />
          <span className="text-[#17A89B]">Institutional AI Intelligence</span>
        </h2>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          A unified digital campus platform for students, faculty, and administrators. Manage automated course timetables, interactive coursework evaluations, verified syllabus repositories, and real-time circulars.
        </p>

        {/* Dual CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <Link
            to="/login"
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 bg-[#142B4A] hover:bg-[#0F2038] text-white text-xs sm:text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <span>Access Campus Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/signup"
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-[#CBD5E1] text-xs sm:text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <GraduationCap className="w-4 h-4 text-[#315EAA]" />
            <span>Student Sign Up</span>
          </Link>
        </div>

        {/* Quick Highlights / Trust Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 text-left">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E3E8F0] shadow-xs">
            <div className="flex items-center gap-2 text-[#315EAA] text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Campus Security</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#142B4A]">100% Verified</p>
            <p className="text-xs text-slate-500 mt-0.5">Strict @yenepoya.edu.in auth</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E3E8F0] shadow-xs">
            <div className="flex items-center gap-2 text-[#17A89B] text-xs font-bold uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4" />
              <span>Timetable</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#142B4A]">Auto-Generated</p>
            <p className="text-xs text-slate-500 mt-0.5">Algorithmic conflict-free slots</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E3E8F0] shadow-xs">
            <div className="flex items-center gap-2 text-[#D99019] text-xs font-bold uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Coursework</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#142B4A]">Instant Grading</p>
            <p className="text-xs text-slate-500 mt-0.5">Direct faculty review & feedback</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E3E8F0] shadow-xs">
            <div className="flex items-center gap-2 text-[#315EAA] text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>YSET AI Tutor</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#142B4A]">24/7 Academic</p>
            <p className="text-xs text-slate-500 mt-0.5">Grounded in verified syllabus</p>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 text-left">
          <div className="bg-white p-6 rounded-2xl border border-[#E3E8F0] shadow-xs hover:border-[#142B4A]/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#142B4A]/10 text-[#142B4A] flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#142B4A] mb-2">Institutional Scope</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Strict domain enforcement ensures students, faculty, and administrators operate in an authentic, audited academic environment with role-based access.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Admin Verified Roll ID & Credentials</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E3E8F0] shadow-xs hover:border-[#17A89B]/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#17A89B]/10 text-[#17A89B] flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#142B4A] mb-2">Grounded YSET AI Assistant</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ask questions on Computer Science and Artificial Intelligence subjects. AI answers cite uploaded course documents, lecture notes, and faculty references.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>RAG Knowledge Base & Strict Privacy</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E3E8F0] shadow-xs hover:border-[#315EAA]/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#315EAA]/10 text-[#315EAA] flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#142B4A] mb-2">Full Coursework Lifecycle</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Faculty publish assignments with rubrics and deadlines; students submit repositories and problem sets; faculty review and record evaluative feedback.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Timetable & Notice Board Broadcasts</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E3E8F0] py-8 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#142B4A] text-white flex items-center justify-center font-bold text-xs">
              Y
            </div>
            <span className="font-bold text-[#142B4A]">Yenepoya School of Technology</span>
            <span>· Academic Operations Platform</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <span>CSE / AIFT Department</span>
            <span>·</span>
            <span>Accredited NAAC A+</span>
            <span>·</span>
            <span className="font-mono">yenepoya.edu.in</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
