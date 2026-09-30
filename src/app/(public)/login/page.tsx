"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Mail, KeyRound, ArrowRight, AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { sendOtpAction, verifyOtpAction } from "@/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const [isPending, startTransition] = useTransition();

  // Step 1: "email" | Step 2: "otp"
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [notRegistered, setNotRegistered] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  // Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setNotRegistered(false);
    setIsPendingApproval(false);

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    startTransition(async () => {
      const res = await sendOtpAction(email);
      if (res.success) {
        setStep("otp");
        setInfoMsg(res.message || `Code sent to ${email}`);
      } else {
        setErrorMsg(res.error || "Failed to send code.");
        if (res.notRegistered) {
          setNotRegistered(true);
        }
        if (res.isPending) {
          setIsPendingApproval(true);
        }
      }
    });
  };

  // Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (otpCode.trim().length !== 6) {
      setErrorMsg("Please enter all 6 digits of your verification code.");
      return;
    }

    startTransition(async () => {
      const res = await verifyOtpAction(email, otpCode);
      if (res.success) {
        window.location.href = redirectUrl;
      } else {
        setErrorMsg(res.error || "Invalid verification code.");
      }
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-[#10121a] p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-amber-500 flex items-center justify-center text-white dark:text-slate-950 font-serif font-black text-2xl mx-auto shadow-md">
            K
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Editorial Studio Login
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Passwordless email OTP authentication for authors and administrators.
          </p>
        </div>

        {/* Error / Warning Alert */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p>{errorMsg}</p>
              {notRegistered && (
                <Link
                  href="/request-access"
                  className="font-bold underline block pt-1 text-rose-800 dark:text-rose-200"
                >
                  Request Contributor Access Here &rarr;
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Info Alert */}
        {infoMsg && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{infoMsg}</span>
          </div>
        )}

        {step === "email" ? (
          /* Step 1: Email Form */
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. tarunwaliya780@gmail.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isPending ? "Sending OTP Code..." : "Send Verification Code"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Step 2: OTP Form */
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  6-Digit Verification Code
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtpCode("");
                    setErrorMsg(null);
                  }}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Change Email
                </button>
              </div>

              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  autoFocus
                  value={otpCode}
                  onChange={(e) =>
                    setOtpCode(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center font-mono text-xl font-bold tracking-[6px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 text-center">
                Code valid for 10 minutes. Check your inbox or spam folder.
              </p>
            </div>

            <button
              type="submit"
              disabled={isPending || otpCode.length !== 6}
              className="w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isPending ? "Verifying..." : "Verify & Sign In"}</span>
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
          <span>Not a registered contributor yet? </span>
          <Link
            href="/request-access"
            className="font-semibold text-amber-600 dark:text-amber-400 hover:underline"
          >
            Request Access
          </Link>
        </div>
      </div>
    </div>
  );
}
