"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { UserCheck, Send, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { requestAccessAction } from "@/actions/auth";

export default function RequestAccessPage() {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (reason.trim().length < 20) {
      setErrorMsg("Please provide a detailed reason with at least 20 characters.");
      return;
    }

    startTransition(async () => {
      const res = await requestAccessAction({
        name: name.trim(),
        email: email.trim(),
        reason: reason.trim(),
      });

      if (res.success) {
        setSuccessMsg(
          res.message ||
            "Your access request has been submitted! The Super Admin will review it and notify you via email."
        );
        setName("");
        setEmail("");
        setReason("");
      } else {
        setErrorMsg(res.error || "Failed to submit access request.");
      }
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8 bg-white dark:bg-[#10121a] p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="space-y-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            <UserCheck className="w-4 h-4" />
            <span>Contributor Onboarding</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Request Studio Access
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Contributors, guest columnists, and editors can request publishing dashboard access.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
              Request Submitted
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
              {successMsg}
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-block px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950"
              >
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address * (Used for OTP logins)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Reason / Background *
                </label>
                <span className="text-[11px] text-slate-400">
                  Min. 20 characters ({reason.length}/20)
                </span>
              </div>
              <textarea
                rows={4}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain what topics you would like to write about and any past work or background..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isPending ? "Submitting..." : "Submit Access Request"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
