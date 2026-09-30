import Link from "next/link";
import {
  FileText,
  Eye,
  FolderTree,
  UserCheck,
  PlusCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
} from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { Category } from "@/models/Category";
import { AccessRequest, AccessRequestStatus } from "@/models/AccessRequest";
import { requireUser } from "@/lib/auth";
import { Role, PostStatus } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default async function DashboardOverviewPage() {
  const user = await requireUser();
  await connectToDatabase();

  const isSuperAdmin = user.role === Role.SUPER_ADMIN;

  // Aggregate stats
  const [
    publishedCount,
    draftsCount,
    categoriesCount,
    pendingRequestsCount,
    recentPosts,
    viewAggregation,
  ] = await Promise.all([
    Post.countDocuments({ status: PostStatus.PUBLISHED }),
    Post.countDocuments({ status: PostStatus.DRAFT }),
    Category.countDocuments(),
    isSuperAdmin
      ? AccessRequest.countDocuments({ status: AccessRequestStatus.PENDING })
      : 0,
    Post.find()
      .populate("categoryId", "name")
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean(),
    Post.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$viewCount" } } },
    ]),
  ]);

  const totalViews = viewAggregation[0]?.totalViews || 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-slate-900 to-slate-800 text-white dark:from-[#11131a] dark:to-[#161924] border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Editorial Workspace</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Welcome back, {user.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
            Manage your articles, categories, and editorial queue. All blogs on Kartshart are created strictly from this studio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/posts/new"
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Write New Post</span>
          </Link>
        </div>
      </div>

      {/* Super Admin Notice for Pending Access Requests */}
      {isSuperAdmin && pendingRequestsCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              {pendingRequestsCount}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Pending Contributor Access Requests
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                You have {pendingRequestsCount} applicant(s) awaiting review.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/access-requests"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shrink-0"
          >
            Review Requests &rarr;
          </Link>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#10121a] border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Published Posts
            </span>
            <FileText className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-serif font-black text-slate-900 dark:text-white">
            {publishedCount}
          </div>
          <p className="text-[11px] text-slate-500">Live on kartshart.com</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#10121a] border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Draft Posts
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-serif font-black text-slate-900 dark:text-white">
            {draftsCount}
          </div>
          <p className="text-[11px] text-slate-500">In editorial preparation</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#10121a] border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Article Views
            </span>
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-serif font-black text-slate-900 dark:text-white">
            {totalViews.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500">Total reader views</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#10121a] border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Categories
            </span>
            <FolderTree className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-serif font-black text-slate-900 dark:text-white">
            {categoriesCount}
          </div>
          <p className="text-[11px] text-slate-500">Active content topics</p>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white dark:bg-[#10121a] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
              Recently Edited Articles
            </h2>
            <p className="text-xs text-slate-500">
              Latest modifications in your editorial studio.
            </p>
          </div>
          <Link
            href="/dashboard/posts"
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>View all articles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-2">Article Title</th>
                <th className="py-3 px-2">Category</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2">Views</th>
                <th className="py-3 px-2">Last Modified</th>
                <th className="py-3 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {recentPosts.map((p: any) => (
                <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                  <td className="py-3 px-2 font-serif font-bold text-slate-900 dark:text-white max-w-xs truncate">
                    {p.title}
                  </td>
                  <td className="py-3 px-2 text-slate-500">
                    {p.categoryId?.name || "General"}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.status === PostStatus.PUBLISHED
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : p.status === PostStatus.DRAFT
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                          : "bg-slate-500/15 text-slate-700 dark:text-slate-400"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-mono text-slate-500">
                    {p.viewCount || 0}
                  </td>
                  <td className="py-3 px-2 text-slate-500">
                    {formatDate(p.updatedAt)}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <Link
                      href={`/dashboard/posts/${p._id}/edit`}
                      className="px-2.5 py-1 rounded-md text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
