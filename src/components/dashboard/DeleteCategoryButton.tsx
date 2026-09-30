"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteCategoryAction } from "@/actions/categories";

export function DeleteCategoryButton({
  categoryId,
  postCount,
}: {
  categoryId: string;
  postCount: number;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (postCount > 0) {
      alert(
        `Cannot delete this category because ${postCount} article(s) are assigned to it. Please reassign those articles first.`
      );
      return;
    }

    if (confirm("Are you sure you want to delete this category?")) {
      startTransition(async () => {
        const res = await deleteCategoryAction(categoryId);
        if (!res.success) {
          alert(res.error);
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors disabled:opacity-50"
      title="Delete Category"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
