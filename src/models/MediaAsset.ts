import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IMediaAsset extends Document {
  title?: string;
  url: string;
  alt: string;
  credit?: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MediaAssetSchema = new Schema<IMediaAsset>(
  {
    title: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    alt: {
      type: String,
      required: true,
      trim: true,
    },
    credit: {
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

export const MediaAsset: Model<IMediaAsset> =
  mongoose.models.MediaAsset ||
  mongoose.model<IMediaAsset>("MediaAsset", MediaAssetSchema);

export default MediaAsset;
