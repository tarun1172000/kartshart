import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ShieldCheck, Compass, Users, BookOpen } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Kartshart — Editorial Standards & Mission",
  description:
    "Learn about Kartshart's editorial standards, mission, focus areas, and approach to modern journalism.",
  alternates: {
    canonical: "https://kartshart.com/about",
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16">
      {/* Hero */}
      <div className="space-y-4 text-center sm:text-left border-b border-slate-200 dark:border-slate-800 pb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Independent Digital Editorial</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
          About Kartshart
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 font-serif italic max-w-2xl leading-relaxed">
          Deep perspectives on technology architectures, business mechanics, and the surging Indian innovation landscape.
        </p>
      </div>

      {/* Pillars */}
      <div className="prose-editorial space-y-8">
        <h2>Our Editorial Mission</h2>
        <p>
          Kartshart was founded with a straightforward premise: modern online publishing has become bloated with low-signal clickbait, SEO farms, and generic summaries. We believe practitioners, entrepreneurs, and inquisitive minds value structured depth, clear explanations, and authoritative analyses.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-10 not-prose">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#10121a] border border-slate-200 dark:border-slate-800 space-y-3">
            <ShieldCheck className="w-6 h-6 text-amber-500" />
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
              Zero Clickbait Policy
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Every headline accurately reflects the core analysis. No manufactured outrage or misleading hooks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#10121a] border border-slate-200 dark:border-slate-800 space-y-3">
            <Compass className="w-6 h-6 text-amber-500" />
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
              AEO & AI Grounding
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Our articles are structured with machine-readable summaries, key takeaways, and verified references for search & generative engines.
            </p>
          </div>
        </div>

        <h2>What We Cover</h2>
        <ul>
          <li>
            <strong>Technology & Systems Architecture:</strong> Cloud paradigms, software engineering at scale, artificial intelligence models, and developer velocity.
          </li>
          <li>
            <strong>India Digital Stack:</strong> Real-time payments (UPI), identity rails, open commerce networks (ONDC), and the burgeoning Indian tech ecosystem.
          </li>
          <li>
            <strong>Business & Economics:</strong> Sustainable unit economics, venture trends, bootstrapping models, and startup breakdowns.
          </li>
          <li>
            <strong>Modern Guides:</strong> Hands-on technical tutorials and step-by-step masterclasses designed for real-world execution.
          </li>
        </ul>

        <h2>Contributor Standards</h2>
        <p>
          All articles published on Kartshart are authored and vetted exclusively through our editorial dashboard. We do not host open comment sections or automated syndicated content. Every piece is curated for accuracy and longevity.
        </p>

        <div className="p-6 rounded-2xl bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 not-prose flex flex-col sm:flex-row items-center justify-between gap-4 mt-12">
          <div>
            <h4 className="font-serif text-lg font-bold">Have a story idea or want to pitch?</h4>
            <p className="text-xs text-slate-300 dark:text-slate-900 mt-0.5">
              Reach out directly to our editorial team.
            </p>
          </div>
          <Link
            href="/contact"
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-900 dark:bg-slate-950 dark:text-white whitespace-nowrap"
          >
            Contact Editorial Desk
          </Link>
        </div>
      </div>
    </div>
  );
}
