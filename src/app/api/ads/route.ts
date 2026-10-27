import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Ad } from "@/models/Ad";
import { getSessionUser } from "@/lib/auth";
import { Role } from "@/lib/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/ads
 * Query params:
 * - placement: 'top' | 'sidebar' | 'popup' | 'all'
 * - status: 'active' (default) | 'all' (admin only)
 * - limit: number (default: 10)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const placement = searchParams.get("placement");
    const status = searchParams.get("status") || "active";
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    await connectToDatabase();

    const query: Record<string, any> = {};

    if (status !== "all") {
      query.status = "active";
    }

    if (placement && placement !== "all") {
      query.placement = placement;
    }

    const ads = await Ad.find(query)
      .sort({ updatedAt: -1 })
      .limit(Math.min(limit, 50))
      .lean();

    // Increment impressions in background without blocking
    if (ads.length > 0 && status === "active") {
      const ids = ads.map((ad: any) => ad._id);
      Ad.updateMany({ _id: { $in: ids } }, { $inc: { impressions: 1 } }).exec().catch(() => {});
    }

    return NextResponse.json({
      success: true,
      count: ads.length,
      ads: ads.map((ad: any) => ({
        id: ad._id.toString(),
        title: ad.title,
        imageUrl: ad.imageUrl,
        targetUrl: ad.targetUrl,
        placement: ad.placement,
        status: ad.status,
        clicks: ad.clicks || 0,
        impressions: ad.impressions || 0,
        altText: ad.altText || ad.title,
        createdAt: ad.createdAt,
        updatedAt: ad.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error("GET /api/ads error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch ads." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ads
 * Create a new advertisement (staff only)
 */
export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || ![Role.SUPER_ADMIN, Role.ADMIN].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin role required." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { title, imageUrl, targetUrl, placement, status, altText } = body;

    if (!title || !imageUrl || !targetUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Title, Image URL, and Target URL are required.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const newAd = await Ad.create({
      title: title.trim(),
      imageUrl: imageUrl.trim(),
      targetUrl: targetUrl.trim(),
      placement: ["top", "sidebar", "popup"].includes(placement) ? placement : "top",
      status: status === "inactive" ? "inactive" : "active",
      altText: altText?.trim() || title.trim(),
      createdBy: user._id,
    });

    return NextResponse.json({
      success: true,
      ad: newAd,
      message: "Advertisement created successfully.",
    });
  } catch (error: any) {
    console.error("POST /api/ads error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create ad." },
      { status: 500 }
    );
  }
}
