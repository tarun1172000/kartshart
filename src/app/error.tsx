"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mb-6 border border-rose-100 dark:border-rose-900/50">
        <AlertTriangle className="w-8 h-8 text-rose-500" />
      </div>
      
      <h1 className="font-serif text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4 text-center">
        Kartshart System Error
      </h1>
      
      <p className="text-slate-600 dark:text-slate-400 max-w-md text-center mb-8">
        We ran into a problem rendering this page. Our editorial team has been notified. 
        Please try again or return to the homepage.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <button
          onClick={() => reset()}
          className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 transition-colors shadow-md"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}
