"use client";

import { useState, useTransition, useId } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Sparkles,
  Search,
  Globe,
  Plus,
  Trash2,
  Eye,
  Save,
  CheckCircle,
  HelpCircle,
  Link as LinkIcon,
  Image as ImageIcon,
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  AlertCircle,
} from "lucide-react";
import { PostStatus, Role } from "@/lib/constants";
import { slugify, isValidImageUrl } from "@/lib/utils";
import { createPostAction, updatePostAction } from "@/actions/posts";

interface CategoryOption {
  _id: string;
  name: string;
  slug: string;
}

interface PostEditorProps {
  initialPost?: {
    _id?: string;
    title?: string;
    slug?: string;
    excerpt?: string;
    contentHtml?: string;
    coverImageUrl?: string;
    coverImageAlt?: string;
    coverImageCredit?: string;
    categoryId?: string;
    tags?: string[];
    status?: PostStatus;
    featured?: boolean;
    seoTitle?: string;
    seoDescription?: string;
    ogImageUrl?: string;
    canonicalUrl?: string;
    faq?: { question: string; answer: string }[];
    keyTakeaways?: string[];
    geoFocus?: string[];
    language?: "en" | "hi";
    allowIndex?: boolean;
  };
  categories: CategoryOption[];
  userRole: Role;
}

export function PostEditor({
  initialPost,
  categories,
  userRole,
}: PostEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEditing = Boolean(initialPost?._id);

  // Form states
  const [title, setTitle] = useState(initialPost?.title || "");
  const [slug, setSlug] = useState(initialPost?.slug || "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(initialPost?.slug));
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || "");
  const [contentHtml, setContentHtml] = useState(initialPost?.contentHtml || "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialPost?.coverImageUrl || "");
  const [coverImageAlt, setCoverImageAlt] = useState(initialPost?.coverImageAlt || "");
  const [coverImageCredit, setCoverImageCredit] = useState(initialPost?.coverImageCredit || "");
  const [categoryId, setCategoryId] = useState(
    initialPost?.categoryId || (categories[0]?._id || "")
  );
  const [tagsInput, setTagsInput] = useState(
    initialPost?.tags ? initialPost.tags.join(", ") : ""
  );
  const [status, setStatus] = useState<PostStatus>(
    initialPost?.status || PostStatus.DRAFT
  );
  const [featured, setFeatured] = useState(initialPost?.featured || false);
  const [language, setLanguage] = useState<"en" | "hi">(
    initialPost?.language || "en"
  );
  const [geoFocusInput, setGeoFocusInput] = useState(
    initialPost?.geoFocus ? initialPost.geoFocus.join(", ") : "India, Global"
  );

  // SEO
  const [seoTitle, setSeoTitle] = useState(initialPost?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialPost?.seoDescription || "");
  const [ogImageUrl, setOgImageUrl] = useState(initialPost?.ogImageUrl || "");
  const [canonicalUrl, setCanonicalUrl] = useState(initialPost?.canonicalUrl || "");
  const [allowIndex, setAllowIndex] = useState(
    initialPost?.allowIndex !== undefined ? initialPost.allowIndex : true
  );

  // AEO / GEO fields
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>(
    initialPost?.keyTakeaways && initialPost.keyTakeaways.length > 0
      ? initialPost.keyTakeaways
      : [""]
  );
  const [faqList, setFaqList] = useState<{ question: string; answer: string }[]>(
    initialPost?.faq && initialPost.faq.length > 0
      ? initialPost.faq
      : [{ question: "", answer: "" }]
  );

  // UI state
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [seoExpanded, setSeoExpanded] = useState(false);
  const [aeoExpanded, setAeoExpanded] = useState(false);

  // Auto-slug update when typing title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManuallyEdited) {
      setSlug(slugify(val));
    }
  };

  // Takeaway helpers
  const handleAddTakeaway = () => setKeyTakeaways([...keyTakeaways, ""]);
  const handleRemoveTakeaway = (idx: number) => {
    setKeyTakeaways(keyTakeaways.filter((_, i) => i !== idx));
  };
  const handleTakeawayChange = (idx: number, val: string) => {
    const updated = [...keyTakeaways];
    updated[idx] = val;
    setKeyTakeaways(updated);
  };

  // FAQ helpers
  const handleAddFaq = () => setFaqList([...faqList, { question: "", answer: "" }]);
  const handleRemoveFaq = (idx: number) => {
    setFaqList(faqList.filter((_, i) => i !== idx));
  };
  const handleFaqChange = (
    idx: number,
    field: "question" | "answer",
    val: string
  ) => {
    const updated = [...faqList];
    updated[idx][field] = val;
    setFaqList(updated);
  };

  // Quick formatting toolbar insertion
  const insertFormatting = (tagOpen: string, tagClose = "") => {
    const textarea = document.getElementById("post-content-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = contentHtml.substring(start, end);
    const replacement = `${tagOpen}${selectedText || "text"}${tagClose}`;

    const newContent =
      contentHtml.substring(0, start) +
      replacement +
      contentHtml.substring(end);

    setContentHtml(newContent);
  };

  const handleInsertImageLink = () => {
    const url = prompt("Enter Image URL (e.g. Unsplash / Cloudinary):");
    if (url && isValidImageUrl(url)) {
      const alt = prompt("Enter Alt text for this image:") || "Article visual";
      const imageHtml = `\n<figure><img src="${url}" alt="${alt}" loading="lazy" /><figcaption>${alt}</figcaption></figure>\n`;
      setContentHtml((prev) => prev + imageHtml);
    } else if (url) {
      alert("Invalid image URL. Must start with http:// or https://");
    }
  };

  const handleInsertLink = () => {
    const url = prompt("Enter destination URL (https://...):");
    if (url) {
      insertFormatting(`<a href="${url}" target="_blank" rel="noopener">`, "</a>");
    }
  };

  // Save handler
  const handleSave = async (submitStatus?: PostStatus) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const postStatus = submitStatus || status;

    if (!title.trim()) {
      setErrorMsg("Title is required.");
      return;
    }
    if (!contentHtml.trim()) {
      setErrorMsg("Article content cannot be empty.");
      return;
    }
    if (!coverImageUrl.trim() || !isValidImageUrl(coverImageUrl)) {
      setErrorMsg("Please provide a valid cover image URL (HTTP/HTTPS).");
      return;
    }
    if (!coverImageAlt.trim()) {
      setErrorMsg("Cover image alt text is required for accessibility and SEO.");
      return;
    }
    if (!categoryId) {
      setErrorMsg("Please select a category for this post.");
      return;
    }

    const tagsArray = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const geoArray = geoFocusInput
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean);

    const cleanedTakeaways = keyTakeaways.filter((t) => t.trim().length > 0);
    const cleanedFaqs = faqList.filter(
      (f) => f.question.trim().length > 0 && f.answer.trim().length > 0
    );

    const payload = {
      title: title.trim(),
      slug: slugify(slug || title),
      excerpt: excerpt.trim(),
      contentHtml,
      coverImageUrl: coverImageUrl.trim(),
      coverImageAlt: coverImageAlt.trim(),
      coverImageCredit: coverImageCredit.trim(),
      categoryId,
      tags: tagsArray,
      status: postStatus,
      featured,
      seoTitle: seoTitle.trim() || title.trim(),
      seoDescription: seoDescription.trim() || excerpt.trim(),
      ogImageUrl: ogImageUrl.trim() || coverImageUrl.trim(),
      canonicalUrl: canonicalUrl.trim(),
      faq: cleanedFaqs,
      keyTakeaways: cleanedTakeaways,
      geoFocus: geoArray,
      language,
      allowIndex,
    };

    startTransition(async () => {
      let result;
      if (isEditing && initialPost?._id) {
        result = await updatePostAction(initialPost._id, payload);
      } else {
        result = await createPostAction(payload);
      }

      if (result.success) {
        setSuccessMsg(result.message || "Saved successfully!");
        setTimeout(() => {
          router.push("/dashboard/posts");
          router.refresh();
        }, 1200);
      } else {
        setErrorMsg(result.error || "Failed to save post.");
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#10121a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
            {isEditing ? "Edit Article" : "Compose New Article"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Author with high SEO, AEO, and GEO optimization. Remote image URLs only.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "edit"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === "preview"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSave(PostStatus.DRAFT)}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSave(PostStatus.PUBLISHED)}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 shadow-xs transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isPending ? "Saving..." : isEditing ? "Update Post" : "Publish Post"}</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {activeTab === "preview" ? (
        /* Live Preview Mode */
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#10121a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          <div className="space-y-4 max-w-prose mx-auto text-center">
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400">
              Preview Mode
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight">
              {title || "Untitled Article"}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
              {excerpt || "Article summary will appear here..."}
            </p>
          </div>

          {coverImageUrl && isValidImageUrl(coverImageUrl) && (
            <div className="relative h-96 w-full rounded-2xl overflow-hidden shadow-md">
              <Image
                src={coverImageUrl}
                alt={coverImageAlt || "Cover"}
                fill
                className="object-cover"
              />
            </div>
          )}

          {keyTakeaways.filter(Boolean).length > 0 && (
            <div className="max-w-prose mx-auto p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <h4 className="font-serif font-bold text-amber-800 dark:text-amber-400 mb-3">
                Key Takeaways
              </h4>
              <ul className="space-y-2 list-disc pl-5 text-sm text-slate-700 dark:text-slate-200">
                {keyTakeaways.filter(Boolean).map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          <div
            className="prose-editorial"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      ) : (
        /* Editor Mode */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title & Slug */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#10121a] border border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Article Title *
                  </label>
                  <span
                    className={`text-xs ${
                      title.length > 60
                        ? "text-amber-500 font-semibold"
                        : "text-slate-400"
                    }`}
                  >
                    {title.length}/60 recommended
                  </span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Building at Scale: How India's Digital Rails are Shaping Innovation"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white font-serif text-lg font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  URL Slug (Auto-generated & editable)
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-xs font-mono text-slate-500">
                  <span>/blog/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      setSlug(slugify(e.target.value));
                    }}
                    className="flex-1 bg-transparent text-slate-900 dark:text-slate-200 focus:outline-none pl-1"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Excerpt / Executive Summary
                  </label>
                  <span
                    className={`text-xs ${
                      excerpt.length > 180
                        ? "text-amber-500 font-semibold"
                        : "text-slate-400"
                    }`}
                  >
                    {excerpt.length}/180 recommended
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A concise 1-2 sentence breakdown of the article for social sharing and search cards..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>
            </div>

            {/* Rich Content Editor */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#10121a] border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Article Body (HTML / Editorial Content) *
                </label>
                <span className="text-xs text-slate-400">
                  Supports structured HTML tags & formatting
                </span>
              </div>

              {/* Formatting Toolbar */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => insertFormatting("<h2>", "</h2>")}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1"
                  title="Heading 2"
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("<h3>", "</h3>")}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1"
                  title="Heading 3"
                >
                  <Heading3 className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />
                <button
                  type="button"
                  onClick={() => insertFormatting("<strong>", "</strong>")}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("<em>", "</em>")}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("<blockquote>\n  ", "\n</blockquote>")}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  title="Quote"
                >
                  <Quote className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("<ul>\n  <li>", "</li>\n</ul>")}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("<ol>\n  <li>", "</li>\n</ol>")}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  title="Numbered List"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("<pre><code>\n", "\n</code></pre>")}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  title="Code Block"
                >
                  <Code className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("\n<hr />\n")}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  title="Divider"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />
                <button
                  type="button"
                  onClick={handleInsertLink}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1 text-xs"
                  title="Insert Hyperlink"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Link</span>
                </button>
                <button
                  type="button"
                  onClick={handleInsertImageLink}
                  className="p-1.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25 flex items-center gap-1 text-xs font-semibold"
                  title="Embed Image by URL"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Embed Image URL</span>
                </button>
              </div>

              <textarea
                id="post-content-textarea"
                rows={16}
                value={contentHtml}
                onChange={(e) => setContentHtml(e.target.value)}
                placeholder="Write your article paragraphs here. Use <h2> for major sections and <h3> for subsections..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            {/* AEO & GEO Accordion (Key Takeaways + FAQ Builder) */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#10121a] border border-slate-200 dark:border-slate-800 space-y-4">
              <button
                type="button"
                onClick={() => setAeoExpanded(!aeoExpanded)}
                className="w-full flex items-center justify-between text-left focus:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      AEO & GEO Optimization (Key Takeaways & FAQ Schema)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Enables AI grounding in Perplexity, ChatGPT, Gemini, and Google SGE.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {aeoExpanded ? "Collapse ▲" : "Configure ▼"}
                </span>
              </button>

              {aeoExpanded && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-6">
                  {/* Key Takeaways */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Executive Key Takeaways (Bullet Points)
                      </label>
                      <button
                        type="button"
                        onClick={handleAddTakeaway}
                        className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Takeaway
                      </button>
                    </div>

                    {keyTakeaways.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleTakeawayChange(idx, e.target.value)}
                          placeholder={`Key takeaway #${idx + 1}`}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                        />
                        {keyTakeaways.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTakeaway(idx)}
                            className="p-2 text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* FAQ Builder */}
                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Article FAQ Builder (Generates FAQPage Schema)
                      </label>
                      <button
                        type="button"
                        onClick={handleAddFaq}
                        className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Question & Answer
                      </button>
                    </div>

                    {faqList.map((faq, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500">
                            FAQ Item #{idx + 1}
                          </span>
                          {faqList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveFaq(idx)}
                              className="text-slate-400 hover:text-rose-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) =>
                            handleFaqChange(idx, "question", e.target.value)
                          }
                          placeholder="Question: e.g. Why is digital public infrastructure important?"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                        />
                        <textarea
                          rows={2}
                          value={faq.answer}
                          onChange={(e) =>
                            handleFaqChange(idx, "answer", e.target.value)
                          }
                          placeholder="Direct, concise answer..."
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SEO Accordion */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#10121a] border border-slate-200 dark:border-slate-800 space-y-4">
              <button
                type="button"
                onClick={() => setSeoExpanded(!seoExpanded)}
                className="w-full flex items-center justify-between text-left focus:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-5 h-5 text-blue-500" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Search Engine Optimization (SEO & Meta Tags)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Customize Open Graph images, canonical links, and search snippet titles.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {seoExpanded ? "Collapse ▲" : "Configure ▼"}
                </span>
              </button>

              {seoExpanded && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      SEO Title (Overrides title in search engines)
                    </label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder={title || "Article SEO Title"}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">
                        Meta Description
                      </label>
                      <span className="text-slate-400">{seoDescription.length}/155</span>
                    </div>
                    <textarea
                      rows={2}
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder={excerpt || "Search description..."}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Custom OpenGraph Image URL (Optional override)
                    </label>
                    <input
                      type="text"
                      value={ogImageUrl}
                      onChange={(e) => setOgImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Canonical URL Override (Optional)
                    </label>
                    <input
                      type="text"
                      value={canonicalUrl}
                      onChange={(e) => setCanonicalUrl(e.target.value)}
                      placeholder="https://kartshart.com/blog/..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="allowIndexCheck"
                      checked={allowIndex}
                      onChange={(e) => setAllowIndex(e.target.checked)}
                      className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4"
                    />
                    <label
                      htmlFor="allowIndexCheck"
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Allow search engines to index this article (Index, Follow)
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Settings Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Publishing Controls */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#10121a] border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 pb-2">
                Publishing Status
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PostStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value={PostStatus.DRAFT}>Draft</option>
                  <option value={PostStatus.PUBLISHED}>Published (Live)</option>
                  <option value={PostStatus.ARCHIVED}>Archived</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Featured on Homepage
                </label>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Article Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as "en" | "hi")}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="en">English (Primary)</option>
                  <option value="hi">Hindi (हिन्दी Content)</option>
                </select>
              </div>
            </div>

            {/* Cover Image URL Box (NO FILE UPLOAD) */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#10121a] border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center justify-between">
                <span>Cover Image</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                  URL Only
                </span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Image URL * (Unsplash, Cloudinary, etc.)
                </label>
                <input
                  type="text"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Live Image Preview */}
              {coverImageUrl && isValidImageUrl(coverImageUrl) ? (
                <div className="relative h-36 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <Image
                    src={coverImageUrl}
                    alt={coverImageAlt || "Preview"}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-28 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 text-xs p-3 text-center">
                  <ImageIcon className="w-6 h-6 mb-1 text-slate-400" />
                  <span>Paste image URL above to see live preview</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alt Text * (Accessibility & SEO)
                </label>
                <input
                  type="text"
                  value={coverImageAlt}
                  onChange={(e) => setCoverImageAlt(e.target.value)}
                  placeholder="Describe image visual contents"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Image Credit / Source (Optional)
                </label>
                <input
                  type="text"
                  value={coverImageCredit}
                  onChange={(e) => setCoverImageCredit(e.target.value)}
                  placeholder="e.g. Photo by Jane Doe via Unsplash"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Category & Tags */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#10121a] border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 pb-2">
                Classification & Focus
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="tech, ai, india-stack, startup"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  GEO Geographic Focus (comma separated)
                </label>
                <input
                  type="text"
                  value={geoFocusInput}
                  onChange={(e) => setGeoFocusInput(e.target.value)}
                  placeholder="India, Delhi, Global"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
