import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "upora_session";
const DEFAULT_JWT_SECRET =
  "upora_super_secret_jwt_key_32_characters_minimum_production_grade";

function getJwtSecretKey(): Uint8Array {
  if (process.env.JWT_SECRET) {
    return new TextEncoder().encode(process.env.JWT_SECRET);
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET is not configured. Set a strong random secret in production."
    );
  }
  // Local development fallback only — never rely on this in production.
  return new TextEncoder().encode(DEFAULT_JWT_SECRET);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  let verifiedPayload: any = null;

  if (sessionCookie?.value) {
    try {
      const { payload } = await jwtVerify(
        sessionCookie.value,
        getJwtSecretKey(),
        {
          algorithms: ["HS256"],
        }
      );
      verifiedPayload = payload;
    } catch (e) {
      // Invalid or expired token
    }
  }

  // 1. Admin Protected Routes
  if (pathname.startsWith("/admin")) {
    if (!verifiedPayload) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (verifiedPayload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 2. Client Protected Routes (e.g. /client/*)
  if (pathname.startsWith("/client")) {
    if (!verifiedPayload) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (verifiedPayload.role !== "CLIENT" && verifiedPayload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 3. Prevent logged-in users from accessing login/register
  if (pathname === "/login" || pathname === "/register") {
    if (verifiedPayload) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/client/:path*",
    "/login",
    "/register",
  ],
};
