"use server";

import { z } from "zod";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models/User";
import { AccessRequest, AccessRequestStatus } from "@/models/AccessRequest";
import { createAndSaveOtp, verifyOtpCode } from "@/lib/otp";
import {
  sendOtpEmail,
  sendAccessRequestReceivedEmail,
  sendNewAccessRequestToAdminEmail,
} from "@/lib/email";
import {
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/auth";
import {
  SUPER_ADMIN_EMAIL,
  Role,
  UserStatus,
} from "@/lib/constants";
import { ensureDatabaseSeeded } from "@/lib/seed";

const SendOtpSchema = z.object({
  email: z.string().email("Please enter a valid email address").trim().toLowerCase(),
});

const VerifyOtpSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  code: z.string().min(6, "Code must be 6 digits").max(6, "Code must be 6 digits"),
});

const RequestAccessSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Please enter a valid email address").trim().toLowerCase(),
  reason: z
    .string()
    .min(20, "Please provide a detailed reason (at least 20 characters)")
    .max(1000)
    .trim(),
});

/**
 * Step 1: Send OTP to email
 */
export async function sendOtpAction(rawEmail: string) {
  try {
    const parseResult = SendOtpSchema.safeParse({ email: rawEmail });
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.errors[0].message };
    }

    const { email } = parseResult.data;
    await connectToDatabase();
    await ensureDatabaseSeeded();

    const isSuperAdmin = email === SUPER_ADMIN_EMAIL;

    let user = await User.findOne({ email });

    if (isSuperAdmin) {
      if (!user) {
        user = await User.create({
          name: "Tarun Waliya",
          email,
          role: Role.SUPER_ADMIN,
          status: UserStatus.ACTIVE,
        });
      } else if (user.role !== Role.SUPER_ADMIN || user.status !== UserStatus.ACTIVE) {
        user.role = Role.SUPER_ADMIN;
        user.status = UserStatus.ACTIVE;
        await user.save();
      }
    } else {
      // Regular user check
      if (!user) {
        return {
          success: false,
          error: "No account found with this email. Please request dashboard access first.",
          notRegistered: true,
        };
      }

      if (user.status === UserStatus.PENDING || user.role === Role.PENDING) {
        return {
          success: false,
          error: "Your dashboard access request is currently pending review by the Super Admin.",
          isPending: true,
        };
      }

      if (user.status === UserStatus.REJECTED || user.role === Role.REJECTED) {
        return {
          success: false,
          error: "Your dashboard access request was not approved.",
        };
      }

      if (user.status === UserStatus.REVOKED) {
        return {
          success: false,
          error: "Your dashboard access has been revoked. Please contact the administrator.",
        };
      }

      if (user.role !== Role.ADMIN && user.role !== Role.EDITOR) {
        return {
          success: false,
          error: "You do not have active dashboard access privileges.",
        };
      }
    }

    // Generate & send OTP
    const { code } = await createAndSaveOtp(email);
    await sendOtpEmail(email, code);

    return {
      success: true,
      message: `A 6-digit verification code has been sent to ${email}`,
    };
  } catch (err: unknown) {
    console.error("sendOtpAction error:", err);
    return {
      success: false,
      error: "Failed to send verification code. Please try again in a few moments.",
    };
  }
}

/**
 * Step 2: Verify OTP and create session
 */
export async function verifyOtpAction(rawEmail: string, rawCode: string) {
  try {
    const parseResult = VerifyOtpSchema.safeParse({
      email: rawEmail,
      code: rawCode,
    });

    if (!parseResult.success) {
      return { success: false, error: parseResult.error.errors[0].message };
    }

    const { email, code } = parseResult.data;
    await connectToDatabase();

    const verifyResult = await verifyOtpCode(email, code);
    if (!verifyResult.success) {
      return { success: false, error: verifyResult.error };
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return {
        success: false,
        error: "User record not found. Please request access.",
      };
    }

    // Enforce super admin rules
    if (email === SUPER_ADMIN_EMAIL) {
      user.role = Role.SUPER_ADMIN;
      user.status = UserStatus.ACTIVE;
    }

    // Check status
    if (user.status !== UserStatus.ACTIVE) {
      return {
        success: false,
        error: "Your account is not active.",
      };
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Create session JWT and cookie
    const token = await createSessionToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    await setSessionCookie(token);

    return {
      success: true,
      role: user.role,
      redirectTo: "/dashboard",
    };
  } catch (err: unknown) {
    console.error("verifyOtpAction error:", err);
    return {
      success: false,
      error: "An unexpected error occurred during verification. Please try again.",
    };
  }
}

/**
 * Step 3: Request Access
 */
export async function requestAccessAction(data: {
  name: string;
  email: string;
  reason: string;
}) {
  try {
    const parseResult = RequestAccessSchema.safeParse(data);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.errors[0].message };
    }

    const { name, email, reason } = parseResult.data;
    await connectToDatabase();
    await ensureDatabaseSeeded();

    if (email === SUPER_ADMIN_EMAIL) {
      return {
        success: false,
        error: "This email is the Super Admin. You can log in directly on the login page.",
      };
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.status === UserStatus.ACTIVE) {
        return {
          success: false,
          error: "Your account is already active and approved. You can log in directly.",
        };
      }
      if (existingUser.status === UserStatus.PENDING) {
        return {
          success: false,
          error: "An access request for this email is already awaiting Super Admin review.",
        };
      }
      if (existingUser.status === UserStatus.REJECTED) {
        return {
          success: false,
          error: "Your previous access request was rejected. Please contact the administrator directly.",
        };
      }
    }

    // Create or update pending user
    if (!existingUser) {
      await User.create({
        name,
        email,
        role: Role.PENDING,
        status: UserStatus.PENDING,
        notes: `Access requested: "${reason}"`,
      });
    }

    // Save AccessRequest record
    await AccessRequest.create({
      name,
      email,
      reason,
      status: AccessRequestStatus.PENDING,
    });

    // Send emails
    await sendAccessRequestReceivedEmail(email, name);
    await sendNewAccessRequestToAdminEmail(
      SUPER_ADMIN_EMAIL,
      name,
      email,
      reason
    );

    return {
      success: true,
      message:
        "Your access request has been submitted successfully! The Super Admin has been notified. You will receive an email once approved.",
    };
  } catch (err: unknown) {
    console.error("requestAccessAction error:", err);
    return {
      success: false,
      error: "Failed to submit access request. Please try again.",
    };
  }
}

/**
 * Logout
 */
export async function logoutAction() {
  await clearSessionCookie();
  return { success: true };
}
