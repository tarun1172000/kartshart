import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FolderTree } from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { Post } from "@/models/Post";
import { PostStatus, SITE_NAME, DEFAULT_SITE_URL } from "@/lib/constants";
import { PostCard } from "@/components/public/PostCard";
import { BreadcrumbsJsonLd } from "@/components/public/JsonLd";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectToDatabase();

  const category = await Category.findOne({ slug }).lean();
  if (!category) {
    return { title: "Category Not Found" };
  }

  const title = category.seoTitle || `${category.name} Articles`;
  const description =
    category.seoDescription ||
    category.description ||
    `Browse all articles in the ${category.name} category on ${SITE_NAME}.`;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: {
      canonical: `${DEFAULT_SITE_URL}/category/${category.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${DEFAULT_SITE_URL}/category/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  await connectToDatabase();

  const category = await Category.findOne({ slug }).lean();
  if (!category) {
    notFound();
  }

  const posts = await Post.find({
    categoryId: category._id,
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
    category: { name: category.name, slug: category.slug },
    publishedAt: p.publishedAt,
    readingTimeMinutes: p.readingTimeMinutes || 3,
    featured: p.featured,
    geoFocus: p.geoFocus,
  }));

  const breadcrumbs = [
    { name: "Home", url: DEFAULT_SITE_URL },
    { name: "Categories", url: `${DEFAULT_SITE_URL}/blog` },
    { name: category.name, url: `${DEFAULT_SITE_URL}/category/${category.slug}` },
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
            <FolderTree className="w-4 h-4" />
            <span>Category Archive</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">
            {category.name}
          </h1>

          {category.description && (
            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
              {category.description}
            </p>
          )}
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
              No published articles yet in this category
            </h3>
            <p className="text-sm text-slate-500">
              Articles for this topic are currently in editorial drafting.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
