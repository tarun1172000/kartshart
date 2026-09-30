import mongoose, { Schema, Document, Model } from "mongoose";
import { Role, UserStatus } from "@/lib/constants";

export interface IUser extends Document {
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  lastLoginAt?: Date;
  createdByApprovalAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.PENDING,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.PENDING,
      required: true,
      index: true,
    },
    lastLoginAt: {
      type: Date,
    },
    createdByApprovalAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation in development
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
