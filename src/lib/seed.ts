import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models/User";
import { Category } from "@/models/Category";
import { Tag } from "@/models/Tag";
import { Post } from "@/models/Post";
import { SiteSettings } from "@/models/SiteSettings";
import {
  SUPER_ADMIN_EMAIL,
  Role,
  UserStatus,
  PostStatus,
  DEFAULT_CATEGORIES,
} from "@/lib/constants";
import { calculateReadingTime } from "@/lib/utils";

export async function ensureDatabaseSeeded() {
  await connectToDatabase();

  // 1. Ensure Super Admin user exists and has SUPER_ADMIN role
  let superAdmin = await User.findOne({ email: SUPER_ADMIN_EMAIL });
  if (!superAdmin) {
    superAdmin = await User.create({
      name: "Tarun Waliya",
      email: SUPER_ADMIN_EMAIL,
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      notes: "Platform Owner and Hardcoded Super Admin",
    });
    console.log("✅ Super Admin created:", SUPER_ADMIN_EMAIL);
  } else if (
    superAdmin.role !== Role.SUPER_ADMIN ||
    superAdmin.status !== UserStatus.ACTIVE
  ) {
    superAdmin.role = Role.SUPER_ADMIN;
    superAdmin.status = UserStatus.ACTIVE;
    await superAdmin.save();
    console.log("✅ Super Admin role enforced:", SUPER_ADMIN_EMAIL);
  }

  // 2. Ensure Default Categories exist
  for (const cat of DEFAULT_CATEGORIES) {
    const exists = await Category.findOne({ slug: cat.slug });
    if (!exists) {
      await Category.create(cat);
      console.log(`✅ Category created: ${cat.name}`);
    }
  }

  // 3. Ensure SiteSettings exist
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create({
      siteName: "Kartshart",
      tagline: "Independent Perspectives, Thoughtful Editorial & Modern Insights",
      description:
        "Kartshart is a modern editorial magazine featuring deep-dive articles across technology, business, lifestyle, culture, and India.",
      defaultOgImageUrl:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop",
      twitterHandle: "@kartshart",
      socialLinks: {
        twitter: "https://twitter.com/kartshart",
        github: "https://github.com/kartshart",
        linkedin: "https://linkedin.com/company/kartshart",
        instagram: "https://instagram.com/kartshart",
        youtube: "https://youtube.com/@kartshart",
      },
      contactEmail: SUPER_ADMIN_EMAIL,
    });
    console.log("✅ Site settings seeded");
  }

  // 4. Ensure Tags exist
  const sampleTags = ["Tech Trends", "India Stack", "AI Revolution", "Deep Work", "Future of Work"];
  for (const tagName of sampleTags) {
    const slug = tagName.toLowerCase().replace(/\s+/g, "-");
    const exists = await Tag.findOne({ slug });
    if (!exists) {
      await Tag.create({ name: tagName, slug });
    }
  }

  // 5. Ensure at least one high-quality sample published post exists
  const postCount = await Post.countDocuments();
  if (postCount === 0) {
    const techCategory = await Category.findOne({ slug: "india" }) || await Category.findOne();

    const sampleContentHtml = `
      <p>India's digital public infrastructure has evolved into a global benchmark for scalable, inclusive technology. From unified payments to identity architecture and open digital commerce, the intersection of technological ambition and grass-roots usability has redefined how modern nations build digital goods.</p>
      
      <h2>The Foundation of Modern Digital Architecture</h2>
      <p>Over the past decade, the conceptual framework behind open protocols, public-private interoperability, and low-cost digital connectivity has lowered friction for over a billion people. Rather than proprietary walled gardens, open protocols enable competing market players to build specialized consumer applications on top of standard foundational rails.</p>
      
      <blockquote>
        "The triumph of modern digital systems is measured not by corporate monopoly, but by universal accessibility and developer velocity across the ecosystem."
      </blockquote>

      <h2>Why Interoperability Is The Real Superpower</h2>
      <p>When software protocols are structured with cryptographic identity verification, instant settlement primitives, and consent-driven data governance, economic friction drops by an order of magnitude. Developers can focus on user experience and specialized workflow logic rather than rebuilding authentication, payment gateways, and banking reconciliations from scratch.</p>

      <h2>Looking Ahead: The Next Decade of Autonomous Commerce</h2>
      <p>As artificial intelligence agents and machine-to-machine transactions proliferate, standardized digital networks will serve as the substrate for autonomous transactions. The future belongs to platforms that can combine speed, cryptographic reliability, and frictionless user experiences.</p>
    `;

    const sampleContentText =
      "India's digital public infrastructure has evolved into a global benchmark for scalable, inclusive technology. From unified payments to identity architecture and open digital commerce, the intersection of technological ambition and grass-roots usability has redefined how modern nations build digital goods. Over the past decade, the conceptual framework behind open protocols, public-private interoperability, and low-cost digital connectivity has lowered friction for over a billion people.";

    await Post.create({
      title: "Building at Scale: How India's Digital Rails are Shaping the Next Era of Innovation",
      slug: "building-at-scale-indias-digital-rails-innovation",
      excerpt:
        "An in-depth exploration of how open protocols, public digital infrastructure, and developer velocity are powering high-impact economic transformation.",
      contentHtml: sampleContentHtml,
      contentText: sampleContentText,
      coverImageUrl:
        "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1200&auto=format&fit=crop",
      coverImageAlt: "Modern architecture reflecting scale and innovation in India",
      coverImageCredit: "Photo via Unsplash",
      authorId: superAdmin._id,
      authorName: "Tarun Waliya",
      categoryId: techCategory?._id,
      tags: ["india-stack", "tech-trends", "future-of-work"],
      status: PostStatus.PUBLISHED,
      featured: true,
      publishedAt: new Date(),
      readingTimeMinutes: calculateReadingTime(sampleContentText),
      seoTitle: "Building at Scale: India's Digital Rails & Innovation | Kartshart",
      seoDescription:
        "An in-depth analysis of open protocols, developer momentum, and scalable digital infrastructure transforming modern industry.",
      faq: [
        {
          question: "What makes digital public infrastructure unique?",
          answer:
            "It treats foundational identity, payment, and data exchange rails as open public goods upon which private innovation can thrive competitively.",
        },
        {
          question: "How does open interoperability benefit developers?",
          answer:
            "Developers can integrate verified payment and identity services in minutes without dealing with fragmented proprietary silos.",
        },
      ],
      keyTakeaways: [
        "Open protocol rails dramatically reduce operational friction for startups and enterprises.",
        "Developer velocity accelerates when authentication and settlement are standardized.",
        "The architecture is purpose-built to scale smoothly into the upcoming AI agent economy.",
      ],
      geoFocus: ["India", "Global"],
      language: "en",
      allowIndex: true,
      viewCount: 124,
    });

    console.log("✅ Sample published post seeded");
  }
}
