"use client";

import { useState, useTransition } from "react";
import { Mail, Send, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { submitContactMessageAction } from "@/actions/contact";

export default function ContactPage() {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await submitContactMessageAction({
        name,
        email,
        subject,
        message,
      });

      if (res.success) {
        setSuccess(res.message || "Message sent successfully!");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setError(res.error || "Failed to send message.");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12">
      <div className="space-y-4 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
          <Mail className="w-3.5 h-3.5" />
          <span>Editorial Communications</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">
          Get in Touch & Pitch
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-base">
          Have an article idea, technical pitch, partnership inquiry, or editorial correction? Send us a message and our team will get back to you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-8 bg-white dark:bg-[#10121a] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {success ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                Message Received!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                {success}
              </p>
              <button
                onClick={() => setSuccess(null)}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Name *
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
                    Email Address *
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
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Article pitch on ONDC architecture"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Message *
                </label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide context on your pitch or message..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isPending ? "Sending message..." : "Send Message"}</span>
              </button>
            </form>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="md:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
              Direct Contact
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              For urgent editorial inquiries, you can reach the platform administrator directly at:
            </p>
            <p className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
              tarunwaliya780@gmail.com
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
              Contributing Writers
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Looking for publishing studio access? Request contributor access on our portal:
            </p>
            <a
              href="/request-access"
              className="inline-block text-xs font-bold text-amber-700 dark:text-amber-400 underline underline-offset-4 pt-1"
            >
              Request Contributor Access &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
