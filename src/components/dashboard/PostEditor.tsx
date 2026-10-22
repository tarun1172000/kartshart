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
  ExternalLink,
  Copy,
  Check,
  Code2,
  X,
} from "lucide-react";
import { PostStatus, Role } from "@/lib/constants";
import { slugify, isValidImageUrl } from "@/lib/utils";
import { createPostAction, updatePostAction } from "@/actions/posts";

const SAMPLE_RAW_TEXT_TEMPLATE = `Title: Understanding Digital Public Infrastructure: The Foundation of India's Tech Boom
Slug: understanding-digital-public-infrastructure
Excerpt: How UPI, Aadhaar, and open digital networks created an unprecedented ecosystem for startups and global innovation.
Cover: https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200
Cover Alt: Digital network glowing nodes concept
Banner Link: https://example.com/special-deal
Banner Popup: Yes
Category: Technology
Tags: Tech, India, Innovation, DPI
Language: en

Key Takeaways:
- Digital public infrastructure democratized access to financial and identity rails.
- Open APIs enabled private sector innovation to scale at near-zero marginal cost.
- Next wave focuses on AI-driven governance and multilingual accessibility.

## Introduction to Open Rails
India's digital transformation has become a global case study in interoperable, public-interest technology platforms. Over the past decade, the country moved from cash-dominant commerce to conducting billions of digital transactions each month.

## Key Catalysts of Growth
From instant payments to paperless KYC verification, the infrastructure layer solved fundamental friction points for millions of businesses. By creating open protocols rather than closed corporate platforms, innovation flourished across banking, commerce, and mobility.

## What Lies Ahead
The next decade will see AI layers integrated deeply into public services, healthcare, and educational access. Autonomous agents and multilingual voice interfaces will bring digital services to every citizen in their local language.

FAQs:
Q: What is Digital Public Infrastructure (DPI)?
A: DPI refers to digital platforms like digital identity (Aadhaar), payments (UPI), and data exchange networks built as open public goods.

Q: Why is India's tech model considered unique?
A: Because it separates the public infrastructure layer from private applications, preventing monopolies and fostering fierce competition.`;

const SAMPLE_SCHEMA_TEMPLATE = JSON.stringify(
  {
    title: "Understanding Digital Public Infrastructure: The Foundation of India's Tech Boom",
    slug: "understanding-digital-public-infrastructure",
    excerpt: "How UPI, Aadhaar, and open digital networks created an unprecedented ecosystem for startups and global innovation.",
    contentHtml: `<h2>Introduction to Open Rails</h2>\n<p>India's digital transformation has become a global case study in interoperable, public-interest technology platforms.</p>\n<h2>Key Catalysts of Growth</h2>\n<p>From instant payments to paperless KYC verification, the infrastructure layer solved fundamental friction points for millions of businesses.</p>\n<h2>What Lies Ahead</h2>\n<p>The next decade will see AI layers integrated deeply into public services, healthcare, and educational access.</p>`,
    coverImageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200",
    coverImageAlt: "Digital network glowing nodes concept",
    coverImageCredit: "Photo via Unsplash",
    coverImageLink: "https://example.com/special-deal",
    showBannerPopup: true,
    category: "Technology",
    tags: ["Tech", "India", "Innovation", "Digital Public Infrastructure"],
    keyTakeaways: [
      "Digital public infrastructure democratized access to financial and identity rails.",
      "Open APIs enabled private sector innovation to scale at near-zero marginal cost.",
      "Next wave focuses on AI-driven governance and multilingual accessibility."
    ],
    faq: [
      {
        question: "What is Digital Public Infrastructure (DPI)?",
        answer: "DPI refers to digital platforms like digital identity, payment systems, and data exchange networks built as public goods."
      },
      {
        question: "Why is India's tech model considered unique?",
        answer: "Because it separates the public infrastructure layer from private applications, preventing monopolies and fostering fierce competition."
      }
    ],
    seoTitle: "Digital Public Infrastructure in India: Complete Analysis | Kartshart",
    seoDescription: "An in-depth look at how open digital rails like UPI and Aadhaar reshaped India's economy and inspired global tech governance.",
    geoFocus: ["India", "Global"],
    language: "en",
    featured: true,
    status: "published"
  },
  null,
  2
);

function formatInlineMarkdown(str: string): string {
  return str
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

function markdownToHtml(md: string): string {
  if (!md || !md.trim()) return "";

  // If text already has HTML block tags, return as is
  if (/<(p|h[1-6]|div|section|article|table|ul|ol|blockquote)[\s>]/i.test(md)) {
    return md.trim();
  }

  const blocks = md.split(/\n{2,}/);
  const htmlBlocks: string[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("### ")) {
      htmlBlocks.push(`<h3>${formatInlineMarkdown(trimmed.replace(/^###\s+/, ""))}</h3>`);
      continue;
    }
    if (trimmed.startsWith("## ")) {
      htmlBlocks.push(`<h2>${formatInlineMarkdown(trimmed.replace(/^##\s+/, ""))}</h2>`);
      continue;
    }
    if (trimmed.startsWith("# ")) {
      htmlBlocks.push(`<h2>${formatInlineMarkdown(trimmed.replace(/^#\s+/, ""))}</h2>`);
      continue;
    }
    if (trimmed.startsWith("> ")) {
      const quoteText = trimmed
        .split("\n")
        .map((l) => formatInlineMarkdown(l.replace(/^>\s*/, "")))
        .join("<br />");
      htmlBlocks.push(`<blockquote>${quoteText}</blockquote>`);
      continue;
    }
    if (/^[-*•]\s+/m.test(trimmed)) {
      const items = trimmed
        .split("\n")
        .map((l) => l.replace(/^[-*•]\s*/, "").trim())
        .filter(Boolean)
        .map((it) => `<li>${formatInlineMarkdown(it)}</li>`)
        .join("\n  ");
      htmlBlocks.push(`<ul>\n  ${items}\n</ul>`);
      continue;
    }
    if (/^\d+\.\s+/m.test(trimmed)) {
      const items = trimmed
        .split("\n")
        .map((l) => l.replace(/^\d+\.\s*/, "").trim())
        .filter(Boolean)
        .map((it) => `<li>${formatInlineMarkdown(it)}</li>`)
        .join("\n  ");
      htmlBlocks.push(`<ol>\n  ${items}\n</ol>`);
      continue;
    }

    // Regular paragraph
    const withBr = trimmed
      .split("\n")
      .map(formatInlineMarkdown)
      .join("<br />");
    htmlBlocks.push(`<p>${withBr}</p>`);
  }

  return htmlBlocks.join("\n\n");
}

function parseRawArticleText(text: string, categories: CategoryOption[]) {
  const lines = text.split("\n");
  let title = "";
  let slug = "";
  let excerpt = "";
  let coverImageUrl = "";
  let coverImageAlt = "";
  let coverImageCredit = "";
  let coverImageLink = "";
  let showBannerPopup: boolean | undefined = undefined;
  let category = "";
  let tags: string[] = [];
  let geoFocus: string[] = [];
  let seoTitle = "";
  let seoDescription = "";
  const keyTakeaways: string[] = [];
  const faqs: { question: string; answer: string }[] = [];
  let language: "en" | "hi" = "en";

  const contentLines: string[] = [];
  let currentSection: "meta" | "content" | "takeaways" | "faqs" = "meta";
  let currentFaqQ = "";
  let currentFaqA = "";

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Check for section transitions
    const normalized = line.toLowerCase().replace(/[*_#:]/g, "").trim();

    if (
      normalized === "key takeaways" ||
      normalized === "takeaways" ||
      normalized === "key highlights" ||
      normalized === "highlights"
    ) {
      currentSection = "takeaways";
      continue;
    }

    if (
      normalized === "faq" ||
      normalized === "faqs" ||
      normalized === "frequently asked questions"
    ) {
      if (currentFaqQ && currentFaqA) {
        faqs.push({ question: currentFaqQ.trim(), answer: currentFaqA.trim() });
        currentFaqQ = "";
        currentFaqA = "";
      }
      currentSection = "faqs";
      continue;
    }

    if (
      normalized === "article body" ||
      normalized === "content" ||
      normalized === "article content" ||
      normalized === "body"
    ) {
      currentSection = "content";
      continue;
    }

    // Parse Takeaways
    if (currentSection === "takeaways") {
      if (line.startsWith("#") || normalized.startsWith("faq")) {
        if (normalized.startsWith("faq")) {
          currentSection = "faqs";
        } else {
          currentSection = "content";
          contentLines.push(rawLine);
        }
        continue;
      }
      if (line.startsWith("-") || line.startsWith("*") || line.startsWith("•") || /^\d+\./.test(line)) {
        const cleanT = line.replace(/^[-*•\d.]\s*/, "").trim();
        if (cleanT) keyTakeaways.push(cleanT);
        continue;
      }
      if (!line) continue;
    }

    // Parse FAQs
    if (currentSection === "faqs") {
      if (line.startsWith("#") && !line.toLowerCase().includes("faq")) {
        currentSection = "content";
        contentLines.push(rawLine);
        continue;
      }

      const qMatch = line.match(/^(?:\*\*|\*|#+)?\s*(?:q|question)\s*(?:\d+)?\s*[:.-]\s*(.+?)(?:\*\*|\*)?$/i);
      if (qMatch) {
        if (currentFaqQ && currentFaqA) {
          faqs.push({ question: currentFaqQ.trim(), answer: currentFaqA.trim() });
          currentFaqA = "";
        }
        currentFaqQ = qMatch[1].replace(/[*_]/g, "").trim();
        continue;
      }

      const aMatch = line.match(/^(?:\*\*|\*|#+)?\s*(?:a|answer)\s*(?:\d+)?\s*[:.-]\s*(.+?)(?:\*\*|\*)?$/i);
      if (aMatch) {
        currentFaqA = aMatch[1].replace(/[*_]/g, "").trim();
        continue;
      }

      if (currentFaqQ && !line.startsWith("Q:") && !line.startsWith("Question:")) {
        currentFaqA = currentFaqA ? `${currentFaqA} ${line}` : line;
        continue;
      }
    }

    // Parse Metadata headers
    const titleMatch = line.match(/^(?:\*\*|\*|#+)?\s*Title\s*[:=]\s*(.+?)(?:\*\*|\*)?$/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
      continue;
    }

    const slugMatch = line.match(/^(?:\*\*|\*|#+)?\s*Slug\s*[:=]\s*(.+?)(?:\*\*|\*)?$/i);
    if (slugMatch) {
      slug = slugMatch[1].trim();
      continue;
    }

    const excerptMatch = line.match(/^(?:\*\*|\*|#+)?\s*(?:Excerpt|Summary|Executive Summary)\s*[:=]\s*(.+?)(?:\*\*|\*)?$/i);
    if (excerptMatch) {
      excerpt = excerptMatch[1].trim();
      continue;
    }

    const coverMatch = line.match(/^(?:\*\*|\*|#+)?\s*(?:Cover|Cover Image|Image|Banner)\s*(?:URL)?\s*[:=]\s*(\S+?)(?:\*\*|\*)?$/i);
    if (coverMatch) {
      coverImageUrl = coverMatch[1].trim().replace(/^["']|["']$/g, "");
      continue;
    }

    const altMatch = line.match(/^(?:\*\*|\*|#+)?\s*(?:Alt|Alt Text|Cover Alt)\s*[:=]\s*(.+?)(?:\*\*|\*)?$/i);
    if (altMatch) {
      coverImageAlt = altMatch[1].trim();
      continue;
    }

    const creditMatch = line.match(/^(?:\*\*|\*|#+)?\s*(?:Credit|Image Credit|Source)\s*[:=]\s*(.+?)(?:\*\*|\*)?$/i);
    if (creditMatch) {
      coverImageCredit = creditMatch[1].trim();
      continue;
    }

    const linkMatch = line.match(/^(?:\*\*|\*|#+)?\s*(?:Link|Banner Link|Image Link)\s*[:=]\s*(\S+?)(?:\*\*|\*)?$/i);
    if (linkMatch) {
      coverImageLink = linkMatch[1].trim();
      continue;
    }

    const popupMatch = line.match(/^(?:\*\*|\*|#+)?\s*(?:Banner Popup|Popup|Show Popup|Modal Popup)\s*[:=]\s*(.+?)(?:\*\*|\*)?$/i);
    if (popupMatch) {
      const val = popupMatch[1].toLowerCase().trim();
      showBannerPopup = ["yes", "true", "1", "y", "enable", "enabled"].includes(val);
      continue;
    }

    const langMatch = line.match(/^(?:\*\*|\*|#+)?\s*Language\s*[:=]\s*(.+?)(?:\*\*|\*)?$/i);
    if (langMatch) {
      const val = langMatch[1].toLowerCase().trim();
      if (val === "hi" || val === "hindi") language = "hi";
      continue;
    }

    const categoryMatch = line.match(/^(?:\*\*|\*|#+)?\s*Category\s*[:=]\s*(.+?)(?:\*\*|\*)?$/i);
    if (categoryMatch) {
      category = categoryMatch[1].trim();
      continue;
    }

    const tagsMatch = line.match(/^(?:\*\*|\*|#+)?\s*(?:Tags|Keywords)\s*[:=]\s*(.+?)(?:\*\*|\*)?$/i);
    if (tagsMatch) {
      tags = tagsMatch[1].split(",").map((s) => s.trim().replace(/^#/, "")).filter(Boolean);
      continue;
    }

    const geoMatch = line.match(/^(?:\*\*|\*|#+)?\s*(?:Geo|Geo Focus|Geographic Focus)\s*[:=]\s*(.+?)(?:\*\*|\*)?$/i);
    if (geoMatch) {
      geoFocus = geoMatch[1].split(",").map((s) => s.trim()).filter(Boolean);
      continue;
    }

    const seoTitleMatch = line.match(/^(?:\*\*|\*|#+)?\s*SEO Title\s*[:=]\s*(.+?)(?:\*\*|\*)?$/i);
    if (seoTitleMatch) {
      seoTitle = seoTitleMatch[1].trim();
      continue;
    }

    const seoDescMatch = line.match(/^(?:\*\*|\*|#+)?\s*(?:SEO Description|Meta Description)\s*[:=]\s*(.+?)(?:\*\*|\*)?$/i);
    if (seoDescMatch) {
      seoDescription = seoDescMatch[1].trim();
      continue;
    }

    // Markdown H1 `# Title` fallback
    if (!title && line.startsWith("# ") && !line.startsWith("##")) {
      title = line.replace(/^#\s*/, "").replace(/[*_]/g, "").trim();
      continue;
    }

    // Line belongs to article content
    contentLines.push(rawLine);
  }

  // Flush remaining FAQ
  if (currentFaqQ && currentFaqA) {
    faqs.push({ question: currentFaqQ.trim(), answer: currentFaqA.trim() });
  }

  // Match category
  let categoryId = "";
  if (category) {
    const catVal = category.toLowerCase().trim();
    const found = categories.find(
      (c) =>
        c._id.toLowerCase() === catVal ||
        c.slug.toLowerCase() === catVal ||
        c.name.toLowerCase() === catVal
    );
    if (found) categoryId = found._id;
  }

  // Join content lines
  const rawContent = contentLines.join("\n").trim();
  if (!excerpt && rawContent) {
    const firstPara = rawContent.split(/\n\s*\n/)[0]?.replace(/^[#*-]\s*/, "").trim();
    if (firstPara && firstPara.length < 250) {
      excerpt = firstPara;
    }
  }

  const contentHtml = markdownToHtml(rawContent);

  return {
    title,
    slug: slug || (title ? slugify(title) : ""),
    excerpt,
    contentHtml,
    coverImageUrl,
    coverImageAlt: coverImageAlt || (title ? `${title} cover` : ""),
    coverImageCredit,
    coverImageLink,
    showBannerPopup,
    categoryId,
    tags,
    keyTakeaways,
    faqs,
    seoTitle: seoTitle || title,
    seoDescription: seoDescription || excerpt,
    ogImageUrl: coverImageUrl,
    canonicalUrl: "",
    geoFocus,
    language,
  };
}

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
    coverImageLink?: string;
    showBannerPopup?: boolean;
    bannerClicks?: number;
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
  const [coverImageLink, setCoverImageLink] = useState(initialPost?.coverImageLink || "");
  const [showBannerPopup, setShowBannerPopup] = useState<boolean>(
    initialPost?.showBannerPopup ?? false
  );
  const [previewPopupModal, setPreviewPopupModal] = useState<boolean>(false);
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

  // Quick Schema Import State
  const [schemaRawInput, setSchemaRawInput] = useState("");
  const [schemaStatus, setSchemaStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
    details?: string[];
  }>({ type: null, message: "" });
  const [copiedTemplate, setCopiedTemplate] = useState<"text" | "json" | null>(null);

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

  const handleCopyTemplate = (type: "text" | "json") => {
    navigator.clipboard.writeText(
      type === "text" ? SAMPLE_RAW_TEXT_TEMPLATE : SAMPLE_SCHEMA_TEMPLATE
    );
    setCopiedTemplate(type);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  const handleApplySchema = (shouldSwitchToPreview = false) => {
    if (!schemaRawInput.trim()) {
      setSchemaStatus({
        type: "error",
        message: "Please paste your article text, markdown, or JSON schema first.",
      });
      return;
    }

    try {
      let raw = schemaRawInput.trim();
      // Remove markdown code fences if pasted from ChatGPT / Gemini
      if (raw.startsWith("```")) {
        raw = raw.replace(/^```(?:json|markdown|text)?\s*\n?/, "").replace(/\n?```\s*$/, "").trim();
      }

      let isJson = false;
      let parsedJson: any = null;

      // Check if input looks like JSON
      if (
        (raw.startsWith("{") && raw.endsWith("}")) ||
        (raw.startsWith("[") && raw.endsWith("]"))
      ) {
        try {
          parsedJson = JSON.parse(raw);
          isJson = true;
        } catch {
          // Try smart repair (unescaped newlines inside quotes)
          try {
            const sanitized = raw.replace(/"((?:[^"\\]|\\.)*)"/g, (match) => {
              return match.replace(/\r?\n/g, "\\n").replace(/\t/g, "\\t");
            });
            parsedJson = JSON.parse(sanitized);
            isJson = true;
          } catch {
            isJson = false;
          }
        }
      }

      const appliedFields: string[] = [];

      if (!isJson) {
        // --- PARSE AS RAW ARTICLE / MARKDOWN TEXT ---
        const parsed = parseRawArticleText(raw, categories);

        if (parsed.title) {
          setTitle(parsed.title);
          appliedFields.push("Title");
        }
        if (parsed.slug) {
          setSlug(parsed.slug);
          setSlugManuallyEdited(true);
          appliedFields.push("Slug");
        } else if (parsed.title) {
          setSlug(slugify(parsed.title));
        }
        if (parsed.excerpt) {
          setExcerpt(parsed.excerpt);
          appliedFields.push("Excerpt");
        }
        if (parsed.contentHtml) {
          setContentHtml(parsed.contentHtml);
          appliedFields.push("Article Body (HTML Content)");
        }
        if (parsed.coverImageUrl) {
          setCoverImageUrl(parsed.coverImageUrl);
          appliedFields.push("Cover Image");
        }
        if (parsed.coverImageAlt) {
          setCoverImageAlt(parsed.coverImageAlt);
        }
        if (parsed.coverImageCredit) {
          setCoverImageCredit(parsed.coverImageCredit);
        }
        if (parsed.coverImageLink) {
          setCoverImageLink(parsed.coverImageLink);
          appliedFields.push("Banner Link");
        }
        if (parsed.showBannerPopup !== undefined) {
          setShowBannerPopup(parsed.showBannerPopup);
          appliedFields.push(`Banner Popup (${parsed.showBannerPopup ? "Yes" : "No"})`);
        }
        if (parsed.categoryId) {
          setCategoryId(parsed.categoryId);
          const catObj = categories.find((c) => c._id === parsed.categoryId);
          appliedFields.push(`Category (${catObj?.name || "Matched"})`);
        }
        if (parsed.tags && parsed.tags.length > 0) {
          setTagsInput(parsed.tags.join(", "));
          appliedFields.push("Tags");
        }
        if (parsed.keyTakeaways && parsed.keyTakeaways.length > 0) {
          setKeyTakeaways(parsed.keyTakeaways);
          setAeoExpanded(true);
          appliedFields.push(`${parsed.keyTakeaways.length} Key Takeaways`);
        }
        if (parsed.faqs && parsed.faqs.length > 0) {
          setFaqList(parsed.faqs);
          setAeoExpanded(true);
          appliedFields.push(`${parsed.faqs.length} FAQs`);
        }
        if (parsed.seoTitle) {
          setSeoTitle(parsed.seoTitle);
          setSeoExpanded(true);
        }
        if (parsed.seoDescription) {
          setSeoDescription(parsed.seoDescription);
          setSeoExpanded(true);
        }
        if (parsed.geoFocus && parsed.geoFocus.length > 0) {
          setGeoFocusInput(parsed.geoFocus.join(", "));
        }
        if (parsed.language) {
          setLanguage(parsed.language);
        }
      } else {
        // --- PARSE AS JSON / SCHEMA.ORG ---
        let blogObj: any = parsedJson;
        let faqArray: any[] = [];

        const items = Array.isArray(parsedJson)
          ? parsedJson
          : parsedJson["@graph"] && Array.isArray(parsedJson["@graph"])
          ? parsedJson["@graph"]
          : [parsedJson];

        for (const item of items) {
          if (!item || typeof item !== "object") continue;

          const type = item["@type"] || item.type || "";
          if (
            type === "FAQPage" ||
            item.mainEntity ||
            (Array.isArray(item.faq) && item.faq.length > 0)
          ) {
            if (Array.isArray(item.mainEntity)) {
              faqArray = item.mainEntity;
            } else if (Array.isArray(item.faq)) {
              faqArray = item.faq;
            }
          }

          if (
            type === "BlogPosting" ||
            type === "Article" ||
            type === "NewsArticle" ||
            item.title ||
            item.headline ||
            item.contentHtml ||
            item.articleBody
          ) {
            blogObj = { ...item, ...blogObj };
          }
        }

        const extractImageUrl = (img: any): string => {
          if (!img) return "";
          if (typeof img === "string") return img;
          if (Array.isArray(img) && img.length > 0) return extractImageUrl(img[0]);
          if (typeof img === "object" && img.url) return String(img.url);
          return "";
        };

        // 1. Title
        const newTitle = blogObj.title || blogObj.headline || blogObj.name;
        if (newTitle && typeof newTitle === "string") {
          setTitle(newTitle.trim());
          appliedFields.push("Title");
        }

        // 2. Slug
        const newSlug = blogObj.slug;
        if (newSlug && typeof newSlug === "string") {
          setSlug(slugify(newSlug));
          setSlugManuallyEdited(true);
          appliedFields.push("Slug");
        } else if (newTitle && typeof newTitle === "string") {
          setSlug(slugify(newTitle));
        }

        // 3. Excerpt
        const newExcerpt = blogObj.excerpt || blogObj.description || blogObj.summary;
        if (newExcerpt && typeof newExcerpt === "string") {
          setExcerpt(newExcerpt.trim());
          appliedFields.push("Excerpt");
        }

        // 4. Content / Article Body (Accepts contentHtml, content, articleBody, body, text, conetct)
        const rawContent =
          blogObj.contentHtml ||
          blogObj.content ||
          blogObj.articleBody ||
          blogObj.body ||
          blogObj.conetct ||
          blogObj.text;
        if (rawContent && typeof rawContent === "string") {
          const finalContent = markdownToHtml(rawContent);
          setContentHtml(finalContent);
          appliedFields.push("Article Body (HTML Content)");
        }

        // 5. Cover Image URL
        const newCoverImg = extractImageUrl(
          blogObj.coverImageUrl ||
            blogObj.coverImage ||
            blogObj.image ||
            blogObj.imageUrl
        );
        if (newCoverImg) {
          setCoverImageUrl(newCoverImg);
          appliedFields.push("Cover Image");
        }

        // 6. Cover Image Alt
        const newAlt =
          blogObj.coverImageAlt ||
          blogObj.imageAlt ||
          blogObj.alt ||
          (newTitle ? `${newTitle} cover` : "");
        if (newAlt) {
          setCoverImageAlt(String(newAlt));
        }

        // 7. Cover Image Credit & Link
        if (blogObj.coverImageCredit || blogObj.imageCredit || blogObj.credit) {
          setCoverImageCredit(
            String(blogObj.coverImageCredit || blogObj.imageCredit || blogObj.credit)
          );
        }
        if (blogObj.coverImageLink || blogObj.imageLink || blogObj.bannerLink) {
          setCoverImageLink(
            String(blogObj.coverImageLink || blogObj.imageLink || blogObj.bannerLink)
          );
        }

        if (
          blogObj.showBannerPopup !== undefined ||
          blogObj.bannerPopup !== undefined ||
          blogObj.popup !== undefined ||
          blogObj.isPopup !== undefined
        ) {
          const rawPopupVal =
            blogObj.showBannerPopup ??
            blogObj.bannerPopup ??
            blogObj.popup ??
            blogObj.isPopup;
          const isEnabled =
            rawPopupVal === true ||
            String(rawPopupVal).toLowerCase().trim() === "true" ||
            String(rawPopupVal).toLowerCase().trim() === "yes" ||
            String(rawPopupVal).trim() === "1";
          setShowBannerPopup(isEnabled);
          appliedFields.push(`Banner Popup (${isEnabled ? "Yes" : "No"})`);
        }

        // 8. Category
        const catVal =
          blogObj.category ||
          blogObj.categoryId ||
          blogObj.categoryName ||
          blogObj.articleSection;
        if (catVal) {
          const valStr = String(catVal).toLowerCase().trim();
          const matched = categories.find(
            (c) =>
              c._id.toLowerCase() === valStr ||
              c.slug.toLowerCase() === valStr ||
              c.name.toLowerCase() === valStr
          );
          if (matched) {
            setCategoryId(matched._id);
            appliedFields.push(`Category (${matched.name})`);
          }
        }

        // 9. Tags
        const rawTags = blogObj.tags || blogObj.keywords;
        if (Array.isArray(rawTags) && rawTags.length > 0) {
          const tagStr = rawTags.map(String).filter(Boolean).join(", ");
          setTagsInput(tagStr);
          appliedFields.push("Tags");
        } else if (typeof rawTags === "string" && rawTags.trim()) {
          setTagsInput(rawTags.trim());
          appliedFields.push("Tags");
        }

        // 10. Key Takeaways
        const rawTakeaways =
          blogObj.keyTakeaways || blogObj.takeaways || blogObj.highlights;
        if (Array.isArray(rawTakeaways) && rawTakeaways.length > 0) {
          const cleaned = rawTakeaways.map(String).filter((t) => t.trim().length > 0);
          if (cleaned.length > 0) {
            setKeyTakeaways(cleaned);
            setAeoExpanded(true);
            appliedFields.push(`${cleaned.length} Key Takeaways`);
          }
        } else if (typeof rawTakeaways === "string" && rawTakeaways.trim()) {
          const lines = rawTakeaways
            .split(/\n|•|- /)
            .map((s) => s.trim())
            .filter(Boolean);
          if (lines.length > 0) {
            setKeyTakeaways(lines);
            setAeoExpanded(true);
            appliedFields.push(`${lines.length} Key Takeaways`);
          }
        }

        // 11. FAQ Items
        const rawFaqs = (faqArray.length > 0 ? faqArray : blogObj.faq || blogObj.faqs) || [];
        if (Array.isArray(rawFaqs) && rawFaqs.length > 0) {
          const parsedFaqs: { question: string; answer: string }[] = [];
          for (const f of rawFaqs) {
            if (!f || typeof f !== "object") continue;
            if (f.name && f.acceptedAnswer) {
              const ans =
                typeof f.acceptedAnswer === "object"
                  ? f.acceptedAnswer.text
                  : String(f.acceptedAnswer);
              if (f.name && ans) {
                parsedFaqs.push({ question: String(f.name), answer: String(ans) });
              }
            } else if (f.question && (f.answer || f.ans)) {
              parsedFaqs.push({
                question: String(f.question),
                answer: String(f.answer || f.ans),
              });
            } else if (f.q && (f.a || f.answer)) {
              parsedFaqs.push({
                question: String(f.q),
                answer: String(f.a || f.answer),
              });
            }
          }
          if (parsedFaqs.length > 0) {
            setFaqList(parsedFaqs);
            setAeoExpanded(true);
            appliedFields.push(`${parsedFaqs.length} FAQs`);
          }
        }

        // 12. SEO Title & Description
        const newSeoTitle = blogObj.seoTitle || blogObj.metaTitle;
        if (newSeoTitle) {
          setSeoTitle(String(newSeoTitle));
          setSeoExpanded(true);
          appliedFields.push("SEO Title");
        }
        const newSeoDesc = blogObj.seoDescription || blogObj.metaDescription;
        if (newSeoDesc) {
          setSeoDescription(String(newSeoDesc));
          setSeoExpanded(true);
          appliedFields.push("SEO Description");
        }

        // 13. OG Image & Canonical
        const newOgImg = extractImageUrl(blogObj.ogImageUrl || blogObj.ogImage);
        if (newOgImg) {
          setOgImageUrl(newOgImg);
          setSeoExpanded(true);
        }
        const newCanonical =
          blogObj.canonicalUrl ||
          (blogObj.mainEntityOfPage && typeof blogObj.mainEntityOfPage === "object"
            ? blogObj.mainEntityOfPage["@id"]
            : typeof blogObj.mainEntityOfPage === "string"
            ? blogObj.mainEntityOfPage
            : "");
        if (newCanonical) {
          setCanonicalUrl(String(newCanonical));
          setSeoExpanded(true);
        }

        // 14. Geo Focus
        const rawGeo = blogObj.geoFocus;
        if (Array.isArray(rawGeo) && rawGeo.length > 0) {
          setGeoFocusInput(rawGeo.map(String).filter(Boolean).join(", "));
        } else if (typeof rawGeo === "string" && rawGeo.trim()) {
          setGeoFocusInput(rawGeo.trim());
        }

        // 15. Language
        if (blogObj.language === "hi" || blogObj.inLanguage === "hi") {
          setLanguage("hi");
        } else if (blogObj.language === "en" || blogObj.inLanguage === "en") {
          setLanguage("en");
        }

        // 16. Status & Featured
        if (
          blogObj.status &&
          Object.values(PostStatus).includes(blogObj.status as PostStatus)
        ) {
          setStatus(blogObj.status as PostStatus);
        }
        if (typeof blogObj.featured === "boolean") {
          setFeatured(blogObj.featured);
        }
      }

      if (appliedFields.length === 0) {
        setSchemaStatus({
          type: "error",
          message:
            "Could not detect recognizable content (Title, Body, FAQs, etc.). Please check your pasted text.",
        });
        return;
      }

      setSchemaStatus({
        type: "success",
        message: `Content & metadata successfully applied! ${appliedFields.length} fields filled in form & live preview.`,
        details: appliedFields,
      });

      if (shouldSwitchToPreview) {
        setActiveTab("preview");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const el = document.getElementById("post-form-top");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    } catch (err: any) {
      setSchemaStatus({
        type: "error",
        message: `Error parsing content: ${err?.message || "Please check format."}`,
      });
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
      coverImageLink: coverImageLink.trim(),
      showBannerPopup,
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
            <button
              type="button"
              onClick={() => {
                setActiveTab("edit");
                setTimeout(() => {
                  document.getElementById("schema-import-box")?.scrollIntoView({ behavior: "smooth" });
                }, 50);
              }}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 flex items-center gap-1 transition-all"
              title="Jump to Schema / JSON Quick Import Box"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Import Schema</span>
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
              {coverImageLink && (
                <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-amber-400 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-amber-500/30 shadow-md">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Banner Link: {coverImageLink}</span>
                </div>
              )}
              {showBannerPopup && (
                <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Popup Modal Active</span>
                </div>
              )}
            </div>
          )}

          {coverImageUrl && showBannerPopup && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs gap-3">
              <span className="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                Banner is configured to open in a Popup Modal with click tracking when readers visit this article.
              </span>
              <button
                type="button"
                onClick={() => setPreviewPopupModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors shadow-xs cursor-pointer shrink-0"
              >
                Test Popup Modal
              </button>
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

          {faqList.filter((f) => f.question && f.answer).length > 0 && (
            <div className="max-w-prose mx-auto pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                Frequently Asked Questions
              </h4>
              <div className="space-y-3">
                {faqList
                  .filter((f) => f.question && f.answer)
                  .map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
                    >
                      <h5 className="font-semibold text-slate-900 dark:text-white text-sm mb-1.5">
                        {faq.question}
                      </h5>
                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Editor Mode */
        <div id="post-form-top" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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

            {/* Quick Content & Schema Auto-Fill Box */}
            <div
              id="schema-import-box"
              className="p-6 rounded-2xl bg-gradient-to-b from-amber-500/5 via-white to-white dark:from-amber-500/10 dark:via-[#10121a] dark:to-[#10121a] border-2 border-dashed border-amber-500/40 dark:border-amber-500/30 space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Smart Article & Content Quick Paste
                      </h3>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                        Text + JSON + Content
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Aap raw article text / markdown paste karein ya JSON schema — Title, Excerpt, FAQs aur <strong>POORA ARTICLE CONTENT</strong> apne aap form aur preview me fill ho jayega.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyTemplate("text")}
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1.5 transition-all shadow-xs"
                    title="Copy easy raw text/markdown prompt template"
                  >
                    {copiedTemplate === "text" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied Text!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Text Template</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyTemplate("json")}
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1.5 transition-all shadow-xs"
                    title="Copy structured JSON schema template"
                  >
                    {copiedTemplate === "json" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied JSON!</span>
                      </>
                    ) : (
                      <>
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Copy JSON Schema</span>
                      </>
                    )}
                  </button>

                  {schemaRawInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setSchemaRawInput("");
                        setSchemaStatus({ type: null, message: "" });
                      }}
                      className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-rose-500 transition-colors"
                      title="Clear textarea"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Status Alert */}
              {schemaStatus.type === "success" && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{schemaStatus.message}</span>
                  </div>
                  {schemaStatus.details && schemaStatus.details.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {schemaStatus.details.map((field, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 text-[11px] font-medium"
                        >
                          ✓ {field}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {schemaStatus.type === "error" && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{schemaStatus.message}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono text-[11px] flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Paste Raw Article Text, Markdown, or JSON:</span>
                  </span>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    Auto-converts markdown headings & paragraphs to HTML
                  </span>
                </div>
                <textarea
                  rows={10}
                  value={schemaRawInput}
                  onChange={(e) => setSchemaRawInput(e.target.value)}
                  placeholder={`Title: Article Ka Title Yahan Likhein\nExcerpt: 1-2 line summary...\nCover: https://images.unsplash.com/photo-...\nCategory: Technology\nTags: Tech, AI, India\n\nKey Takeaways:\n- Pehla main point\n- Doosra main point\n\n## Introduction\nYahan poora article content paragraphs me paste kar sakte hain...\n\n## Subheading\nAgla paragraph... Markdown headings (##) aur lists (- ) apne aap formatted HTML ban jayenge.\n\nFAQs:\nQ: Question 1?\nA: Answer 1.\n\n(YA FIR AAP JSON SCHEMA BHI DIRECT PASTE KAR SAKTE HAIN)`}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/40 placeholder:text-slate-400/70 shadow-inner"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  💡 <strong>Tip:</strong> ChatGPT ya Google Docs se seedha Title aur Content copy karke yahan daalein — ek click me poora blog form aur live preview me load ho jayega!
                </p>

                <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => handleApplySchema(false)}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Apply to Form (फॉर्म में भरें)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplySchema(true)}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white dark:bg-slate-800 dark:text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span>Apply & View Preview</span>
                  </button>
                </div>
              </div>
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Banner Link / Click Destination (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={coverImageLink}
                    onChange={(e) => setCoverImageLink(e.target.value)}
                    placeholder="https://... or /category/... (Clicking banner will open this)"
                    className="w-full px-3 py-2 pr-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                  {coverImageLink && (
                    <a
                      href={coverImageLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors"
                      title="Test Banner Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  Optional: When readers click the article cover banner, they will be redirected to this URL.
                </p>
              </div>

              {/* Banner Popup Toggle Setting (True/False or Yes/No) */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Display Banner in Popup Modal?
                  </label>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      showBannerPopup
                        ? "bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {showBannerPopup ? "Popup Active (True)" : "Disabled (False)"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBannerPopup(true)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                      showBannerPopup
                        ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md ring-2 ring-amber-500/20"
                        : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-slate-950" />
                    <span>Yes (Show Popup)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowBannerPopup(false)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                      !showBannerPopup
                        ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-white border-slate-900 dark:border-slate-700 shadow-md ring-2 ring-slate-900/20"
                        : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>No (Standard Banner)</span>
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                  Agar <strong>Yes (True)</strong> select karenge, to article page load hone par banner image popup window me show hogi aur uspe click tracking active rahegi.
                </p>

                {initialPost?.bannerClicks !== undefined && initialPost.bannerClicks > 0 && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Banner & Popup Clicks
                    </span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-950 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                      {initialPost.bannerClicks} clicks tracked
                    </span>
                  </div>
                )}
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

      {/* Test Popup Modal for Editor Preview - Compact Size */}
      {previewPopupModal && coverImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setPreviewPopupModal(false)}
        >
          <div
            className="relative w-full max-w-[340px] sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-amber-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3.5 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Popup Modal Test Preview
              </span>
              <button
                type="button"
                onClick={() => setPreviewPopupModal(false)}
                className="p-1.5 sm:p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                aria-label="Close test modal"
              >
                <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>
            </div>

            <div className="relative w-full h-[170px] sm:h-[240px] md:h-[300px] lg:h-[340px] bg-slate-100 dark:bg-slate-950">
              <Image
                src={coverImageUrl}
                alt={coverImageAlt || title || "Cover"}
                fill
                className="object-cover"
              />
            </div>

            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm md:text-base font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {coverImageAlt || title || "Banner Title"}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                  {coverImageLink ? `Target: ${coverImageLink}` : "No link attached"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewPopupModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
                {coverImageLink && (
                  <a
                    href={coverImageLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider bg-amber-500 text-slate-950 hover:bg-amber-400 flex items-center gap-1.5 shadow-md"
                  >
                    <span>Visit Deal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
