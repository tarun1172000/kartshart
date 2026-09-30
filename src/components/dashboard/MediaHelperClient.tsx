"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Link as LinkIcon, Copy, Check, Trash2, Plus, Image as ImageIcon } from "lucide-react";
import { isValidImageUrl } from "@/lib/utils";
import { saveMediaAssetAction, deleteMediaAssetAction } from "@/actions/media";

interface MediaItem {
  _id: string;
  title?: string;
  url: string;
  alt: string;
  credit?: string;
  createdAt: Date;
}

export function MediaHelperClient({ initialAssets }: { initialAssets: MediaItem[] }) {
  const [assets, setAssets] = useState<MediaItem[]>(initialAssets);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [title, setTitle] = useState("");
  const [credit, setCredit] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !isValidImageUrl(url)) {
      alert("Please provide a valid HTTP or HTTPS image URL.");
      return;
    }
    if (!alt.trim()) {
      alert("Alt text is required.");
      return;
    }

    startTransition(async () => {
      const res = await saveMediaAssetAction({
        url: url.trim(),
        alt: alt.trim(),
        title: title.trim(),
        credit: credit.trim(),
      });

      if (res.success && res.asset) {
        setAssets([res.asset, ...assets]);
        setUrl("");
        setAlt("");
        setTitle("");
        setCredit("");
      } else {
        alert(res.error);
      }
    });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm("Remove this saved media asset?")) {
      startTransition(async () => {
        const res = await deleteMediaAssetAction(id);
        if (res.success) {
          setAssets(assets.filter((a) => a._id !== id));
        }
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* URL Input & Live Preview Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-[#10121a] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-4">
          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
            Add & Preview Image URL
          </h3>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Direct Image URL * (Unsplash, Cloudinary, Pexels, CDN)
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Alt Text * (Accessibility & SEO)
              </label>
              <input
                type="text"
                required
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Visual description"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Image Credit / Attribution
              </label>
              <input
                type="text"
                value={credit}
                onChange={(e) => setCredit(e.target.value)}
                placeholder="e.g. Photo by John via Unsplash"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || !url.trim() || !alt.trim()}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Save to Media Library</span>
          </button>
        </form>

        {/* Live Preview Pane */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          {url && isValidImageUrl(url) ? (
            <div className="space-y-3">
              <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                <Image src={url} alt={alt || "Preview"} fill className="object-cover" />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(url, "temp-url")}
                  className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1"
                >
                  {copiedId === "temp-url" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Copy URL</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      `<figure><img src="${url}" alt="${alt || "Image"}" loading="lazy" /><figcaption>${alt || ""}</figcaption></figure>`,
                      "temp-html"
                    )
                  }
                  className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1"
                >
                  {copiedId === "temp-html" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Copy HTML</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-48 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center">
              <ImageIcon className="w-8 h-8 mb-2 text-slate-400" />
              <span>Live image preview will appear here when you enter a valid URL</span>
            </div>
          )}
        </div>
      </div>

      {/* Saved Media Records */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
          Saved Reusable Image URLs ({assets.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((item) => (
            <div
              key={item._id}
              className="bg-white dark:bg-[#10121a] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs space-y-3 p-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="relative h-36 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <Image src={item.url} alt={item.alt} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.alt}
                  </h4>
                  {item.credit && (
                    <p className="text-[11px] text-slate-400 truncate">{item.credit}</p>
                  )}
                  <p className="text-[11px] font-mono text-slate-500 truncate mt-1">
                    {item.url}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-850">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleCopy(item.url, item._id)}
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1"
                    title="Copy URL"
                  >
                    {copiedId === item._id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>URL</span>
                  </button>

                  <button
                    onClick={() =>
                      handleCopy(
                        `<figure><img src="${item.url}" alt="${item.alt}" loading="lazy" /><figcaption>${item.alt}</figcaption></figure>`,
                        `html-${item._id}`
                      )
                    }
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1"
                    title="Copy HTML Tag"
                  >
                    {copiedId === `html-${item._id}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>HTML</span>
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
