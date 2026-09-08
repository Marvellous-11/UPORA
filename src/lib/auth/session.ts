import { getSessionTokenFromCookies, verifySessionToken, SessionPayload } from "./jwt";
import { prisma } from "../db/prisma";
import { GlobalRole } from "@prisma/client";

export interface AuthenticatedUser extends SessionPayload {
  headline?: string;
  countryCode?: string;
  timezone?: string;
  avatarUrl?: string;
  reputationScore?: number;
}

/**
 * Retrieves the currently authenticated user based on the verified session cookie.
 * Pulls enriched profile data from Prisma when available.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const token = await getSessionTokenFromCookies();
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { profile: true },
    });

    if (!user || user.deletedAt) return null;

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.profile?.fullName || payload.fullName,
      headline: user.profile?.headline || undefined,
      countryCode: user.profile?.countryCode || undefined,
      timezone: user.profile?.timezone || undefined,
      avatarUrl: user.profile?.avatarUrl || undefined,
      reputationScore: user.profile?.reputationScore
        ? Number(user.profile.reputationScore)
        : 100.0,
    };
  } catch (error) {
    // If database query fails temporarily, fall back gracefully to verified JWT payload
    return {
      ...payload,
    };
  }
}

/**
 * Server-side guard that guarantees an authenticated user or throws an unauthorized error.
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED: You must be signed in to perform this action.");
  }
  return user;
}

/**
 * Server-side guard that guarantees an authenticated user with an authorized role.
 */
export async function requireRole(
  allowedRoles: GlobalRole[]
): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error(
      `FORBIDDEN: Role '${user.role}' does not have permission to access this resource.`
    );
  }
  return user;
}
