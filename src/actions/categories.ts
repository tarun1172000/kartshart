"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import connectToDatabase from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { Post } from "@/models/Post";
import { requireRole } from "@/lib/auth";
import { Role } from "@/lib/constants";
import { slugify } from "@/lib/utils";

const CategorySchema = z.object({
  name: z.string().min(2, "Category name is required").trim(),
  slug: z.string().optional(),
  description: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export async function createCategoryAction(rawInput: unknown) {
  try {
    await requireRole([Role.SUPER_ADMIN, Role.ADMIN]);
    await connectToDatabase();

    const parseResult = CategorySchema.safeParse(rawInput);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.errors[0].message };
    }

    const data = parseResult.data;
    const slug = slugify(data.slug || data.name);

    const exists = await Category.findOne({ slug });
    if (exists) {
      return { success: false, error: "A category with this slug already exists." };
    }

    const category = await Category.create({
      name: data.name,
      slug,
      description: data.description || "",
      seoTitle: data.seoTitle || `${data.name} | Kartshart`,
      seoDescription: data.seoDescription || data.description || "",
    });

    revalidatePath("/dashboard/categories");
    revalidatePath("/blog");
    revalidatePath("/");

    return {
      success: true,
      category: JSON.parse(JSON.stringify(category)),
      message: "Category created successfully!",
    };
  } catch (err: unknown) {
    console.error("createCategoryAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create category.",
    };
  }
}

export async function updateCategoryAction(id: string, rawInput: unknown) {
  try {
    await requireRole([Role.SUPER_ADMIN, Role.ADMIN]);
    await connectToDatabase();

    const parseResult = CategorySchema.safeParse(rawInput);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.errors[0].message };
    }

    const category = await Category.findById(id);
    if (!category) {
      return { success: false, error: "Category not found." };
    }

    const data = parseResult.data;
    const slug = slugify(data.slug || data.name);

    if (slug !== category.slug) {
      const exists = await Category.findOne({ slug, _id: { $ne: id } });
      if (exists) {
        return { success: false, error: "A category with this slug already exists." };
      }
    }

    category.name = data.name;
    category.slug = slug;
    category.description = data.description || "";
    category.seoTitle = data.seoTitle || `${data.name} | Kartshart`;
    category.seoDescription = data.seoDescription || data.description || "";

    await category.save();

    revalidatePath("/dashboard/categories");
    revalidatePath(`/category/${category.slug}`);
    revalidatePath("/blog");
    revalidatePath("/");

    return {
      success: true,
      message: "Category updated successfully!",
    };
  } catch (err: unknown) {
    console.error("updateCategoryAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update category.",
    };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await requireRole([Role.SUPER_ADMIN, Role.ADMIN]);
    await connectToDatabase();

    // Check if any posts are using this category
    const postsUsingCategory = await Post.countDocuments({ categoryId: id });
    if (postsUsingCategory > 0) {
      return {
        success: false,
        error: `Cannot delete this category because ${postsUsingCategory} post(s) are assigned to it. Reassign those posts first.`,
      };
    }

    await Category.findByIdAndDelete(id);

    revalidatePath("/dashboard/categories");
    revalidatePath("/blog");
    revalidatePath("/");

    return { success: true, message: "Category deleted successfully." };
  } catch (err: unknown) {
    console.error("deleteCategoryAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete category.",
    };
  }
}
