import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { apiError } from "@/lib/api/respond";
import {
  canTransitionApplication,
  buildDefaultMilestones,
} from "@/lib/workplace/status-machine";

interface RouteContext {
  params: Promise<{ taskId: string; applicationId: string }>;
}

const decisionSchema = z.object({
  action: z.enum(["ACCEPT", "REJECT"]),
});

/**
 * Allows the task owner (client) to accept or reject an application.
 * Accepting creates a Contract with concrete milestones and moves the
 * task into IN_PROGRESS; other pending applicants are rejected.
 */
export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "You must be signed in to review applications.");

  const { taskId, applicationId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, "Invalid JSON body.");
  }

  const parsed = decisionSchema.safeParse(body);
  if (!parsed.success) return apiError(400, "Action must be ACCEPT or REJECT.");

  try {
    const task = await prisma.marketplaceTask.findUnique({
      where: { id: taskId },
    });
    if (!task) return apiError(404, "Task not found.");
    if (task.clientId !== user.userId) {
      return apiError(403, "Only the task owner can review applications.");
    }

    const application = await prisma.taskApplication.findUnique({
      where: { id: applicationId },
    });
    if (!application || application.taskId !== task.id) {
      return apiError(404, "Application not found for this task.");
    }

    if (application.status !== "PENDING") {
      return apiError(409, "This application has already been reviewed.");
    }

    if (parsed.data.action === "REJECT") {
      const updated = await prisma.taskApplication.update({
        where: { id: application.id },
        data: { status: "REJECTED" },
      });
      return NextResponse.json({ success: true, message: "Application rejected.", application: { id: updated.id, status: updated.status } });
    }

    const result = await prisma.$transaction(async (tx) => {
      const milestoneDefs = buildDefaultMilestones(
        Number(task.budgetAmount),
        Number(task.budgetAmount) <= 100 ? 1 : Number(task.budgetAmount) <= 500 ? 2 : 3
      );

      const contract = await tx.contract.create({
        data: {
          taskId: task.id,
          clientId: task.clientId,
          talentId: application.talentId,
          totalAmount: task.budgetAmount,
          currency: task.currency,
          platformFeePercent: 10,
          status: "AWAITING_ESCROW",
          milestones: {
            create: milestoneDefs.map((m, index) => ({
              title: m.title,
              amount: m.amount,
              dueDate: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000),
            })),
          },
        },
      });

      await tx.taskApplication.update({
        where: { id: application.id },
        data: { status: "ACCEPTED" },
      });

      await tx.taskApplication.updateMany({
        where: { taskId: task.id, status: "PENDING" },
        data: { status: "REJECTED" },
      });

      await tx.marketplaceTask.update({
        where: { id: task.id },
        data: { status: "IN_PROGRESS" },
      });

      return { contractId: contract.id, contractStatus: contract.status, milestoneCount: milestoneDefs.length };
    });

    return NextResponse.json({
      success: true,
      message: "Application accepted. Contract created with scoped milestones.",
      contract: result,
    });
  } catch (error) {
    console.error("PATCH applications decision error:", error);
    return apiError(500, "Failed to review application.");
  }
}