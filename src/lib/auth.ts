import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { Role, UserStatus, SUPER_ADMIN_EMAIL } from "@/lib/constants";
import connectToDatabase from "@/lib/mongodb";
import { User, IUser } from "@/models/User";

export const SESSION_COOKIE_NAME = "kartshart_session";
const SESSION_EXPIRY_DAYS = 7;

function getJwtSecret(): Uint8Array {
  const secret =
    process.env.SESSION_SECRET ||
    "kartshart_super_secure_jwt_session_secret_change_in_production_32chars!";
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: Role;
  [key: string]: unknown;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const secret = getJwtSecret();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_EXPIRY_DAYS}d`)
    .sign(secret);
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Validates session cookie AND loads fresh user from database
 * This ensures role changes or revoked access are applied immediately.
 */
export async function getSessionUser(): Promise<IUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return null;
    }

    const payload = await verifySessionToken(sessionCookie);
    if (!payload || !payload.userId) {
      return null;
    }

    await connectToDatabase();
    const user = await User.findById(payload.userId);

    if (!user) {
      return null;
    }

    // Super admin safety check
    if (user.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL) {
      if (user.role !== Role.SUPER_ADMIN || user.status !== UserStatus.ACTIVE) {
        user.role = Role.SUPER_ADMIN;
        user.status = UserStatus.ACTIVE;
        await user.save();
      }
      return user;
    }

    // Check if user status is active
    if (user.status !== UserStatus.ACTIVE) {
      return null;
    }

    // Must have an approved dashboard role
    if (user.role === Role.PENDING || user.role === Role.REJECTED) {
      return null;
    }

    return user;
  } catch (err) {
    console.error("Error in getSessionUser:", err);
    return null;
  }
}

/**
 * Server action / Route protection helper
 */
export async function requireUser(): Promise<IUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Unauthorized. Please log in.");
  }
  return user;
}

/**
 * Require specific role or roles
 */
export async function requireRole(allowedRoles: Role[]): Promise<IUser> {
  const user = await requireUser();

  // Super admin always has access to everything
  if (user.role === Role.SUPER_ADMIN || user.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL) {
    return user;
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden: You do not have sufficient permissions.");
  }

  return user;
}
