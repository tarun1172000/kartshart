"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, FolderTree } from "lucide-react";
import { createCategoryAction, updateCategoryAction } from "@/actions/categories";
import { slugify } from "@/lib/utils";

interface CategoryFormModalProps {
  category?: {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    seoTitle?: string;
    seoDescription?: string;
  };
}

export function CategoryFormModal({ category }: CategoryFormModalProps) {
  const isEditing = Boolean(category?._id);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [description, setDescription] = useState(category?.description || "");
  const [seoTitle, setSeoTitle] = useState(category?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(category?.seoDescription || "");
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      setSlug(slugify(val));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    startTransition(async () => {
      const payload = {
        name: name.trim(),
        slug: slugify(slug || name),
        description: description.trim(),
        seoTitle: seoTitle.trim(),
        seoDescription: seoDescription.trim(),
      };

      let res;
      if (isEditing && category?._id) {
        res = await updateCategoryAction(category._id, payload);
      } else {
        res = await createCategoryAction(payload);
      }

      if (res.success) {
        setIsOpen(false);
        if (!isEditing) {
          setName("");
          setSlug("");
          setDescription("");
        }
      } else {
        setError(res.error || "Failed to save category.");
      }
    });
  };

  return (
    <>
      {isEditing ? (
        <button
          onClick={() => setIsOpen(true)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Edit Category"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white dark:bg-[#10121a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl"
          >
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                {isEditing ? "Edit Category" : "New Category"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Categories group editorial articles on the public website and navigation.
              </p>
            </div>

            {error && (
              <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Technology"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="technology"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Overview of this topic..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 disabled:opacity-50"
              >
                {isPending ? "Saving..." : isEditing ? "Update Category" : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
