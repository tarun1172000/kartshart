import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, Calendar, User, ArrowLeft, Tag, Share2, Globe, ShieldCheck } from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { Category } from "@/models/Category";
import { PostStatus, SITE_NAME, DEFAULT_SITE_URL } from "@/lib/constants";
import { formatDate, getBaseUrl } from "@/lib/utils";
import { KeyTakeaways } from "@/components/public/KeyTakeaways";
import { FaqSection } from "@/components/public/FaqSection";
import { PostCard } from "@/components/public/PostCard";
import {
  ArticleJsonLd,
  FaqJsonLd,
  BreadcrumbsJsonLd,
} from "@/components/public/JsonLd";
import { ReadingProgressBar } from "@/components/ui/ReadingProgressBar";
import { incrementPostViewAction } from "@/actions/posts";

export const revalidate = 60;

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  try {
    await connectToDatabase();
    const posts = await Post.find({ status: PostStatus.PUBLISHED })
      .select("slug")
      .lean();
    return posts.map((p: any) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectToDatabase();

  const post = await Post.findOne({ slug, status: PostStatus.PUBLISHED })
    .populate("categoryId", "name")
    .lean();

  if (!post) {
    return {
      title: "Article Not Found",
    };
  }

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const canonical = post.canonicalUrl || `${DEFAULT_SITE_URL}/blog/${post.slug}`;
  const ogImage = post.ogImageUrl || post.coverImageUrl;
  const categoryName = (post.categoryId as any)?.name || "Editorial";

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: post.allowIndex !== false,
      follow: post.allowIndex !== false,
      googleBot: {
        index: post.allowIndex !== false,
        follow: post.allowIndex !== false,
      },
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      publishedTime: post.publishedAt
        ? new Date(post.publishedAt).toISOString()
        : undefined,
      modifiedTime: post.updatedAt
        ? new Date(post.updatedAt).toISOString()
        : undefined,
      authors: [post.authorName || "Kartshart Editorial Desk"],
      section: categoryName,
      tags: post.tags || [],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.coverImageAlt || title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: "@kartshart",
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  await connectToDatabase();

  const post = await Post.findOne({ slug, status: PostStatus.PUBLISHED })
    .populate("categoryId", "name slug")
    .lean();

  if (!post) {
    notFound();
  }

  // Trigger view count fire-and-forget
  incrementPostViewAction(slug).catch(() => {});

  const category = (post.categoryId as any) || {
    name: "General",
    slug: "general",
  };
  const formattedPublishedDate = formatDate(post.publishedAt);
  const formattedUpdatedDate = formatDate(post.updatedAt);
  const articleUrl = `${DEFAULT_SITE_URL}/blog/${post.slug}`;

  // Related posts from same category
  const relatedPosts = await Post.find({
    status: PostStatus.PUBLISHED,
    categoryId: category._id,
    _id: { $ne: post._id },
  })
    .populate("categoryId", "name slug")
    .sort({ publishedAt: -1 })
    .limit(3)
    .lean();

  const formattedRelated = relatedPosts.map((p: any) => ({
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
    { name: "Blog", url: `${DEFAULT_SITE_URL}/blog` },
    { name: category.name, url: `${DEFAULT_SITE_URL}/category/${category.slug}` },
    { name: post.title, url: articleUrl },
  ];

  return (
    <>
      <ReadingProgressBar />

      {/* JSON-LD Schemas for SEO, AEO, and GEO */}
      <ArticleJsonLd
        url={articleUrl}
        title={post.title}
        description={post.excerpt}
        coverImageUrl={post.coverImageUrl}
        publishedAt={post.publishedAt}
        updatedAt={post.updatedAt}
        authorName={post.authorName || "Kartshart Editorial Desk"}
        keywords={post.tags}
        articleBody={post.contentText}
      />
      <FaqJsonLd faq={post.faq} />
      <BreadcrumbsJsonLd items={breadcrumbs} />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
        {/* Back Link & Category */}
        <div className="flex items-center justify-between text-xs font-semibold">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Articles</span>
          </Link>

          <Link
            href={`/category/${category.slug}`}
            className="px-3 py-1 rounded-full uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/25 transition-colors"
          >
            {category.name}
          </Link>
        </div>

        {/* Header Block */}
        <header className="space-y-6 text-center sm:text-left">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            {post.title}
          </h1>

          {/* Speakable / Direct Answer Subtitle */}
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-serif italic">
            {post.excerpt}
          </p>

          {/* Author, Date, Reading Time, Geo Metadata Bar */}
          <div className="flex flex-wrap items-center gap-y-3 gap-x-6 py-4 border-y border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 font-semibold">
              <User className="w-4 h-4 text-amber-500" />
              <span>{post.authorName || "Kartshart Editorial Desk"}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Published {formattedPublishedDate}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{post.readingTimeMinutes || 3} min read</span>
            </div>

            {post.geoFocus && post.geoFocus.length > 0 && (
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                <Globe className="w-3.5 h-3.5" />
                <span>Focus: {post.geoFocus.join(", ")}</span>
              </div>
            )}
          </div>
        </header>

        {/* Cover Image */}
        <div className="space-y-2 -mx-4 sm:mx-0">
          <div className="relative h-[340px] sm:h-[480px] w-full sm:rounded-3xl overflow-hidden shadow-lg bg-slate-100 dark:bg-slate-900">
            <Image
              src={post.coverImageUrl}
              alt={post.coverImageAlt || post.title}
              fill
              priority
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
            />
          </div>
          {post.coverImageCredit && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-right italic">
              {post.coverImageCredit}
            </p>
          )}
        </div>

        {/* AEO Executive Summary & Key Takeaways */}
        {post.keyTakeaways && post.keyTakeaways.length > 0 && (
          <KeyTakeaways takeaways={post.keyTakeaways} />
        )}

        {/* Main Article Prose Content */}
        <div
          className="prose-editorial"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {/* Tags Section */}
        {post.tags && post.tags.length > 0 && (
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase text-slate-400 mr-2 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Tags:
            </span>
            {post.tags.map((t: string) => (
              <Link
                key={t}
                href={`/tag/${t}`}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500/20 hover:text-amber-600 transition-colors"
              >
                #{t}
              </Link>
            ))}
          </div>
        )}

        {/* AEO FAQ Section */}
        {post.faq && post.faq.length > 0 && <FaqSection faqList={post.faq} />}

        {/* Related Articles Strip */}
        {formattedRelated.length > 0 && (
          <section className="pt-12 border-t border-slate-200 dark:border-slate-800 space-y-6">
            <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
              Related in {category.name}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {formattedRelated.map((rel) => (
                <PostCard key={rel._id} post={rel} variant="compact" />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
