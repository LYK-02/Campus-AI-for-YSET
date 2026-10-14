import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Calendar,
  Bell,
  Sparkles,
  LogOut,
  Menu,
  X,
  Users,
  GraduationCap,
  ShieldCheck,
  FolderGit2,
  Database,
  BarChart3,
  CheckSquare,
} from "lucide-react";
import { useAuth } from "../../context/auth-context";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Derive role
  const roles = user?.roles || ["STUDENT"];
  const isFaculty = roles.includes("FACULTY");
  const isAdmin = roles.includes("ADMIN");

  let navItems: NavItem[] = [];

  if (isAdmin) {
    navItems = [
      { label: "Overview", path: "/admin/dashboard", icon: LayoutDashboard },
      { label: "User Directory", path: "/admin/users", icon: Users },
      { label: "Departments", path: "/admin/departments", icon: FolderGit2 },
      { label: "Courses", path: "/admin/courses", icon: BookOpen },
      { label: "Knowledge Base", path: "/admin/knowledge-base", icon: Database },
      { label: "AI Usage & Costs", path: "/admin/ai-usage", icon: BarChart3 },
      { label: "Audit Logs", path: "/admin/audit-logs", icon: ShieldCheck },
      { label: "YSET AI Chat", path: "/ai", icon: Sparkles },
    ];
  } else if (isFaculty) {
    navItems = [
      { label: "Workspace", path: "/faculty/dashboard", icon: LayoutDashboard },
      { label: "Assigned Courses", path: "/faculty/courses", icon: BookOpen },
      { label: "Assignments & Submissions", path: "/faculty/assignments", icon: CheckSquare },
      { label: "Learning Materials", path: "/faculty/materials", icon: FileText },
      { label: "Announcements", path: "/faculty/announcements", icon: Bell },
      { label: "YSET AI Chat", path: "/ai", icon: Sparkles },
    ];
  } else {
    // Default Student
    navItems = [
      { label: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
      { label: "My Courses", path: "/student/courses", icon: BookOpen },
      { label: "Learning Materials", path: "/student/materials", icon: FileText },
      { label: "Assignments", path: "/student/assignments", icon: CheckSquare },
      { label: "Timetable", path: "/student/timetable", icon: Calendar },
      { label: "Announcements", path: "/student/announcements", icon: Bell },
      { label: "YSET AI Assistant", path: "/ai", icon: Sparkles },
    ];
  }

  const primaryRole = isAdmin ? "Administrator" : isFaculty ? "Faculty Member" : "Student";

  return (
    <div className="min-h-screen flex bg-[#F6F8FC] text-[#172033]">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#142B4A] text-white shrink-0 border-r border-[#1D3B63]">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#1D3B63]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#17A89B] flex items-center justify-center font-bold text-white text-lg shadow-sm">
              Y
            </div>
            <div>
              <div className="font-bold text-base leading-tight tracking-wide flex items-center gap-1.5">
                YSET
                <span className="text-[10px] bg-[#17A89B]/30 text-[#17A89B] px-1.5 py-0.5 rounded font-mono font-semibold">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">Yenepoya School of Tech</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            const isAi = item.path === "/ai";

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? isAi
                      ? "bg-[#17A89B] text-white shadow-sm font-semibold"
                      : "bg-[#315EAA] text-white shadow-sm font-semibold"
                    : isAi
                    ? "text-[#17A89B] hover:bg-[#17A89B]/15"
                    : "text-slate-200 hover:bg-[#1D3B63] hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isAi && !isActive ? "text-[#17A89B]" : ""}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-[#1D3B63] bg-[#0F2038]/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-[#315EAA] flex items-center justify-center text-xs font-semibold text-white">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name || "Campus User"}</p>
                <p className="text-[11px] text-slate-400 capitalize">{primaryRole}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Sign out"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-[#E3E8F0] px-4 lg:px-8 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#315EAA] hidden sm:block" />
              <span className="text-sm font-semibold text-[#172033] tracking-tight">
                YSET Campus Portal
              </span>
              <span className="hidden md:inline-block text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                yenepoya.edu.in
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Ask AI button */}
            <button
              onClick={() => navigate("/ai")}
              className="flex items-center gap-1.5 bg-[#17A89B] hover:bg-[#13897E] text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask YSET AI</span>
            </button>

            {/* Notification placeholder */}
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg relative transition-colors">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-[#D99019] absolute top-1.5 right-1.5" />
            </button>

            {/* Role indicator */}
            <div className="text-right hidden sm:block">
              <span className="inline-block text-[11px] font-semibold uppercase px-2 py-0.5 rounded-md bg-[#315EAA]/10 text-[#315EAA]">
                {primaryRole}
              </span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative flex flex-col w-64 bg-[#142B4A] text-white p-4 z-10">
              <div className="flex items-center justify-between pb-4 border-b border-[#1D3B63]">
                <span className="font-bold text-base">YSET Portal</span>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <nav className="flex-1 py-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-[#1D3B63]"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
              <button
                onClick={() => logout()}
                className="flex items-center gap-2 p-2 text-red-300 hover:bg-red-900/30 rounded-lg text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
