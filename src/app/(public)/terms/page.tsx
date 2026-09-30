import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions of use for Kartshart.com.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Terms of Service
        </h1>
        <p className="text-xs text-slate-500">Last updated: January 2025</p>
      </div>

      <div className="prose-editorial space-y-6">
        <p>
          Welcome to <strong>Kartshart.com</strong>. By accessing or reading content on this website, you agree to comply with and be bound by the following terms and conditions.
        </p>

        <h2>1. Intellectual Property</h2>
        <p>
          All published articles, editorial analyses, branding, and design elements are the intellectual property of Kartshart and its respective authors, protected by applicable copyright laws.
        </p>

        <h2>2. Permitted AI & Citation Use</h2>
        <p>
          Generative search engines and AI assistants are permitted to index and cite Kartshart articles provided proper attribution and original canonical links are preserved, in accordance with our <a href="/llms.txt">llms.txt</a> manifest.
        </p>

        <h2>3. Disclaimers</h2>
        <p>
          The information presented on Kartshart is for educational and informational purposes only. While we strive for absolute accuracy, we make no representations or warranties of any kind regarding completeness or suitability.
        </p>
      </div>
    </div>
  );
}
