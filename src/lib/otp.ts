import crypto from "crypto";
import { OtpToken } from "@/models/OtpToken";
import connectToDatabase from "@/lib/mongodb";

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;

// Generate 6-digit numeric OTP string
export function generateOtpCode(): string {
  // Generates cryptographically secure 6-digit number between 100000 and 999999
  const num = crypto.randomInt(100000, 1000000);
  return num.toString();
}

// Hash the OTP with a secret pepper and email salt
export function hashOtpCode(code: string, email: string): string {
  const pepper = process.env.OTP_PEPPER || "kartshart_otp_secret_pepper_default";
  return crypto
    .createHmac("sha256", pepper)
    .update(`${email.toLowerCase().trim()}:${code}`)
    .digest("hex");
}

export interface CreateOtpResult {
  code: string;
  expiresAt: Date;
}

export async function createAndSaveOtp(
  email: string,
  ip?: string,
  userAgent?: string
): Promise<CreateOtpResult> {
  await connectToDatabase();
  const normalizedEmail = email.toLowerCase().trim();

  // Invalidate any previous active OTPs for this email
  await OtpToken.updateMany(
    { email: normalizedEmail, consumed: false },
    { $set: { consumed: true } }
  );

  const code = generateOtpCode();
  const codeHash = hashOtpCode(code, normalizedEmail);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await OtpToken.create({
    email: normalizedEmail,
    codeHash,
    expiresAt,
    attempts: 0,
    consumed: false,
    ip,
    userAgent,
  });

  return { code, expiresAt };
}

export interface VerifyOtpResult {
  success: boolean;
  error?: string;
}

export async function verifyOtpCode(
  email: string,
  code: string
): Promise<VerifyOtpResult> {
  await connectToDatabase();
  const normalizedEmail = email.toLowerCase().trim();
  const cleanCode = code.trim();

  const tokenRecord = await OtpToken.findOne({
    email: normalizedEmail,
    consumed: false,
  }).sort({ createdAt: -1 });

  if (!tokenRecord) {
    return {
      success: false,
      error: "No active verification code found. Please request a new code.",
    };
  }

  // Check expiry
  if (new Date() > tokenRecord.expiresAt) {
    tokenRecord.consumed = true;
    await tokenRecord.save();
    return {
      success: false,
      error: "Verification code has expired. Please request a new code.",
    };
  }

  // Check attempts
  if (tokenRecord.attempts >= MAX_ATTEMPTS) {
    tokenRecord.consumed = true;
    await tokenRecord.save();
    return {
      success: false,
      error: "Too many failed attempts. This code is locked. Please request a new code.",
    };
  }

  const expectedHash = hashOtpCode(cleanCode, normalizedEmail);

  if (crypto.timingSafeEqual(Buffer.from(tokenRecord.codeHash), Buffer.from(expectedHash))) {
    tokenRecord.consumed = true;
    await tokenRecord.save();
    return { success: true };
  } else {
    tokenRecord.attempts += 1;
    if (tokenRecord.attempts >= MAX_ATTEMPTS) {
      tokenRecord.consumed = true;
    }
    await tokenRecord.save();
    return {
      success: false,
      error: `Invalid code. ${MAX_ATTEMPTS - tokenRecord.attempts} attempts remaining.`,
    };
  }
}
