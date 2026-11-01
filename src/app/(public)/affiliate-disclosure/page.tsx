import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description: "Affiliate disclosure and Amazon Associates Program statement for Kartshart.com.",
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Affiliate Disclosure
        </h1>
        <p className="text-xs text-slate-500">Last updated: November 2026</p>
      </div>

      <div className="prose-editorial space-y-6">
        <p className="font-medium text-slate-900 dark:text-white">
          As an Amazon Associate I earn from qualifying purchases.
        </p>

        <p>
          Some links on this website are affiliate links. If you click on them and make a purchase, I may earn a small commission at no extra cost to you.
        </p>

        <p>
          This site participates in the Amazon Associates Program, an affiliate advertising program that provides a means for websites to earn advertising fees by linking to Amazon.in.
        </p>

        <p>
          Product prices and availability are subject to change. The price you pay is the same whether you use our links or go to Amazon directly.
        </p>

        <p>
          Thank you for supporting this site.
        </p>
      </div>
    </div>
  );
}

