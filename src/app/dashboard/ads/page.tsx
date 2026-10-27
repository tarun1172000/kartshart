import { requireRole } from "@/lib/auth";
import { Role } from "@/lib/constants";
import connectToDatabase from "@/lib/mongodb";
import { Ad } from "@/models/Ad";
import { AdsManagerClient, SerializedAd } from "@/components/dashboard/AdsManagerClient";

export const dynamic = "force-dynamic";

export default async function DashboardAdsPage() {
  await requireRole([Role.SUPER_ADMIN, Role.ADMIN]);
  await connectToDatabase();

  const ads = await Ad.find().sort({ createdAt: -1 }).lean();

  const formattedAds: SerializedAd[] = ads.map((ad: any) => ({
    _id: ad._id.toString(),
    title: ad.title,
    imageUrl: ad.imageUrl,
    targetUrl: ad.targetUrl,
    placement: ad.placement,
    status: ad.status,
    clicks: ad.clicks || 0,
    impressions: ad.impressions || 0,
    altText: ad.altText || ad.title,
    createdAt: ad.createdAt ? new Date(ad.createdAt).toISOString() : new Date().toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
          Advertisements & Banner Campaigns
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage promotional banners across the site. Upload image files or paste direct URLs, set destination target links, and pick Top Banner or Sidebar placement with real-time click tracking.
        </p>
      </div>

      <AdsManagerClient initialAds={formattedAds} />
    </div>
  );
}
