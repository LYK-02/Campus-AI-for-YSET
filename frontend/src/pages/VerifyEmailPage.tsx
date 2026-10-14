import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { apiRequest } from "../lib/api-client";

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("No verification token was provided in the link.");
      setIsLoading(false);
      return;
    }

    const verify = async () => {
      try {
        await apiRequest("/auth/verify-email", {
          method: "POST",
          body: JSON.stringify({ token }),
        });
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || "Email verification failed or link has expired.");
      } finally {
        setIsLoading(false);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#E3E8F0] shadow-sm p-8 text-center">
        {/* Brand Header */}
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#142B4A] flex items-center justify-center font-bold text-white text-lg">
            Y
          </div>
          <div className="text-left">
            <span className="font-bold text-base text-[#142B4A] block leading-tight">YSET</span>
            <span className="text-[11px] text-[#68758A]">Yenepoya School of Technology</span>
          </div>
        </div>

        {isLoading && (
          <div className="py-8 space-y-4">
            <Loader2 className="w-10 h-10 text-[#315EAA] animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-[#172033]">Verifying your email...</h2>
            <p className="text-xs text-[#68758A]">
              Validating your institutional token against the university directory.
            </p>
          </div>
        )}

        {!isLoading && success && (
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-[#16845B] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-xl font-bold text-[#172033]">Email Verified Successfully</h2>
            <p className="text-xs text-[#68758A] max-w-sm mx-auto leading-relaxed">
              Your institutional student account at Yenepoya School of Technology is now verified and active.
            </p>
            <div className="pt-4">
              <Link
                to="/login"
                className="w-full inline-block bg-[#142B4A] hover:bg-[#0F2038] text-white text-xs font-semibold py-3 px-6 rounded-xl transition-colors shadow-xs"
              >
                Sign In to Campus Portal
              </Link>
            </div>
          </div>
        )}

        {!isLoading && error && (
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-9 h-9" />
            </div>
            <h2 className="text-xl font-bold text-[#172033]">Verification Link Invalid</h2>
            <p className="text-xs text-red-600 max-w-sm mx-auto leading-relaxed bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </p>
            <div className="pt-4 flex flex-col gap-2">
              <Link
                to="/signup"
                className="w-full inline-block bg-[#142B4A] hover:bg-[#0F2038] text-white text-xs font-semibold py-3 px-6 rounded-xl transition-colors shadow-xs"
              >
                Register Again
              </Link>
              <Link
                to="/login"
                className="text-xs text-[#315EAA] hover:underline font-semibold"
              >
                Return to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
