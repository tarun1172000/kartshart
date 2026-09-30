import mongoose, { Schema, Document, Model, Types } from "mongoose";

export enum AccessRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface IAccessRequest extends Document {
  name: string;
  email: string;
  reason: string;
  status: AccessRequestStatus;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  reviewNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AccessRequestSchema = new Schema<IAccessRequest>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
    status: {
      type: String,
      enum: Object.values(AccessRequestStatus),
      default: AccessRequestStatus.PENDING,
      required: true,
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    reviewNote: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const AccessRequest: Model<IAccessRequest> =
  mongoose.models.AccessRequest ||
  mongoose.model<IAccessRequest>("AccessRequest", AccessRequestSchema);

export default AccessRequest;
