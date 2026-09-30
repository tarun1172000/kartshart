import { requireUser } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { MediaAsset } from "@/models/MediaAsset";
import { MediaHelperClient } from "@/components/dashboard/MediaHelperClient";

export default async function DashboardMediaPage() {
  await requireUser();
  await connectToDatabase();

  const assets = await MediaAsset.find().sort({ createdAt: -1 }).lean();
  const formattedAssets = assets.map((a: any) => ({
    _id: a._id.toString(),
    title: a.title,
    url: a.url,
    alt: a.alt,
    credit: a.credit,
    createdAt: a.createdAt,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
          Media URL Asset Helper
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Kartshart operates on direct image URLs (Unsplash, Cloudinary, Pexels, CDNs). Paste any image URL to preview, format, and save for reusable post authoring.
        </p>
      </div>

      <MediaHelperClient initialAssets={formattedAssets} />
    </div>
  );
}
