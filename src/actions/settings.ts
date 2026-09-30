"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import connectToDatabase from "@/lib/mongodb";
import { SiteSettings } from "@/models/SiteSettings";
import { requireRole } from "@/lib/auth";
import { Role } from "@/lib/constants";

const SettingsSchema = z.object({
  siteName: z.string().min(2).default("Kartshart"),
  tagline: z.string().default(""),
  description: z.string().default(""),
  logoUrl: z.string().optional(),
  defaultOgImageUrl: z.string().optional(),
  twitterHandle: z.string().optional(),
  socialLinks: z
    .object({
      twitter: z.string().optional(),
      github: z.string().optional(),
      linkedin: z.string().optional(),
      instagram: z.string().optional(),
      youtube: z.string().optional(),
    })
    .optional(),
  contactEmail: z.string().email().optional(),
  gaId: z.string().optional(),
  searchConsole: z.string().optional(),
});

export async function updateSiteSettingsAction(rawInput: unknown) {
  try {
    await requireRole([Role.SUPER_ADMIN]);
    await connectToDatabase();

    const parseResult = SettingsSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.errors[0].message };
    }

    const data = parseResult.data;

    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings(data);
    } else {
      settings.siteName = data.siteName;
      settings.tagline = data.tagline;
      settings.description = data.description;
      settings.logoUrl = data.logoUrl;
      settings.defaultOgImageUrl = data.defaultOgImageUrl;
      settings.twitterHandle = data.twitterHandle;
      settings.socialLinks = data.socialLinks || {};
      settings.contactEmail = data.contactEmail || "tarunwaliya780@gmail.com";
      settings.gaId = data.gaId;
      settings.searchConsole = data.searchConsole;
    }

    await settings.save();

    revalidatePath("/");
    revalidatePath("/dashboard/settings");

    return { success: true, message: "Site settings updated successfully!" };
  } catch (err: unknown) {
    console.error("updateSiteSettingsAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update settings.",
    };
  }
}
