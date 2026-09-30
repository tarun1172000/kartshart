"use client";

import { useState, useTransition } from "react";
import { Plus, Tag, Trash2 } from "lucide-react";
import { createTagAction, deleteTagAction } from "@/actions/tags";

interface TagData {
  _id: string;
  name: string;
  slug: string;
  postCount: number;
}

export function TagManagerClient({ initialTags }: { initialTags: TagData[] }) {
  const [tags, setTags] = useState<TagData[]>(initialTags);
  const [newTagName, setNewTagName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    startTransition(async () => {
      const res = await createTagAction(newTagName.trim());
      if (res.success && res.tag) {
        setTags([...tags, { ...res.tag, postCount: 0 }]);
        setNewTagName("");
      } else {
        alert(res.error);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this tag?")) {
      startTransition(async () => {
        const res = await deleteTagAction(id);
        if (res.success) {
          setTags(tags.filter((t) => t._id !== id));
        } else {
          alert(res.error);
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="flex gap-3 max-w-md bg-white dark:bg-[#10121a] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs"
      >
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="New tag name (e.g. Artificial Intelligence)"
          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
        />
        <button
          type="submit"
          disabled={isPending || !newTagName.trim()}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Tag</span>
        </button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {tags.map((tag) => (
          <div
            key={tag._id}
            className="p-4 rounded-2xl bg-white dark:bg-[#10121a] border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs"
          >
            <div>
              <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-slate-900 dark:text-white">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span>{tag.name}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                #{tag.slug} ({tag.postCount} {tag.postCount === 1 ? "post" : "posts"})
              </span>
            </div>

            <button
              onClick={() => handleDelete(tag._id)}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
              title="Delete Tag"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
