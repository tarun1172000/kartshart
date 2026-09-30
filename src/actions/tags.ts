"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import connectToDatabase from "@/lib/mongodb";
import { Tag } from "@/models/Tag";
import { requireRole } from "@/lib/auth";
import { Role } from "@/lib/constants";
import { slugify } from "@/lib/utils";

const TagSchema = z.object({
  name: z.string().min(2, "Tag name is required").trim(),
});

export async function createTagAction(rawName: string) {
  try {
    await requireRole([Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR]);
    await connectToDatabase();

    const parseResult = TagSchema.safeParse({ name: rawName });
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.errors[0].message };
    }

    const name = parseResult.data.name;
    const slug = slugify(name);

    let tag = await Tag.findOne({ slug });
    if (!tag) {
      tag = await Tag.create({ name, slug });
    }

    revalidatePath("/dashboard/tags");
    revalidatePath("/dashboard/posts/new");

    return {
      success: true,
      tag: JSON.parse(JSON.stringify(tag)),
      message: "Tag added successfully!",
    };
  } catch (err: unknown) {
    console.error("createTagAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create tag.",
    };
  }
}

export async function deleteTagAction(id: string) {
  try {
    await requireRole([Role.SUPER_ADMIN, Role.ADMIN]);
    await connectToDatabase();

    await Tag.findByIdAndDelete(id);

    revalidatePath("/dashboard/tags");
    return { success: true, message: "Tag deleted successfully." };
  } catch (err: unknown) {
    console.error("deleteTagAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete tag.",
    };
  }
}
