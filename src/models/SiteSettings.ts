import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISiteSettings extends Document {
  siteName: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  defaultOgImageUrl?: string;
  twitterHandle?: string;
  socialLinks: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  contactEmail: string;
  gaId?: string;
  searchConsole?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    siteName: {
      type: String,
      default: "Kartshart",
      required: true,
      trim: true,
    },
    tagline: {
      type: String,
      default: "Independent Perspectives, Thoughtful Editorial & Modern Insights",
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default:
        "Kartshart is a modern editorial magazine featuring deep-dive articles across technology, business, lifestyle, culture, and India.",
      required: true,
      trim: true,
    },
    logoUrl: {
      type: String,
      trim: true,
    },
    defaultOgImageUrl: {
      type: String,
      trim: true,
    },
    twitterHandle: {
      type: String,
      default: "@kartshart",
      trim: true,
    },
    socialLinks: {
      twitter: { type: String, default: "" },
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    contactEmail: {
      type: String,
      default: "tarunwaliya780@gmail.com",
      trim: true,
    },
    gaId: {
      type: String,
      trim: true,
    },
    searchConsole: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

export default SiteSettings;
