import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { useAuth } from "../context/auth-context";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await login({ email, password });

      // Route by role
      const roles = user?.roles || ["STUDENT"];
      if (roles.includes("ADMIN")) {
        navigate("/admin/dashboard");
      } else if (roles.includes("FACULTY")) {
        navigate("/faculty/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials or account unverified.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#F6F8FC]">
      {/* Left Branded Panel (Desktop) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[#142B4A] text-white relative overflow-hidden">
        {/* Subtle geometric background shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#315EAA]/20 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-[#17A89B]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#17A89B] flex items-center justify-center font-bold text-white text-lg shadow-sm">
            Y
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">YSET</h1>
            <p className="text-xs text-slate-300">Yenepoya School of Technology</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#17A89B]/20 text-[#17A89B] text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Intelligence Platform</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-4 leading-snug">
            Empowering Learning & Research at YSET
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-8">
            Access your courses, submit assignments, and consult with the AI academic assistant grounded in verified course materials.
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs text-slate-200">
              <div className="w-5 h-5 rounded-full bg-[#17A89B]/20 flex items-center justify-center text-[#17A89B]">✓</div>
              <span>Secured institutional access via @yenepoya.edu.in</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-200">
              <div className="w-5 h-5 rounded-full bg-[#17A89B]/20 flex items-center justify-center text-[#17A89B]">✓</div>
              <span>Contextual academic reasoning and study assistance</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-200">
              <div className="w-5 h-5 rounded-full bg-[#17A89B]/20 flex items-center justify-center text-[#17A89B]">✓</div>
              <span>Role-governed workspaces for students & faculty</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          © {new Date().getFullYear()} Yenepoya School of Technology (YSET). All rights reserved.
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl border border-[#E3E8F0] shadow-sm">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#142B4A] flex items-center justify-center font-bold text-white text-sm">
              Y
            </div>
            <div>
              <span className="font-bold text-sm text-[#142B4A]">YSET Portal</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#172033] tracking-tight mb-2">Welcome back</h2>
          <p className="text-xs text-[#68758A] mb-8">
            Your campus, courses, and AI assistant—all in one place.
          </p>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@yenepoya.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-[#E3E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#315EAA]/30 focus:border-[#315EAA] transition-all bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#172033]">Password</label>
                <Link to="/forgot-password" className="text-xs font-medium text-[#315EAA] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[#E3E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#315EAA]/30 focus:border-[#315EAA] transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-[#142B4A] hover:bg-[#0F2038] disabled:bg-slate-400 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors shadow-xs"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#E3E8F0] text-center">
            <p className="text-xs text-[#68758A]">
              Don't have a student account?{" "}
              <Link to="/signup" className="font-semibold text-[#315EAA] hover:underline">
                Register with YSET email
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-[#68758A]">
          Use your authorized <span className="font-semibold text-[#142B4A]">@yenepoya.edu.in</span> account.
        </div>
      </div>
    </div>
  );
};
