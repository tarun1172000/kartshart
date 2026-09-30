import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy and data handling guidelines for Kartshart.com.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-500">Last updated: January 2025</p>
      </div>

      <div className="prose-editorial space-y-6">
        <p>
          At <strong>Kartshart.com</strong>, we believe in privacy by design. We do not engage in invasive cross-site tracking or sale of personal data.
        </p>

        <h2>1. Information We Collect</h2>
        <p>
          When you submit an access request or contact message, we collect your name, email address, and message contents to fulfill your request and communicate with you.
        </p>

        <h2>2. Cookies and Local Storage</h2>
        <p>
          We use strictly necessary httpOnly cookies for authenticating editorial staff and administrators. We use local storage solely to store your preferred color theme (dark/light mode).
        </p>

        <h2>3. Third-Party Services</h2>
        <p>
          We may use transactional email delivery services (such as Resend or standard SMTP) to send one-time authentication codes (OTP) and editorial alerts.
        </p>

        <h2>4. Contact Us</h2>
        <p>
          If you have questions regarding this Privacy Policy, you can reach our editorial desk at{" "}
          <a href="mailto:tarunwaliya780@gmail.com">tarunwaliya780@gmail.com</a>.
        </p>
      </div>
    </div>
  );
}
