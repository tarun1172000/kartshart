import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { PostStatus } from "@/lib/constants";

export interface IFaqItem {
  question: string;
  answer: string;
}

export interface IPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  contentText: string;
  coverImageUrl: string;
  coverImageAlt: string;
  coverImageCredit?: string;
  authorId: Types.ObjectId;
  authorName?: string;
  categoryId: Types.ObjectId;
  tags: string[];
  status: PostStatus;
  featured: boolean;
  publishedAt?: Date;
  readingTimeMinutes: number;
  seoTitle?: string;
  seoDescription?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  faq: IFaqItem[];
  keyTakeaways: string[];
  geoFocus: string[];
  language: "en" | "hi";
  allowIndex: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const FaqItemSchema = new Schema<IFaqItem>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    contentHtml: {
      type: String,
      required: true,
    },
    contentText: {
      type: String,
      required: true,
    },
    coverImageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    coverImageAlt: {
      type: String,
      required: true,
      trim: true,
    },
    coverImageCredit: {
      type: String,
      trim: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(PostStatus),
      default: PostStatus.DRAFT,
      required: true,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      index: true,
    },
    readingTimeMinutes: {
      type: Number,
      default: 1,
    },
    seoTitle: {
      type: String,
      trim: true,
    },
    seoDescription: {
      type: String,
      trim: true,
    },
    ogImageUrl: {
      type: String,
      trim: true,
    },
    canonicalUrl: {
      type: String,
      trim: true,
    },
    faq: {
      type: [FaqItemSchema],
      default: [],
    },
    keyTakeaways: {
      type: [String],
      default: [],
    },
    geoFocus: {
      type: [String],
      default: [],
    },
    language: {
      type: String,
      enum: ["en", "hi"],
      default: "en",
    },
    allowIndex: {
      type: Boolean,
      default: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast queries by status and publishedAt
PostSchema.index({ status: 1, publishedAt: -1 });
PostSchema.index({ categoryId: 1, status: 1, publishedAt: -1 });

export const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);

export default Post;
