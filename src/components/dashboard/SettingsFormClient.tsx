"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Save, CheckCircle2, AlertCircle, Image as ImageIcon } from "lucide-react";
import { updateSiteSettingsAction } from "@/actions/settings";
import { isValidImageUrl } from "@/lib/utils";

interface SettingsFormClientProps {
  initialSettings: {
    siteName: string;
    tagline: string;
    description: string;
    logoUrl?: string;
    defaultOgImageUrl?: string;
    twitterHandle?: string;
    socialLinks?: {
      twitter?: string;
      github?: string;
      linkedin?: string;
      instagram?: string;
      youtube?: string;
    };
    contactEmail: string;
    gaId?: string;
    searchConsole?: string;
  };
}

export function SettingsFormClient({ initialSettings }: SettingsFormClientProps) {
  const [isPending, startTransition] = useTransition();

  const [siteName, setSiteName] = useState(initialSettings.siteName || "Kartshart");
  const [tagline, setTagline] = useState(initialSettings.tagline || "");
  const [description, setDescription] = useState(initialSettings.description || "");
  const [defaultOgImageUrl, setDefaultOgImageUrl] = useState(
    initialSettings.defaultOgImageUrl || ""
  );
  const [twitterHandle, setTwitterHandle] = useState(
    initialSettings.twitterHandle || "@kartshart"
  );
  const [contactEmail, setContactEmail] = useState(
    initialSettings.contactEmail || "tarunwaliya780@gmail.com"
  );
  const [gaId, setGaId] = useState(initialSettings.gaId || "");
  const [searchConsole, setSearchConsole] = useState(
    initialSettings.searchConsole || ""
  );

  const [twitterLink, setTwitterLink] = useState(
    initialSettings.socialLinks?.twitter || ""
  );
  const [githubLink, setGithubLink] = useState(
    initialSettings.socialLinks?.github || ""
  );
  const [linkedinLink, setLinkedinLink] = useState(
    initialSettings.socialLinks?.linkedin || ""
  );
  const [instagramLink, setInstagramLink] = useState(
    initialSettings.socialLinks?.instagram || ""
  );

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await updateSiteSettingsAction({
        siteName,
        tagline,
        description,
        defaultOgImageUrl,
        twitterHandle,
        contactEmail,
        gaId,
        searchConsole,
        socialLinks: {
          twitter: twitterLink,
          github: githubLink,
          linkedin: linkedinLink,
          instagram: instagramLink,
        },
      });

      if (res.success) {
        setSuccess(res.message || "Settings updated successfully!");
      } else {
        setError(res.error || "Failed to update settings.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* General Branding */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#10121a] border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
          General Brand Info
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Site Brand Name
            </label>
            <input
              type="text"
              required
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Platform Contact Email
            </label>
            <input
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Site Tagline
          </label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Site Description (Meta & RSS)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Social & SEO */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#10121a] border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
          Social Links & Default Open Graph Image
        </h3>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Default Open Graph / Social Share Image URL
          </label>
          <input
            type="text"
            value={defaultOgImageUrl}
            onChange={(e) => setDefaultOgImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
          />
        </div>

        {defaultOgImageUrl && isValidImageUrl(defaultOgImageUrl) && (
          <div className="relative h-32 w-64 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <Image
              src={defaultOgImageUrl}
              alt="OG Preview"
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Twitter / X Handle
            </label>
            <input
              type="text"
              value={twitterHandle}
              onChange={(e) => setTwitterHandle(e.target.value)}
              placeholder="@kartshart"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Twitter / X Profile URL
            </label>
            <input
              type="text"
              value={twitterLink}
              onChange={(e) => setTwitterLink(e.target.value)}
              placeholder="https://twitter.com/kartshart"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              GitHub URL
            </label>
            <input
              type="text"
              value={githubLink}
              onChange={(e) => setGithubLink(e.target.value)}
              placeholder="https://github.com/kartshart"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              LinkedIn URL
            </label>
            <input
              type="text"
              value={linkedinLink}
              onChange={(e) => setLinkedinLink(e.target.value)}
              placeholder="https://linkedin.com/company/kartshart"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Analytics & Webmaster */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#10121a] border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
          Search Console & Analytics
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Google Analytics (GA4 Measurement ID)
            </label>
            <input
              type="text"
              value={gaId}
              onChange={(e) => setGaId(e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Google Search Console Verification Tag
            </label>
            <input
              type="text"
              value={searchConsole}
              onChange={(e) => setSearchConsole(e.target.value)}
              placeholder="google-site-verification=..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        <span>{isPending ? "Saving..." : "Save Settings"}</span>
      </button>
    </form>
  );
}
