import { MetadataRoute } from "next";
import connectToDatabase from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { Category } from "@/models/Category";
import { PostStatus, DEFAULT_SITE_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = DEFAULT_SITE_URL;

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    await connectToDatabase();

    // Published posts
    const posts = await Post.find({
      status: PostStatus.PUBLISHED,
      allowIndex: { $ne: false },
    })
      .select("slug updatedAt publishedAt")
      .lean();

    const postRoutes: MetadataRoute.Sitemap = posts.map((p: any) => ({
      url: `${baseUrl}/blog/${p.slug}`,
      lastModified: p.updatedAt || p.publishedAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // Categories
    const categories = await Category.find().select("slug updatedAt").lean();
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c: any) => ({
      url: `${baseUrl}/category/${c.slug}`,
      lastModified: c.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...categoryRoutes, ...postRoutes];
  } catch (err) {
    console.error("Error generating sitemap:", err);
    return staticRoutes;
  }
}
