import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type AdPlacement = "top" | "sidebar" | "popup";
export type AdStatus = "active" | "inactive";

export interface IAd extends Document {
  title: string;
  imageUrl: string;
  targetUrl: string;
  placement: AdPlacement;
  status: AdStatus;
  clicks: number;
  impressions: number;
  altText?: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AdSchema = new Schema<IAd>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    targetUrl: {
      type: String,
      required: true,
      trim: true,
    },
    placement: {
      type: String,
      enum: ["top", "sidebar", "popup"],
      default: "top",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      required: true,
      index: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    impressions: {
      type: Number,
      default: 0,
    },
    altText: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

AdSchema.index({ placement: 1, status: 1 });
AdSchema.index({ createdAt: -1 });

if (process.env.NODE_ENV === "development") {
  delete (mongoose.models as any).Ad;
}

export const Ad: Model<IAd> =
  mongoose.models.Ad || mongoose.model<IAd>("Ad", AdSchema);

export default Ad;
