import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/jwt";
import { rateLimit, clientIp } from "@/lib/security/rate-limit";

const LoginSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export async function POST(request: Request) {
  const limited = rateLimit(`login:${clientIp(request)}`, {
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });
  if (!limited.allowed) {
    return NextResponse.json(
      {
        error: "Too many sign-in attempts. Please wait a few minutes and try again.",
        retryAfterMs: limited.retryAfterMs,
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const validated = LoginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validated.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true },
    });

    if (!user || !user.passwordHash || user.deletedAt) {
      return NextResponse.json(
        { error: "Invalid email address or password." },
        { status: 401 }
      );
    }

    // Timing-safe password verification
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email address or password." },
        { status: 401 }
      );
    }

    const fullName = user.profile?.fullName || "UPORA User";

    // Generate cryptographic JWT session
    const sessionToken = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName,
    });

    // Set secure HTTP-only cookie
    await setSessionCookie(sessionToken);

    return NextResponse.json({
      message: "Sign in successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName,
        countryCode: user.profile?.countryCode,
        timezone: user.profile?.timezone,
        reputationScore: user.profile?.reputationScore
          ? Number(user.profile.reputationScore)
          : 100.0,
      },
    });
  } catch (error: any) {
    console.error("Login route error:", error);
    return NextResponse.json(
      {
        error:
          "Unable to complete sign in. Please verify your connection or DATABASE_URL.",
      },
      { status: 500 }
    );
  }
}
