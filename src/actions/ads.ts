"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import connectToDatabase from "@/lib/mongodb";
import { Ad, AdPlacement, AdStatus } from "@/models/Ad";
import { requireRole } from "@/lib/auth";
import { Role } from "@/lib/constants";
import { getZodErrorMessage } from "@/lib/utils";

const AdSchema = z.object({
  title: z.string().min(2, "Ad title is required").trim(),
  imageUrl: z.string().min(1, "Ad image URL or upload is required").trim(),
  targetUrl: z.string().min(1, "Click destination link is required").trim(),
  placement: z.enum(["top", "sidebar", "popup"]).default("top"),
  status: z.enum(["active", "inactive"]).default("active"),
  altText: z.string().optional(),
});

export async function createAdAction(rawInput: unknown) {
  try {
    const user = await requireRole([Role.SUPER_ADMIN, Role.ADMIN]);
    await connectToDatabase();

    const parseResult = AdSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return { success: false, error: getZodErrorMessage(parseResult.error) };
    }

    const data = parseResult.data;

    const ad = await Ad.create({
      title: data.title,
      imageUrl: data.imageUrl,
      targetUrl: data.targetUrl,
      placement: data.placement,
      status: data.status,
      altText: data.altText || data.title,
      createdBy: user._id,
      clicks: 0,
      impressions: 0,
    });

    revalidatePath("/dashboard/ads");
    revalidatePath("/");
    revalidatePath("/blog");

    return {
      success: true,
      ad: JSON.parse(JSON.stringify(ad)),
      message: "Advertisement created successfully!",
    };
  } catch (err: unknown) {
    console.error("createAdAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create ad.",
    };
  }
}

export async function updateAdAction(id: string, rawInput: unknown) {
  try {
    await requireRole([Role.SUPER_ADMIN, Role.ADMIN]);
    await connectToDatabase();

    const parseResult = AdSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return { success: false, error: getZodErrorMessage(parseResult.error) };
    }

    const data = parseResult.data;

    const updated = await Ad.findByIdAndUpdate(
      id,
      {
        title: data.title,
        imageUrl: data.imageUrl,
        targetUrl: data.targetUrl,
        placement: data.placement,
        status: data.status,
        altText: data.altText || data.title,
      },
      { new: true }
    );

    if (!updated) {
      return { success: false, error: "Advertisement not found." };
    }

    revalidatePath("/dashboard/ads");
    revalidatePath("/");
    revalidatePath("/blog");

    return {
      success: true,
      ad: JSON.parse(JSON.stringify(updated)),
      message: "Advertisement updated successfully!",
    };
  } catch (err: unknown) {
    console.error("updateAdAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update ad.",
    };
  }
}

export async function toggleAdStatusAction(id: string) {
  try {
    await requireRole([Role.SUPER_ADMIN, Role.ADMIN]);
    await connectToDatabase();

    const ad = await Ad.findById(id);
    if (!ad) {
      return { success: false, error: "Advertisement not found." };
    }

    ad.status = ad.status === "active" ? "inactive" : "active";
    await ad.save();

    revalidatePath("/dashboard/ads");
    revalidatePath("/");
    revalidatePath("/blog");

    return {
      success: true,
      status: ad.status,
      message: `Ad is now ${ad.status}!`,
    };
  } catch (err: unknown) {
    console.error("toggleAdStatusAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle status.",
    };
  }
}

export async function deleteAdAction(id: string) {
  try {
    await requireRole([Role.SUPER_ADMIN, Role.ADMIN]);
    await connectToDatabase();

    await Ad.findByIdAndDelete(id);

    revalidatePath("/dashboard/ads");
    revalidatePath("/");
    revalidatePath("/blog");

    return {
      success: true,
      message: "Advertisement removed permanently.",
    };
  } catch (err: unknown) {
    console.error("deleteAdAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete ad.",
    };
  }
}

export async function trackAdClickAction(id: string) {
  try {
    await connectToDatabase();
    const ad = await Ad.findByIdAndUpdate(
      id,
      { $inc: { clicks: 1 } },
      { new: true }
    ).select("clicks targetUrl");

    return {
      success: true,
      clicks: ad?.clicks || 0,
      targetUrl: ad?.targetUrl,
    };
  } catch {
    return { success: false };
  }
}

export async function getActiveAdsAction(placement?: AdPlacement) {
  try {
    await connectToDatabase();
    const query: Record<string, any> = { status: "active" };
    if (placement) {
      query.placement = placement;
    }

    const ads = await Ad.find(query).sort({ updatedAt: -1 }).lean();
    return {
      success: true,
      ads: JSON.parse(JSON.stringify(ads)),
    };
  } catch (err: unknown) {
    return {
      success: false,
      ads: [],
      error: err instanceof Error ? err.message : "Failed to fetch ads",
    };
  }
}
