import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/jwt";
import { GlobalRole } from "@prisma/client";

const RegisterSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  role: z.enum(["WORKER", "CLIENT", "TALENT"]).default("WORKER"),
  countryCode: z.string().optional().default("NG"),
  timezone: z.string().optional().default("UTC"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = RegisterSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password, fullName, role, countryCode, timezone } =
      validated.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    // Hash password with bcrypt
    const passwordHash = await hashPassword(password);

    // Normalize role
    const assignedRole =
      role === "CLIENT" ? GlobalRole.CLIENT : GlobalRole.WORKER;

    // Create User, Profile, and initial Wallet in an ACID transaction
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: assignedRole,
        isEmailVerified: false,
        profile: {
          create: {
            fullName,
            countryCode,
            timezone,
            preferredCurrency: "USD",
            reputationScore: 100.0,
          },
        },
        wallet: {
          create: {
            currency: "USD",
            availableBalance: 0.0,
            pendingEscrowBalance: 0.0,
            lifetimeEarnings: 0.0,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Generate cryptographic JWT session
    const sessionToken = await createSessionToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.profile?.fullName || fullName,
    });

    // Set secure HTTP-only cookie
    await setSessionCookie(sessionToken);

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          fullName: newUser.profile?.fullName || fullName,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        error:
          "Unable to complete registration. If the database is currently unreachable, check DATABASE_URL.",
      },
      { status: 500 }
    );
  }
}
