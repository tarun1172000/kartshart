"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import connectToDatabase from "@/lib/mongodb";
import { Post, IPost } from "@/models/Post";
import { Category } from "@/models/Category";
import { requireUser } from "@/lib/auth";
import { Role, PostStatus } from "@/lib/constants";
import { sanitizeContent, stripHtml } from "@/lib/sanitize";
import {
  slugify,
  calculateReadingTime,
  extractExcerpt,
  isValidImageUrl,
} from "@/lib/utils";

const FaqItemSchema = z.object({
  question: z.string().min(3).trim(),
  answer: z.string().min(3).trim(),
});

const PostInputSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").trim(),
  slug: z.string().min(2, "Slug is required").trim(),
  excerpt: z.string().max(300).optional(),
  contentHtml: z.string().min(10, "Article content must be at least 10 characters"),
  coverImageUrl: z.string().refine(isValidImageUrl, {
    message: "Cover image must be a valid HTTP or HTTPS URL (e.g. Unsplash or Cloudinary)",
  }),
  coverImageAlt: z.string().min(2, "Image alt text is required for accessibility and SEO").trim(),
  coverImageCredit: z.string().optional(),
  categoryId: z.string().min(1, "Please select a category"),
  tags: z.array(z.string()).default([]),
  status: z.nativeEnum(PostStatus).default(PostStatus.DRAFT),
  featured: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  ogImageUrl: z.string().optional(),
  canonicalUrl: z.string().optional(),
  faq: z.array(FaqItemSchema).default([]),
  keyTakeaways: z.array(z.string()).default([]),
  geoFocus: z.array(z.string()).default([]),
  language: z.enum(["en", "hi"]).default("en"),
  allowIndex: z.boolean().default(true),
});

export async function createPostAction(rawInput: unknown) {
  try {
    const user = await requireUser();
    await connectToDatabase();

    const parseResult = PostInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.errors[0].message };
    }

    const data = parseResult.data;

    // Check slug uniqueness
    const normalizedSlug = slugify(data.slug || data.title);
    const existingPost = await Post.findOne({ slug: normalizedSlug });
    if (existingPost) {
      return {
        success: false,
        error: "A post with this slug already exists. Please choose a unique title or slug.",
      };
    }

    // Verify category exists
    const category = await Category.findById(data.categoryId);
    if (!category) {
      return { success: false, error: "Selected category does not exist." };
    }

    // Role permissions check
    let finalStatus = data.status;
    if (user.role === Role.EDITOR && data.status === PostStatus.PUBLISHED) {
      // Editors save as draft for admin review by default
      finalStatus = PostStatus.DRAFT;
    }

    // Sanitize HTML and extract plain text
    const sanitizedHtml = sanitizeContent(data.contentHtml);
    const plainText = stripHtml(sanitizedHtml);
    const excerpt = data.excerpt?.trim() || extractExcerpt(plainText, 180);
    const readingTime = calculateReadingTime(plainText);

    const post = await Post.create({
      title: data.title,
      slug: normalizedSlug,
      excerpt,
      contentHtml: sanitizedHtml,
      contentText: plainText,
      coverImageUrl: data.coverImageUrl,
      coverImageAlt: data.coverImageAlt,
      coverImageCredit: data.coverImageCredit || "",
      authorId: user._id,
      authorName: user.name,
      categoryId: category._id,
      tags: data.tags.map((t) => slugify(t)),
      status: finalStatus,
      featured: data.featured,
      publishedAt: finalStatus === PostStatus.PUBLISHED ? new Date() : undefined,
      readingTimeMinutes: readingTime,
      seoTitle: data.seoTitle || data.title,
      seoDescription: data.seoDescription || excerpt,
      ogImageUrl: data.ogImageUrl || data.coverImageUrl,
      canonicalUrl: data.canonicalUrl,
      faq: data.faq,
      keyTakeaways: data.keyTakeaways.filter(Boolean),
      geoFocus: data.geoFocus.filter(Boolean),
      language: data.language,
      allowIndex: data.allowIndex,
      viewCount: 0,
    });

    // Revalidate paths
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/sitemap.xml");
    revalidatePath("/rss.xml");
    revalidatePath(`/category/${category.slug}`);

    return {
      success: true,
      postId: post._id.toString(),
      slug: post.slug,
      message:
        finalStatus === PostStatus.PUBLISHED
          ? "Post published successfully!"
          : "Draft saved successfully!",
    };
  } catch (err: unknown) {
    console.error("createPostAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create post.",
    };
  }
}

export async function updatePostAction(id: string, rawInput: unknown) {
  try {
    const user = await requireUser();
    await connectToDatabase();

    const post = await Post.findById(id);
    if (!post) {
      return { success: false, error: "Post not found." };
    }

    // Role check: Editors can only edit their own posts
    if (
      user.role === Role.EDITOR &&
      post.authorId.toString() !== user._id.toString()
    ) {
      return {
        success: false,
        error: "You can only edit posts that you created.",
      };
    }

    const parseResult = PostInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.errors[0].message };
    }

    const data = parseResult.data;
    const normalizedSlug = slugify(data.slug || data.title);

    // If slug changed, verify uniqueness
    if (normalizedSlug !== post.slug) {
      const slugConflict = await Post.findOne({
        slug: normalizedSlug,
        _id: { $ne: post._id },
      });
      if (slugConflict) {
        return {
          success: false,
          error: "A post with this slug already exists. Please choose a different slug.",
        };
      }
    }

    // Check category
    const category = await Category.findById(data.categoryId);
    if (!category) {
      return { success: false, error: "Selected category does not exist." };
    }

    let finalStatus = data.status;
    if (user.role === Role.EDITOR && data.status === PostStatus.PUBLISHED) {
      // If was not already published by admin, keep draft
      if (post.status !== PostStatus.PUBLISHED) {
        finalStatus = PostStatus.DRAFT;
      }
    }

    const sanitizedHtml = sanitizeContent(data.contentHtml);
    const plainText = stripHtml(sanitizedHtml);
    const excerpt = data.excerpt?.trim() || extractExcerpt(plainText, 180);
    const readingTime = calculateReadingTime(plainText);

    const oldSlug = post.slug;

    post.title = data.title;
    post.slug = normalizedSlug;
    post.excerpt = excerpt;
    post.contentHtml = sanitizedHtml;
    post.contentText = plainText;
    post.coverImageUrl = data.coverImageUrl;
    post.coverImageAlt = data.coverImageAlt;
    post.coverImageCredit = data.coverImageCredit || "";
    post.categoryId = category._id;
    post.tags = data.tags.map((t) => slugify(t));
    post.featured = data.featured;
    post.readingTimeMinutes = readingTime;
    post.seoTitle = data.seoTitle || data.title;
    post.seoDescription = data.seoDescription || excerpt;
    post.ogImageUrl = data.ogImageUrl || data.coverImageUrl;
    post.canonicalUrl = data.canonicalUrl;
    post.faq = data.faq;
    post.keyTakeaways = data.keyTakeaways.filter(Boolean);
    post.geoFocus = data.geoFocus.filter(Boolean);
    post.language = data.language;
    post.allowIndex = data.allowIndex;

    // Handle published date
    if (finalStatus === PostStatus.PUBLISHED && !post.publishedAt) {
      post.publishedAt = new Date();
    }
    post.status = finalStatus;

    await post.save();

    // Revalidate paths
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath(`/blog/${oldSlug}`);
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/sitemap.xml");
    revalidatePath("/rss.xml");
    revalidatePath(`/category/${category.slug}`);

    return {
      success: true,
      postId: post._id.toString(),
      slug: post.slug,
      message: "Post updated successfully!",
    };
  } catch (err: unknown) {
    console.error("updatePostAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update post.",
    };
  }
}

export async function deletePostAction(id: string) {
  try {
    const user = await requireUser();
    await connectToDatabase();

    const post = await Post.findById(id);
    if (!post) {
      return { success: false, error: "Post not found." };
    }

    if (
      user.role === Role.EDITOR &&
      post.authorId.toString() !== user._id.toString()
    ) {
      return {
        success: false,
        error: "You can only delete your own draft posts.",
      };
    }

    await Post.findByIdAndDelete(id);

    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/sitemap.xml");
    revalidatePath("/rss.xml");

    return { success: true, message: "Post deleted successfully." };
  } catch (err: unknown) {
    console.error("deletePostAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete post.",
    };
  }
}

/**
 * Increment view count (fire-and-forget for public reading page)
 */
export async function incrementPostViewAction(slug: string) {
  try {
    await connectToDatabase();
    await Post.updateOne(
      { slug, status: PostStatus.PUBLISHED },
      { $inc: { viewCount: 1 } }
    );
    return { success: true };
  } catch {
    return { success: false };
  }
}
