"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deletePostAction } from "@/actions/posts";

export function DeletePostButton({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post? This cannot be undone.")) {
      startTransition(async () => {
        const res = await deletePostAction(postId);
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
      title="Delete post"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
