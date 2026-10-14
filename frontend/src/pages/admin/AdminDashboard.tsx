import React from "react";
import { Link } from "react-router-dom";
import { Users, BookOpen, ShieldCheck, Database, UserPlus } from "lucide-react";
import { useAuth } from "../../context/auth-context";

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const adminName = user?.name || "Administrator";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E3E8F0] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full mb-2">
            System Administration
          </span>
          <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
            Control Panel · {adminName}
          </h1>
          <p className="text-xs text-[#68758A] mt-1">
            Yenepoya School of Technology (YSET) · Account & RAG Governance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/users/invite"
            className="flex items-center gap-1.5 bg-[#142B4A] hover:bg-[#0F2038] text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Faculty / Admin</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E3E8F0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#142B4A]/10 text-[#142B4A] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#68758A] font-medium">Registered Users</p>
            <h3 className="text-xl font-bold text-[#172033]">1,280</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3E8F0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#315EAA]/10 text-[#315EAA] flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#68758A] font-medium">Active Courses</p>
            <h3 className="text-xl font-bold text-[#172033]">48</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3E8F0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#17A89B]/10 text-[#17A89B] flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#68758A] font-medium">Knowledge Docs</p>
            <h3 className="text-xl font-bold text-[#172033]">36</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3E8F0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#16845B] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#68758A] font-medium">Audit Status</p>
            <h3 className="text-xl font-bold text-[#172033]">Compliant</h3>
          </div>
        </div>
      </div>

      {/* Admin Modules Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/users"
          className="bg-white p-6 rounded-2xl border border-[#E3E8F0] hover:border-[#315EAA] shadow-xs transition-colors block"
        >
          <Users className="w-6 h-6 text-[#142B4A] mb-3" />
          <h3 className="text-base font-bold text-[#172033]">User Directory & Access</h3>
          <p className="text-xs text-[#68758A] mt-1">
            Review registered students, provision faculty accounts, and manage account statuses.
          </p>
        </Link>

        <Link
          to="/admin/knowledge-base"
          className="bg-white p-6 rounded-2xl border border-[#E3E8F0] hover:border-[#17A89B] shadow-xs transition-colors block"
        >
          <Database className="w-6 h-6 text-[#17A89B] mb-3" />
          <h3 className="text-base font-bold text-[#172033]">Institutional Knowledge Base</h3>
          <p className="text-xs text-[#68758A] mt-1">
            Manage approved YSET university handbooks, policies, and examination notices for AI RAG.
          </p>
        </Link>

        <Link
          to="/admin/audit-logs"
          className="bg-white p-6 rounded-2xl border border-[#E3E8F0] hover:border-[#D99019] shadow-xs transition-colors block"
        >
          <ShieldCheck className="w-6 h-6 text-[#D99019] mb-3" />
          <h3 className="text-base font-bold text-[#172033]">Security & Audit Logs</h3>
          <p className="text-xs text-[#68758A] mt-1">
            Examine authorization logs, rate-limit anomalies, and administrative mutations with correlation IDs.
          </p>
        </Link>
      </div>
    </div>
  );
};
