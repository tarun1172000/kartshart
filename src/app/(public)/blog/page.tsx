import type { Metadata } from "next";
import Link from "next/link";
import { Search, Filter, BookOpen } from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { Category } from "@/models/Category";
import { PostStatus, SITE_NAME } from "@/lib/constants";
import { PostCard } from "@/components/public/PostCard";
import { BreadcrumbsJsonLd } from "@/components/public/JsonLd";

export const metadata: Metadata = {
  title: "All Articles & Essays",
  description:
    "Explore in-depth articles, technology insights, business breakdowns, and cultural perspectives on Kartshart.",
  alternates: {
    canonical: "https://kartshart.com/blog",
  },
};

interface BlogPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    page?: string;
  }>;
}

export default async function BlogArchivePage({
  searchParams,
}: BlogPageProps) {
  const { q, category: categorySlug, tag, page } = await searchParams;

  await connectToDatabase();

  const currentPage = parseInt(page || "1", 10) || 1;
  const limit = 9;
  const skip = (currentPage - 1) * limit;

  // Build MongoDB query
  const query: any = { status: PostStatus.PUBLISHED };

  if (q) {
    query.$or = [
      { title: { $regex: q, $options: "i" } },
      { excerpt: { $regex: q, $options: "i" } },
      { contentText: { $regex: q, $options: "i" } },
    ];
  }

  let selectedCategory: any = null;
  if (categorySlug) {
    selectedCategory = await Category.findOne({ slug: categorySlug }).lean();
    if (selectedCategory) {
      query.categoryId = selectedCategory._id;
    }
  }

  if (tag) {
    query.tags = tag.toLowerCase();
  }

  const [posts, totalPosts, allCategories] = await Promise.all([
    Post.find(query)
      .populate("categoryId", "name slug")
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments(query),
    Category.find().lean(),
  ]);

  const totalPages = Math.ceil(totalPosts / limit);

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
    featured: p.featured,
    geoFocus: p.geoFocus,
  }));

  const breadcrumbs = [
    { name: "Home", url: "https://kartshart.com" },
    { name: "Blog", url: "https://kartshart.com/blog" },
  ];

  return (
    <>
      <BreadcrumbsJsonLd items={breadcrumbs} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        {/* Header Strip */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="font-serif text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">
            {selectedCategory
              ? `${selectedCategory.name} Articles`
              : tag
              ? `Articles Tagged #${tag}`
              : "Editorial Archive"}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-base">
            {selectedCategory?.description ||
              "Browse our full collection of articles, masterclasses, and in-depth analyses."}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white dark:bg-[#10121a] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Search Form */}
          <form method="GET" action="/blog" className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={q || ""}
              placeholder="Search by topic, keyword, or title..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
            {categorySlug && (
              <input type="hidden" name="category" value={categorySlug} />
            )}
          </form>

          {/* Categories Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Link
              href="/blog"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                !categorySlug
                  ? "bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              All Topics
            </Link>
            {allCategories.map((c: any) => (
              <Link
                key={c.slug}
                href={`/blog?category=${c.slug}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  categorySlug === c.slug
                    ? "bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        {formattedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {formattedPosts.map((post) => (
              <PostCard key={post._id} post={post} variant="standard" />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-[#10121a] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
              No matching articles found
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              We couldn’t find any published articles matching your criteria. Try adjusting your search keywords or topic filter.
            </p>
            <Link
              href="/blog"
              className="inline-block px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950"
            >
              Clear Filters
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-8">
            {currentPage > 1 && (
              <Link
                href={`/blog?page=${currentPage - 1}${
                  categorySlug ? `&category=${categorySlug}` : ""
                }${q ? `&q=${q}` : ""}`}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Previous
              </Link>
            )}

            <span className="text-xs text-slate-500 px-3">
              Page {currentPage} of {totalPages}
            </span>

            {currentPage < totalPages && (
              <Link
                href={`/blog?page=${currentPage + 1}${
                  categorySlug ? `&category=${categorySlug}` : ""
                }${q ? `&q=${q}` : ""}`}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
