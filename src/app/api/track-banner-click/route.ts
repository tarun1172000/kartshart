import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { PostStatus } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const slug = body.slug;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ success: false, error: "Slug required" }, { status: 400 });
    }

    await connectToDatabase();
    const updated = await Post.findOneAndUpdate(
      { slug, status: PostStatus.PUBLISHED },
      { $inc: { bannerClicks: 1 } },
      { new: true }
    ).select("bannerClicks");

    return NextResponse.json({
      success: true,
      bannerClicks: updated?.bannerClicks || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ success: false, error: "Slug required" }, { status: 400 });
    }

    await connectToDatabase();
    const updated = await Post.findOneAndUpdate(
      { slug, status: PostStatus.PUBLISHED },
      { $inc: { bannerClicks: 1 } },
      { new: true }
    ).select("bannerClicks");

    return NextResponse.json({
      success: true,
      bannerClicks: updated?.bannerClicks || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed" }, { status: 500 });
  }
}
