import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, User, Hash, CheckCircle2, AlertCircle } from "lucide-react";
import { apiRequest } from "../lib/api-client";

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isEmailValidDomain = email.trim().toLowerCase().endsWith("@yenepoy.edu.in");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isEmailValidDomain) {
      setError("Registration is restricted to the institutional domain: @yenepoy.edu.in");
      return;
    }

    if (!studentId.trim()) {
      setError("Student Registration / Roll ID is required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          studentId: studentId.trim(),
          password,
        }),
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-lg bg-white p-8 sm:p-10 rounded-2xl border border-[#E3E8F0] shadow-sm">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#142B4A] flex items-center justify-center font-bold text-white text-lg">
            Y
          </div>
          <div>
            <h1 className="font-bold text-lg text-[#142B4A]">YSET</h1>
            <p className="text-xs text-[#68758A]">Yenepoya School of Technology</p>
          </div>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-emerald-100 text-[#16845B] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-[#172033] mb-2">Check your inbox</h2>
            <p className="text-xs text-[#68758A] max-w-sm mx-auto mb-6 leading-relaxed">
              We've dispatched a single-use verification link to{" "}
              <span className="font-semibold text-[#142B4A]">{email}</span>. Click the link to activate your student account.
            </p>
            <Link
              to="/login"
              className="inline-block bg-[#142B4A] hover:bg-[#0F2038] text-white text-xs font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-[#172033] tracking-tight mb-1">
              Student Registration
            </h2>
            <p className="text-xs text-[#68758A] mb-6">
              Create your official student account using your YSET institutional credentials.
            </p>

            {/* Institutional domain requirement notice */}
            <div className="mb-6 p-3.5 rounded-xl bg-[#315EAA]/10 border border-[#315EAA]/20 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-[#315EAA] shrink-0 mt-0.5" />
              <p className="text-xs text-[#315EAA] leading-relaxed">
                <strong>Policy Requirement:</strong> Self-registration requires an institutional email ending in{" "}
                <code className="font-bold">@yenepoy.edu.in</code>. Faculty and staff accounts are provisioned via administrative invitation.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-[#E3E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#315EAA]/30 focus:border-[#315EAA] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="student@yenepoy.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all bg-white ${
                      email.length > 0 && !isEmailValidDomain
                        ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                        : "border-[#E3E8F0] focus:ring-[#315EAA]/30 focus:border-[#315EAA]"
                    }`}
                  />
                </div>
                {email.length > 0 && !isEmailValidDomain && (
                  <p className="text-[11px] text-red-600 mt-1">
                    Must end with @yenepoy.edu.in
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1.5 flex items-center justify-between">
                  <span>Student Registration / Roll ID</span>
                  <span className="text-[11px] font-medium text-red-500 font-sans">*Mandatory</span>
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. YSET-2026-CS-042"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-[#E3E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#315EAA]/30 focus:border-[#315EAA] bg-white"
                  />
                </div>
                <p className="text-[11px] text-[#68758A] mt-1">
                  Required for institutional verification. Your engineering branch, semester timetable, and enrolled courses will be assigned by the administration after approval.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-[#E3E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#315EAA]/30 focus:border-[#315EAA] bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-[#E3E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#315EAA]/30 focus:border-[#315EAA] bg-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 bg-[#142B4A] hover:bg-[#0F2038] disabled:bg-slate-400 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors shadow-xs"
              >
                {isLoading ? "Creating account..." : "Register as Student"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#E3E8F0] text-center">
              <p className="text-xs text-[#68758A]">
                Already have an activated account?{" "}
                <Link to="/login" className="font-semibold text-[#315EAA] hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
