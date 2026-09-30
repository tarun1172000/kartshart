import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 text-center bg-slate-50/50 dark:bg-[#07080b]">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mb-6 border border-amber-100 dark:border-amber-900/50">
          <Compass className="w-8 h-8 text-amber-500" />
        </div>
        
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4">
          404: Page Not Found
        </h1>
        
        <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8 text-sm sm:text-base">
          We couldn't find the article or page you were looking for. It might have been moved, renamed, or never existed on Kartshart.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link
            href="/blog"
            className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors flex items-center justify-center"
          >
            Read Articles
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
