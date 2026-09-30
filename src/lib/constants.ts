export const SUPER_ADMIN_EMAIL = (
  process.env.SUPER_ADMIN_EMAIL || "tarunwaliya780@gmail.com"
).toLowerCase().trim();

export const SITE_NAME = "Kartshart";
export const SITE_TAGLINE = "Independent Perspectives, Thoughtful Editorial & Modern Insights";
export const SITE_DESCRIPTION =
  "Kartshart is a modern editorial magazine and publishing platform featuring deep-dive articles across technology, business, lifestyle, culture, and India.";

export const DEFAULT_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://kartshart.com";

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN", // can manage all posts & categories
  EDITOR = "EDITOR", // can create/edit own posts, submit for publish
  PENDING = "PENDING", // requested, not approved
  REJECTED = "REJECTED",
}

export enum UserStatus {
  ACTIVE = "active",
  PENDING = "pending",
  REJECTED = "rejected",
  REVOKED = "revoked",
}

export enum PostStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export const DEFAULT_CATEGORIES = [
  {
    name: "Technology",
    slug: "technology",
    description: "Innovations, software development, artificial intelligence, and digital transformation.",
    seoTitle: "Technology & AI Insights | Kartshart",
    seoDescription: "Explore in-depth articles on emerging technologies, AI developments, and digital products.",
  },
  {
    name: "Business",
    slug: "business",
    description: "Startups, economics, finance, venture capital, and market strategies.",
    seoTitle: "Business & Startup Analysis | Kartshart",
    seoDescription: "Thoughtful breakdowns of modern business models, entrepreneurship, and economic trends.",
  },
  {
    name: "Lifestyle",
    slug: "lifestyle",
    description: "Productivity, wellness, modern living, books, and deliberate routines.",
    seoTitle: "Modern Lifestyle & Culture | Kartshart",
    seoDescription: "Curated essays on intentional living, creative workflows, and cultural observations.",
  },
  {
    name: "India",
    slug: "india",
    description: "The digital economy, tech ecosystem, policy, infrastructure, and cultural dynamism in India.",
    seoTitle: "India Tech & Growth Stories | Kartshart",
    seoDescription: "Stories from India's surging startup ecosystem, technological infrastructure, and growth landscape.",
  },
  {
    name: "Guides",
    slug: "guides",
    description: "Practical tutorials, step-by-step masterclasses, and hands-on walkthroughs.",
    seoTitle: "Comprehensive Guides & Tutorials | Kartshart",
    seoDescription: "Actionable, easy-to-follow masterclasses and guides built for practitioners.",
  },
];
