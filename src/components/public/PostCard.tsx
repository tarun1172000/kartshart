import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar, ArrowRight, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface PostCardData {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  coverImageAlt: string;
  authorName?: string;
  category?: {
    name: string;
    slug: string;
  };
  publishedAt?: Date | string;
  readingTimeMinutes?: number;
  featured?: boolean;
  tags?: string[];
  geoFocus?: string[];
}

interface PostCardProps {
  post: PostCardData;
  variant?: "standard" | "hero" | "compact";
}

export function PostCard({ post, variant = "standard" }: PostCardProps) {
  const categoryName = post.category?.name || "General";
  const categorySlug = post.category?.slug || "general";
  const formattedDate = formatDate(post.publishedAt);

  if (variant === "hero") {
    return (
      <article className="group relative rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#10121a] shadow-sm hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12">
        {/* Cover Image Container */}
        <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto min-h-[340px] overflow-hidden bg-slate-100 dark:bg-slate-900">
          <Image
            src={post.coverImageUrl}
            alt={post.coverImageAlt || post.title}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:hidden" />
          <div className="absolute top-4 left-4 z-10">
            <Link
              href={`/category/${categorySlug}`}
              className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-amber-500 text-slate-950 shadow-md hover:bg-amber-400 transition-colors"
            >
              {categoryName}
            </Link>
          </div>
        </div>

        {/* Content Container */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href={`/category/${categorySlug}`}
                className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/25 transition-colors"
              >
                {categoryName}
              </Link>
              {post.geoFocus && post.geoFocus.length > 0 && (
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  • Focus: {post.geoFocus.join(", ")}
                </span>
              )}
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
              <Link href={`/blog/${post.slug}`} className="focus:outline-none">
                {post.title}
              </Link>
            </h2>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-3">
              {post.excerpt}
            </p>
          </div>

          {/* Metadata Footer */}
          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <User className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {post.authorName || "Editorial Desk"}
                </p>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  {formattedDate && <span>{formattedDate}</span>}
                  <span>•</span>
                  <span>{post.readingTimeMinutes || 4} min read</span>
                </div>
              </div>
            </div>

            <Link
              href={`/blog/${post.slug}`}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors"
              aria-label={`Read article: ${post.title}`}
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group flex gap-4 items-start p-3 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-all">
        <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
          <Image
            src={post.coverImageUrl}
            alt={post.coverImageAlt || post.title}
            fill
            sizes="96px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            {categoryName}
          </span>
          <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            {formattedDate && <span>{formattedDate}</span>}
            <span>•</span>
            <span>{post.readingTimeMinutes || 3} min read</span>
          </div>
        </div>
      </article>
    );
  }

  // Standard Card
  return (
    <article className="group flex flex-col rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#10121a] shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {/* Cover Image */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
        <Image
          src={post.coverImageUrl}
          alt={post.coverImageAlt || post.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-400 ease-out"
        />
        <div className="absolute top-3 left-3 z-10">
          <Link
            href={`/category/${categorySlug}`}
            className="inline-block px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-full bg-white/95 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 backdrop-blur-xs shadow-xs hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            {categoryName}
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            {formattedDate && <span>{formattedDate}</span>}
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>{post.readingTimeMinutes || 3} min</span>
            </span>
          </div>

          <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
            <Link href={`/blog/${post.slug}`} className="focus:outline-none">
              {post.title}
            </Link>
          </h3>

          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {post.authorName || "Kartshart Editorial"}
          </span>
          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform">
            Read <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </article>
  );
}
