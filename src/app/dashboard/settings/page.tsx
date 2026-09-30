import { requireRole } from "@/lib/auth";
import { Role } from "@/lib/constants";
import connectToDatabase from "@/lib/mongodb";
import { SiteSettings } from "@/models/SiteSettings";
import { SettingsFormClient } from "@/components/dashboard/SettingsFormClient";

export default async function DashboardSettingsPage() {
  await requireRole([Role.SUPER_ADMIN]);
  await connectToDatabase();

  const foundSettings = await SiteSettings.findOne().lean();
  
  const initialData = {
    siteName: foundSettings?.siteName || "Kartshart",
    tagline:
      foundSettings?.tagline ||
      "Independent Perspectives, Thoughtful Editorial & Modern Insights",
    description:
      foundSettings?.description ||
      "Kartshart is a modern editorial magazine featuring deep-dive articles across technology, business, lifestyle, culture, and India.",
    logoUrl: foundSettings?.logoUrl || "",
    defaultOgImageUrl: foundSettings?.defaultOgImageUrl || "",
    twitterHandle: foundSettings?.twitterHandle || "@kartshart",
    socialLinks: (foundSettings?.socialLinks as any) || {},
    contactEmail: foundSettings?.contactEmail || "tarunwaliya780@gmail.com",
    gaId: foundSettings?.gaId || "",
    searchConsole: foundSettings?.searchConsole || "",
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
          Platform & SEO Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure branding, social media links, default Open Graph images, and analytics IDs.
        </p>
      </div>

      <SettingsFormClient initialSettings={initialData} />
    </div>
  );
}
