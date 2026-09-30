import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Tag as TagIcon } from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { PostStatus, SITE_NAME, DEFAULT_SITE_URL } from "@/lib/constants";
import { PostCard } from "@/components/public/PostCard";
import { BreadcrumbsJsonLd } from "@/components/public/JsonLd";

interface TagPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);

  return {
    title: `Articles Tagged #${decoded} | ${SITE_NAME}`,
    description: `Browse all articles and essays tagged #${decoded} on ${SITE_NAME}.`,
    alternates: {
      canonical: `${DEFAULT_SITE_URL}/tag/${slug}`,
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);

  await connectToDatabase();

  const posts = await Post.find({
    tags: decoded.toLowerCase(),
    status: PostStatus.PUBLISHED,
  })
    .populate("categoryId", "name slug")
    .sort({ publishedAt: -1 })
    .lean();

  const formattedPosts = posts.map((p: any) => ({
    _id: p._id.toString(),
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    coverImageUrl: p.coverImageUrl,
    coverImageAlt: p.coverImageAlt,
    authorName: p.authorName || "Kartshart Editorial Desk",
    category: p.categoryId
      ? { name: p.categoryId.name, slug: p.categoryId.slug }
      : { name: "General", slug: "general" },
    publishedAt: p.publishedAt,
    readingTimeMinutes: p.readingTimeMinutes || 3,
  }));

  const breadcrumbs = [
    { name: "Home", url: DEFAULT_SITE_URL },
    { name: "Tags", url: `${DEFAULT_SITE_URL}/blog` },
    { name: `#${decoded}`, url: `${DEFAULT_SITE_URL}/tag/${slug}` },
  ];

  return (
    <>
      <BreadcrumbsJsonLd items={breadcrumbs} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        <div className="space-y-4 max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Articles</span>
          </Link>

          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest">
            <TagIcon className="w-4 h-4" />
            <span>Topic Tag</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">
            #{decoded}
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-base">
            Showing all published dispatches tagged with #{decoded}.
          </p>
        </div>

        {formattedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {formattedPosts.map((post) => (
              <PostCard key={post._id} post={post} variant="standard" />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-[#10121a] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
              No articles found for #{decoded}
            </h3>
            <p className="text-sm text-slate-500">
              Try searching with another keyword or explore categories.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
