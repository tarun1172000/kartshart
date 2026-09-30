import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOtpToken extends Document {
  email: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  consumed: boolean;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

const OtpTokenSchema = new Schema<IOtpToken>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index to automatically remove expired tokens
    },
    attempts: {
      type: Number,
      default: 0,
    },
    consumed: {
      type: Boolean,
      default: false,
    },
    ip: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const OtpToken: Model<IOtpToken> =
  mongoose.models.OtpToken ||
  mongoose.model<IOtpToken>("OtpToken", OtpTokenSchema);

export default OtpToken;
