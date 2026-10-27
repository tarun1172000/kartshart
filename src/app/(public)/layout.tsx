import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { TopBannerAd } from "@/components/public/TopBannerAd";
import { getSessionUser } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Ad } from "@/models/Ad";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  await connectToDatabase();
  const topAd = await Ad.findOne({ placement: "top", status: "active" })
    .sort({ updatedAt: -1 })
    .lean();

  const formattedTopAd = topAd
    ? {
        id: (topAd as any)._id.toString(),
        title: (topAd as any).title,
        imageUrl: (topAd as any).imageUrl,
        targetUrl: (topAd as any).targetUrl,
        altText: (topAd as any).altText || (topAd as any).title,
      }
    : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header userRole={user?.role} userName={user?.name} />
      <TopBannerAd initialAd={formattedTopAd} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
