import Link from "next/link";
import { ArrowRight, Sparkles, Compass, TrendingUp, ShieldCheck } from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { Category } from "@/models/Category";
import { PostStatus } from "@/lib/constants";
import { ensureDatabaseSeeded } from "@/lib/seed";
import { PostCard } from "@/components/public/PostCard";
import { WebsiteJsonLd } from "@/components/public/JsonLd";

export const revalidate = 60;

export default async function HomePage() {
  await connectToDatabase();
  await ensureDatabaseSeeded();

  // Fetch featured post
  let featuredPost = await Post.findOne({
    status: PostStatus.PUBLISHED,
    featured: true,
  })
    .populate("categoryId", "name slug")
    .sort({ publishedAt: -1 })
    .lean();

  // If no featured post explicitly flagged, pick latest published post
  if (!featuredPost) {
    featuredPost = await Post.findOne({ status: PostStatus.PUBLISHED })
      .populate("categoryId", "name slug")
      .sort({ publishedAt: -1 })
      .lean();
  }

  // Fetch latest posts excluding the featured post
  const latestPosts = await Post.find({
    status: PostStatus.PUBLISHED,
    _id: featuredPost ? { $ne: featuredPost._id } : { $exists: true },
  })
    .populate("categoryId", "name slug")
    .sort({ publishedAt: -1 })
    .limit(6)
    .lean();

  // Fetch categories with active post count
  const categories = await Category.find().lean();
  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat) => {
      const count = await Post.countDocuments({
        categoryId: cat._id,
        status: PostStatus.PUBLISHED,
      });
      return {
        ...cat,
        postCount: count,
      };
    })
  );

  // Transform mongo objects
  const formatPost = (p: any) => ({
    _id: p._id.toString(),
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    coverImageUrl: p.coverImageUrl,
    coverImageAlt: p.coverImageAlt,
    authorName: p.authorName || "Kartshart Editorial Desk",
    category: p.categoryId
      ? { name: p.categoryId.name, slug: p.categoryId.slug }
      : { name: "Editorial", slug: "editorial" },
    publishedAt: p.publishedAt,
    readingTimeMinutes: p.readingTimeMinutes || 3,
    featured: p.featured,
    geoFocus: p.geoFocus,
  });

  const formattedFeatured = featuredPost ? formatPost(featuredPost) : null;
  const formattedLatest = latestPosts.map(formatPost);

  return (
    <>
      <WebsiteJsonLd />

      <div className="space-y-16 sm:space-y-24 pb-20">
        {/* Brand Hero Banner */}
        <section className="relative pt-12 pb-8 sm:pt-16 sm:pb-12 border-b border-slate-200/80 dark:border-slate-800/80 bg-linear-to-b from-slate-50/50 to-transparent dark:from-slate-950/40 dark:to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Modern Editorial & Deep Perspectives</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Insightful analyses on technology, business, and India’s digital future.
              </h1>

              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                Kartshart delivers long-form essays, architecture breakdowns, and editorial perspectives for thoughtful readers and practitioners.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Story Hero */}
        {formattedFeatured && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                <TrendingUp className="w-4 h-4" />
                <span>Featured Lead Story</span>
              </div>
            </div>
            <PostCard post={formattedFeatured} variant="hero" />
          </section>
        )}

        {/* Latest Dispatches Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Latest Dispatches
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Recent articles across tech, business, and culture.
              </p>
            </div>

            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400 group"
            >
              <span>Browse all articles</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {formattedLatest.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {formattedLatest.map((post) => (
                <PostCard key={post._id} post={post} variant="standard" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              More articles are in editorial review.
            </div>
          )}
        </section>

        {/* Category Showcase Rail */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white dark:bg-[#10121a] border border-slate-800 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  Topic Archives
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                  Explore by Category
                </h3>
              </div>
              <p className="text-sm text-slate-400 max-w-sm">
                Curated collections covering the entire technology and business landscape.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-4">
              {categoriesWithCounts.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="group p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/50 transition-all"
                >
                  <h4 className="font-serif font-bold text-lg text-white group-hover:text-amber-400 transition-colors">
                    {cat.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {cat.postCount} {cat.postCount === 1 ? "article" : "articles"}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* About-Lite Strip */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10121a]">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Editorial Philosophy
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                High-signal journalism without the noise.
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                Kartshart is built around the idea that modern readers deserve clarity, depth, and rigorous perspective. Our essays focus on structural shifts in digital commerce, infrastructure scale, and creator economics.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link
                href="/about"
                className="w-full text-center px-6 py-3 rounded-xl text-sm font-semibold bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 transition-colors"
              >
                Read About Kartshart
              </Link>
              <Link
                href="/contact"
                className="w-full text-center px-6 py-3 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Get in Touch & Pitch
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
