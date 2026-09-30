"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import connectToDatabase from "@/lib/mongodb";
import { MediaAsset } from "@/models/MediaAsset";
import { requireUser } from "@/lib/auth";
import { isValidImageUrl } from "@/lib/utils";

const MediaAssetSchema = z.object({
  title: z.string().optional(),
  url: z.string().refine(isValidImageUrl, {
    message: "Must be a valid HTTP or HTTPS image URL.",
  }),
  alt: z.string().min(2, "Alt text is required for accessibility").trim(),
  credit: z.string().optional(),
});

export async function saveMediaAssetAction(rawInput: unknown) {
  try {
    const user = await requireUser();
    await connectToDatabase();

    const parseResult = MediaAssetSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.errors[0].message };
    }

    const data = parseResult.data;

    const asset = await MediaAsset.create({
      title: data.title || data.alt,
      url: data.url,
      alt: data.alt,
      credit: data.credit || "",
      createdBy: user._id,
    });

    revalidatePath("/dashboard/media");

    return {
      success: true,
      asset: JSON.parse(JSON.stringify(asset)),
      message: "Image URL saved to media library!",
    };
  } catch (err: unknown) {
    console.error("saveMediaAssetAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save image record.",
    };
  }
}

export async function deleteMediaAssetAction(id: string) {
  try {
    await requireUser();
    await connectToDatabase();

    await MediaAsset.findByIdAndDelete(id);
    revalidatePath("/dashboard/media");

    return { success: true, message: "Media asset removed." };
  } catch (err: unknown) {
    console.error("deleteMediaAssetAction error:", err);
    return { success: false, error: "Failed to delete media asset." };
  }
}
