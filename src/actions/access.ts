"use server";

import { revalidatePath } from "next/cache";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models/User";
import { AccessRequest, AccessRequestStatus } from "@/models/AccessRequest";
import { requireRole } from "@/lib/auth";
import { Role, UserStatus, SUPER_ADMIN_EMAIL } from "@/lib/constants";
import { sendAccessApprovedEmail, sendAccessRejectedEmail } from "@/lib/email";

export async function approveAccessRequestAction(
  requestId: string,
  assignedRole: Role.ADMIN | Role.EDITOR
) {
  try {
    // Only SUPER_ADMIN can approve access
    const adminUser = await requireRole([Role.SUPER_ADMIN]);
    await connectToDatabase();

    // Prevent granting SUPER_ADMIN
    if ((assignedRole as Role) === Role.SUPER_ADMIN) {
      return {
        success: false,
        error: "SUPER_ADMIN role cannot be assigned to another user.",
      };
    }

    const request = await AccessRequest.findById(requestId);
    if (!request) {
      return { success: false, error: "Access request not found." };
    }

    const email = request.email.toLowerCase().trim();

    // Create or update User record
    const user = await User.findOne({ email });
    if (!user) {
      await User.create({
        name: request.name,
        email,
        role: assignedRole,
        status: UserStatus.ACTIVE,
        createdByApprovalAt: new Date(),
        notes: `Approved by Super Admin from request: "${request.reason}"`,
      });
    } else {
      user.role = assignedRole;
      user.status = UserStatus.ACTIVE;
      user.createdByApprovalAt = new Date();
      await user.save();
    }

    // Update request
    request.status = AccessRequestStatus.APPROVED;
    request.reviewedBy = adminUser._id;
    request.reviewedAt = new Date();
    await request.save();

    // Send confirmation email to approved user
    await sendAccessApprovedEmail(email, request.name, assignedRole);

    revalidatePath("/dashboard/access-requests");
    revalidatePath("/dashboard/users");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Access approved for ${request.name} as ${assignedRole}. Notification email sent!`,
    };
  } catch (err: unknown) {
    console.error("approveAccessRequestAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to approve access request.",
    };
  }
}

export async function rejectAccessRequestAction(
  requestId: string,
  reviewNote?: string
) {
  try {
    const adminUser = await requireRole([Role.SUPER_ADMIN]);
    await connectToDatabase();

    const request = await AccessRequest.findById(requestId);
    if (!request) {
      return { success: false, error: "Access request not found." };
    }

    const email = request.email.toLowerCase().trim();

    // Update or create user with REJECTED status
    const user = await User.findOne({ email });
    if (user) {
      user.role = Role.REJECTED;
      user.status = UserStatus.REJECTED;
      user.notes = reviewNote || "Rejected by Super Admin";
      await user.save();
    }

    // Update request
    request.status = AccessRequestStatus.REJECTED;
    request.reviewedBy = adminUser._id;
    request.reviewedAt = new Date();
    request.reviewNote = reviewNote;
    await request.save();

    // Send rejection email
    await sendAccessRejectedEmail(email, request.name, reviewNote);

    revalidatePath("/dashboard/access-requests");
    revalidatePath("/dashboard/users");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Access request from ${request.name} was rejected.`,
    };
  } catch (err: unknown) {
    console.error("rejectAccessRequestAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to reject access request.",
    };
  }
}

export async function updateUserRoleAction(userId: string, newRole: Role) {
  try {
    await requireRole([Role.SUPER_ADMIN]);
    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, error: "User not found." };
    }

    // Cannot modify hardcoded Super Admin
    if (user.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL) {
      return {
        success: false,
        error: "Super Admin role cannot be modified.",
      };
    }

    // Cannot make another user SUPER_ADMIN
    if (newRole === Role.SUPER_ADMIN) {
      return {
        success: false,
        error: "SUPER_ADMIN role cannot be assigned to another user.",
      };
    }

    user.role = newRole;
    if (newRole === Role.PENDING || newRole === Role.REJECTED) {
      user.status = UserStatus.REVOKED;
    } else {
      user.status = UserStatus.ACTIVE;
    }

    await user.save();

    revalidatePath("/dashboard/users");
    return {
      success: true,
      message: `User role updated to ${newRole}.`,
    };
  } catch (err: unknown) {
    console.error("updateUserRoleAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update user role.",
    };
  }
}

export async function revokeUserAccessAction(userId: string) {
  try {
    await requireRole([Role.SUPER_ADMIN]);
    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, error: "User not found." };
    }

    if (user.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL) {
      return {
        success: false,
        error: "Super Admin access cannot be revoked.",
      };
    }

    user.status = UserStatus.REVOKED;
    user.role = Role.REJECTED;
    await user.save();

    revalidatePath("/dashboard/users");
    return { success: true, message: `Access revoked for ${user.email}.` };
  } catch (err: unknown) {
    console.error("revokeUserAccessAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to revoke access.",
    };
  }
}
