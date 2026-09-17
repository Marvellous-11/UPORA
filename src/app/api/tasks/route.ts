import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { apiError } from "@/lib/api/respond";

const createTaskSchema = z.object({
  title: z.string().min(5).max(160),
  description: z.string().min(30).max(5000),
  tier: z.enum(["FOUNDATIONAL", "INTERMEDIATE", "ADVANCED"]),
  budgetAmount: z.number().positive().max(100_000),
  currency: z.string().min(3).max(3).default("USD"),
  requiredSkills: z.array(z.string().min(2).max(120)).min(1).max(20),
  deadline: z.coerce.date(),
});

const listQuerySchema = z.object({
  tier: z.enum(["FOUNDATIONAL", "INTERMEDIATE", "ADVANCED"]).optional(),
  status: z.string().optional(),
});

/** Lists open marketplace tasks (with the caller's application, if any). */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  const raw = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = listQuerySchema.safeParse(raw);

  try {
    const where: Record<string, unknown> = {};
    if (parsed.success) {
      if (parsed.data.tier) where.tier = parsed.data.tier;
      if (parsed.data.status) where.status = parsed.data.status;
    } else {
      where.status = "OPEN_FOR_APPLICATIONS";
    }

    const tasks = await prisma.marketplaceTask.findMany({
      where,
      include: {
        client: { select: { id: true, profile: { select: { fullName: true, headline: true } } } },
        applications: user
          ? { where: { talentId: user.userId }, select: { id: true, status: true } }
          : false,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      tasks: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        tier: t.tier,
        budgetAmount: Number(t.budgetAmount),
        currency: t.currency,
        requiredSkills: t.requiredSkills,
        status: t.status,
        deadline: t.deadline,
        clientName: t.client.profile?.fullName || "UPORA Client",
        clientHeadline: t.client.profile?.headline || null,
        isMine: user ? user.userId === t.clientId : false,
        myApplication: user ? t.applications[0] ?? null : null,
        applicantCount: t._count.applications,
      })),
    });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return apiError(500, "Failed to retrieve marketplace tasks.");
  }
}

/** Creates a client-owned marketplace task. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "You must be signed in to post a task.");
  if (user.role !== "CLIENT" && user.role !== "ADMIN") {
    return apiError(403, "Only client accounts can post marketplace tasks.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, "Invalid JSON body.");
  }

  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, parsed.error.errors[0]?.message || "Invalid task data.");
  }

  if (parsed.data.deadline.getTime() <= Date.now()) {
    return apiError(400, "Deadline must be in the future.");
  }

  try {
    const task = await prisma.marketplaceTask.create({
      data: {
        clientId: user.userId,
        title: parsed.data.title,
        description: parsed.data.description,
        tier: parsed.data.tier,
        budgetAmount: parsed.data.budgetAmount,
        currency: parsed.data.currency,
        requiredSkills: parsed.data.requiredSkills,
        deadline: parsed.data.deadline,
      },
    });

    return NextResponse.json(
      { success: true, message: "Task published and open for applications.", task: { id: task.id } },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return apiError(500, "Failed to create task.");
  }
}