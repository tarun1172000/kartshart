import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { Ad } from "@/models/Ad";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const id = body.id || body.adId;

    if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Valid Ad ID is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const ad = await Ad.findByIdAndUpdate(
      id,
      { $inc: { clicks: 1 } },
      { new: true }
    ).select("clicks targetUrl title");

    if (!ad) {
      return NextResponse.json(
        { success: false, error: "Ad not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      clicks: ad.clicks,
      targetUrl: ad.targetUrl,
    });
  } catch (error: any) {
    console.error("Ad click tracking error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to track click." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") || searchParams.get("adId");
    const redirectMode = searchParams.get("redirect") === "1" || searchParams.get("redirect") === "true";

    if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Valid Ad ID is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const ad = await Ad.findByIdAndUpdate(
      id,
      { $inc: { clicks: 1 } },
      { new: true }
    ).select("clicks targetUrl title");

    if (!ad) {
      return NextResponse.json(
        { success: false, error: "Ad not found." },
        { status: 404 }
      );
    }

    if (redirectMode && ad.targetUrl) {
      return NextResponse.redirect(new URL(ad.targetUrl, req.url), 302);
    }

    return NextResponse.json({
      success: true,
      clicks: ad.clicks,
      targetUrl: ad.targetUrl,
    });
  } catch (error: any) {
    console.error("Ad click tracking GET error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to track click." },
      { status: 500 }
    );
  }
}
