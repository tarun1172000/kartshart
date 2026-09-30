import Link from "next/link";
import { ArrowUpRight, Rss, Bot, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#07080b] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-slate-900 dark:bg-amber-500 flex items-center justify-center text-white dark:text-slate-950 font-serif font-black text-sm">
                K
              </div>
              <span className="font-serif text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Kartshart<span className="text-amber-500">.</span>
              </span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              Independent perspectives, in-depth essays, and modern editorial analyses covering Technology, India Stack, Business, and intentional living.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/rss.xml"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/50 hover:bg-amber-100 transition-colors"
                title="RSS Feed"
              >
                <Rss className="w-3 h-3" />
                <span>RSS Feed</span>
              </Link>
              <Link
                href="/llms.txt"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors"
                title="AI & LLM Manifest"
              >
                <Bot className="w-3 h-3" />
                <span>llms.txt</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Editorial
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/blog"
                  className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  All Articles
                </Link>
              </li>
              <li>
                <Link
                  href="/category/technology"
                  className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  Technology
                </Link>
              </li>
              <li>
                <Link
                  href="/category/india"
                  className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  India Ecosystem
                </Link>
              </li>
              <li>
                <Link
                  href="/category/business"
                  className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  Business
                </Link>
              </li>
              <li>
                <Link
                  href="/category/guides"
                  className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Information
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  About Kartshart
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  Contact & Pitch
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Portal / Author Access */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Staff Portal
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Editors and administrators can access the publishing studio via one-time secure OTP.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400"
              >
                <span>Editorial Studio Login</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/request-access"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <span>Request Contributor Access</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {currentYear} Kartshart.com. Crafted for quality journalism & deep perspectives.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>AEO & GEO Indexed</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
