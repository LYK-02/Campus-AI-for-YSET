import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, BookOpen, GraduationCap } from "lucide-react";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F6F8FC] flex flex-col justify-between">
      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#142B4A] flex items-center justify-center font-bold text-white text-lg shadow-sm">
            Y
          </div>
          <div>
            <h1 className="font-bold text-lg text-[#142B4A] leading-tight">YSET</h1>
            <p className="text-xs text-[#68758A]">Yenepoya School of Technology</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-semibold text-[#142B4A] hover:text-[#315EAA] px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="text-sm font-semibold text-white bg-[#142B4A] hover:bg-[#0F2038] px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            Student Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#17A89B]/10 border border-[#17A89B]/20 text-[#17A89B] text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Powered by Academic RAG & Intelligent Retrieval</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-extrabold text-[#172033] tracking-tight mb-6">
          Academic Management Meets <br />
          <span className="text-[#315EAA]">Personalized YSET AI</span>
        </h2>

        <p className="text-base md:text-lg text-[#68758A] max-w-2xl mx-auto mb-10 leading-relaxed">
          Centralizing coursework, assignments, and verified university knowledge for students, faculty,
          and administrators at Yenepoya School of Technology.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#142B4A] hover:bg-[#0F2038] text-white text-sm font-semibold px-6 py-3.5 rounded-xl transition-all shadow-sm"
          >
            Access Portal
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#172033] border border-[#E3E8F0] text-sm font-semibold px-6 py-3.5 rounded-xl transition-all shadow-xs"
          >
            Student Registration
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
          <div className="bg-white p-6 rounded-2xl border border-[#E3E8F0] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#142B4A]/10 text-[#142B4A] flex items-center justify-center mb-4">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#172033] mb-2">Institutional Scope</h3>
            <p className="text-xs text-[#68758A] leading-relaxed">
              Strict domain enforcement on <code className="text-[#142B4A] font-semibold">@yenepoy.edu.in</code> ensuring authentic access for verified YSET community members.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E3E8F0] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#17A89B]/10 text-[#17A89B] flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#172033] mb-2">YSET AI Assistant</h3>
            <p className="text-xs text-[#68758A] leading-relaxed">
              Context-grounded study help with strict course and document authorization filters.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E3E8F0] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#315EAA]/10 text-[#315EAA] flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#172033] mb-2">Academic Workflows</h3>
            <p className="text-xs text-[#68758A] leading-relaxed">
              Course materials, assignments, submission tracking, and announcements all managed in one place.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E3E8F0] py-6 text-center text-xs text-[#68758A]">
        Yenepoya School of Technology (YSET) · Academic Platform v1.0
      </footer>
    </div>
  );
};
