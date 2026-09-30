import Link from "next/link";
import { PlusCircle, Search, Edit2, ExternalLink, Trash2, Eye } from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { Category } from "@/models/Category";
import { requireUser } from "@/lib/auth";
import { Role, PostStatus } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { DeletePostButton } from "@/components/dashboard/DeletePostButton";

interface PostsPageProps {
  searchParams: Promise<{
    status?: string;
    q?: string;
  }>;
}

export default async function DashboardPostsPage({
  searchParams,
}: PostsPageProps) {
  const { status: filterStatus, q } = await searchParams;

  const user = await requireUser();
  await connectToDatabase();

  const query: any = {};

  if (filterStatus && filterStatus !== "all") {
    query.status = filterStatus;
  }

  if (q) {
    query.$or = [
      { title: { $regex: q, $options: "i" } },
      { slug: { $regex: q, $options: "i" } },
    ];
  }

  // If role is EDITOR, show own posts only
  if (user.role === Role.EDITOR) {
    query.authorId = user._id;
  }

  const posts = await Post.find(query)
    .populate("categoryId", "name slug")
    .sort({ updatedAt: -1 })
    .lean();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
            Articles & Dispatches
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your articles, review drafts, and monitor live publishing status.
          </p>
        </div>

        <Link
          href="/dashboard/posts/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 shadow-xs transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Write Article</span>
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-[#10121a] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
          <Link
            href="/dashboard/posts"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              !filterStatus || filterStatus === "all"
                ? "bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            All Posts
          </Link>
          <Link
            href="/dashboard/posts?status=published"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterStatus === "published"
                ? "bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Published
          </Link>
          <Link
            href="/dashboard/posts?status=draft"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterStatus === "draft"
                ? "bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Drafts
          </Link>
          <Link
            href="/dashboard/posts?status=archived"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterStatus === "archived"
                ? "bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Archived
          </Link>
        </div>

        <form method="GET" action="/dashboard/posts" className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="Filter by title..."
            className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </form>
      </div>

      {/* Posts Table */}
      <div className="bg-white dark:bg-[#10121a] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Author</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Views</th>
                <th className="py-3.5 px-4">Updated</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {posts.map((post: any) => (
                <tr key={post._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                  <td className="py-4 px-4 max-w-sm">
                    <div className="font-serif font-bold text-slate-900 dark:text-white text-sm truncate">
                      {post.title}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 truncate block">
                      /blog/{post.slug}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-500">
                    {post.categoryId?.name || "General"}
                  </td>
                  <td className="py-4 px-4 text-slate-500">
                    {post.authorName || "Editorial Desk"}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        post.status === PostStatus.PUBLISHED
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : post.status === PostStatus.DRAFT
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                          : "bg-slate-500/15 text-slate-700 dark:text-slate-400"
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-500">
                    {post.viewCount || 0}
                  </td>
                  <td className="py-4 px-4 text-slate-500">
                    {formatDate(post.updatedAt)}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {post.status === PostStatus.PUBLISHED && (
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          title="View live article"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                      <Link
                        href={`/dashboard/posts/${post._id}/edit`}
                        className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-lg"
                        title="Edit article"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <DeletePostButton postId={post._id.toString()} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {posts.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              No articles match your query.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
