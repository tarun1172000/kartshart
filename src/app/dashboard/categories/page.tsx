import { requireRole } from "@/lib/auth";
import { Role } from "@/lib/constants";
import connectToDatabase from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { Post } from "@/models/Post";
import { CategoryFormModal } from "@/components/dashboard/CategoryFormModal";
import { DeleteCategoryButton } from "@/components/dashboard/DeleteCategoryButton";

export default async function DashboardCategoriesPage() {
  await requireRole([Role.SUPER_ADMIN, Role.ADMIN]);
  await connectToDatabase();

  const categories = await Category.find().sort({ name: 1 }).lean();

  const categoriesWithCounts = await Promise.all(
    categories.map(async (c: any) => {
      const count = await Post.countDocuments({ categoryId: c._id });
      return {
        _id: c._id.toString(),
        name: c.name,
        slug: c.slug,
        description: c.description,
        seoTitle: c.seoTitle,
        seoDescription: c.seoDescription,
        postCount: count,
      };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
            Editorial Categories
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize articles into thematic silos for readers, navigation, and SEO breadcrumbs.
          </p>
        </div>

        <CategoryFormModal />
      </div>

      <div className="bg-white dark:bg-[#10121a] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Category Name</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Articles Count</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {categoriesWithCounts.map((cat) => (
                <tr key={cat._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                  <td className="py-4 px-4 font-serif font-bold text-slate-900 dark:text-white text-sm">
                    {cat.name}
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-500">
                    /category/{cat.slug}
                  </td>
                  <td className="py-4 px-4 text-slate-500 max-w-xs truncate">
                    {cat.description || "—"}
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-900 dark:text-slate-100 font-semibold">
                    {cat.postCount}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <CategoryFormModal category={cat} />
                      <DeleteCategoryButton categoryId={cat._id} postCount={cat.postCount} />
                    </div>
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
