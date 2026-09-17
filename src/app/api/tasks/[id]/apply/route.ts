import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { apiError } from "@/lib/api/respond";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const applySchema = z.object({
  proposalPitch: z.string().min(30).max(3000),
});

/**
 * Talent applies to an open task. Applications are unique per task and talent;
 * duplicates return 409. Eligibility requires at least one verified skill
 * (PROJECT_VERIFIED / CLIENT_VALIDATED / ASSESSED) matching a required skill.
 */
export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "You must be signed in to apply for a task.");

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, "Invalid JSON body.");
  }

  const parsed = applySchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, parsed.error.errors[0]?.message || "Invalid proposal.");
  }

  try {
    const task = await prisma.marketplaceTask.findUnique({
      where: { id },
      include: { client: { select: { id: true } } },
    });

    if (!task) return apiError(404, "Task not found.");
    if (task.status !== "OPEN_FOR_APPLICATIONS") {
      return apiError(409, "This task is no longer accepting applications.");
    }
    if (task.clientId === user.userId) {
      return apiError(403, "You cannot apply to your own task.");
    }

    const existing = await prisma.taskApplication.findUnique({
      where: { taskId_talentId: { taskId: task.id, talentId: user.userId } },
    });
    if (existing) {
      return apiError(409, "You have already applied to this task.");
    }

    // Eligibility: at least one verified skill matching a required skill.
    const profile = await prisma.profile.findUnique({
      where: { userId: user.userId },
      include: {
        skills: {
          include: { skill: true },
          where: { tier: { in: ["ASSESSED", "PROJECT_VERIFIED", "CLIENT_VALIDATED"] } },
        },
      },
    });

    const verifiedNames = new Set(profile?.skills.map((s) => s.skill.name.toLowerCase()) ?? []);
    const matched = task.requiredSkills.filter((req) =>
      verifiedNames.has(req.toLowerCase())
    );

    if (matched.length === 0) {
      return apiError(
        403,
        "This task is tier-gated. You need at least one verified skill matching: " +
          task.requiredSkills.join(", ") +
          ". Complete the related practical challenges first."
      );
    }

    const application = await prisma.taskApplication.create({
      data: {
        taskId: task.id,
        talentId: user.userId,
        proposalPitch: parsed.data.proposalPitch,
        proposedAmount: task.budgetAmount,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted for review.",
        application: { id: application.id, status: application.status },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/tasks/[id]/apply error:", error);
    return apiError(500, "Failed to submit application.");
  }
}