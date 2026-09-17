import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { apiError } from "@/lib/api/respond";
import {
  canTransitionMilestone,
  canTransitionContract,
} from "@/lib/workplace/status-machine";
import { applyMilestoneRelease, decimalToNumber } from "@/lib/wallet/ledger";

interface RouteContext {
  params: Promise<{ id: string; milestoneId: string }>;
}

const actionSchema = z.object({
  action: z.enum(["FUND", "SUBMIT", "APPROVE"]),
  deliverableNote: z.string().min(10).max(5000).optional(),
});

/**
 * Milestone lifecycle actions:
 *  - FUND   (client)   PENDING_ESCROW -> ESCROWED  (contract becomes ACTIVE)
 *  - SUBMIT (talent)   ESCROWED       -> SUBMITTED
 *  - APPROVE(client)   SUBMITTED      -> PAID_OUT   + ledger credit to talent
 */
export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "You must be signed in.");

  const { id, milestoneId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, "Invalid JSON body.");
  }

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) return apiError(400, parsed.error.errors[0]?.message || "Invalid action.");

  const { action, deliverableNote } = parsed.data;

  try {
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: { milestones: true },
    });
    if (!contract) return apiError(404, "Contract not found.");

    const isClient = contract.clientId === user.userId;
    const isTalent = contract.talentId === user.userId;
    if (!isClient && !isTalent) return apiError(403, "You are not a party to this contract.");

    const milestone = contract.milestones.find((m) => m.id === milestoneId);
    if (!milestone) return apiError(404, "Milestone not found.");

    if (action === "FUND" && !isClient) return apiError(403, "Only the client funds milestones.");
    if (action === "APPROVE" && !isClient) return apiError(403, "Only the client approves deliveries.");
    if (action === "SUBMIT" && !isTalent) return apiError(403, "Only the talent submits deliverables.");

    if (action === "FUND") {
      if (!canTransitionContract(contract.status, "ACTIVE")) {
        return apiError(409, "Contract cannot be activated from its current status.");
      }
      if (!canTransitionMilestone(milestone.status, "ESCROWED")) {
        return apiError(409, `Milestone cannot be funded from ${milestone.status}.`);
      }
      await prisma.$transaction([
        prisma.contractMilestone.update({
          where: { id: milestone.id },
          data: { status: "ESCROWED" },
        }),
        prisma.contract.update({
          where: { id: contract.id },
          data: { status: "ACTIVE" },
        }),
      ]);
      return NextResponse.json({
        success: true,
        message: "Milestone funded (internal ledger escrow).",
      });
    }

    if (action === "SUBMIT") {
      if (!deliverableNote) return apiError(400, "A deliverable note is required for submission.");
      if (!canTransitionMilestone(milestone.status, "SUBMITTED")) {
        return apiError(409, `Milestone cannot be submitted from ${milestone.status}.`);
      }
      await prisma.contractMilestone.update({
        where: { id: milestone.id },
        data: { status: "SUBMITTED", deliverableNote },
      });
      return NextResponse.json({
        success: true,
        message: "Deliverable submitted for review.",
      });
    }

    // APPROVE (client)
    if (milestone.status !== "SUBMITTED") {
      return apiError(409, `Milestone cannot be approved from ${milestone.status}.`);
    }

    const result = await prisma.$transaction(async (tx) => {
      const amount = decimalToNumber(milestone.amount);
      applyMilestoneRelease(
        { availableBalance: 0, pendingEscrowBalance: 0, lifetimeEarnings: 0 },
        amount,
        contract.currency
      );

      const wallet = await tx.wallet.upsert({
        where: { userId: contract.talentId },
        update: {},
        create: {
          userId: contract.talentId,
          currency: contract.currency,
        },
      });

      const currentAvailable = decimalToNumber(wallet.availableBalance);
      const currentLifetime = decimalToNumber(wallet.lifetimeEarnings);

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalance: Math.round((currentAvailable + amount) * 100) / 100,
          lifetimeEarnings: Math.round((currentLifetime + amount) * 100) / 100,
        },
      });

      await tx.paymentTransaction.create({
        data: {
          walletId: wallet.id,
          milestoneId: milestone.id,
          amount,
          currency: contract.currency,
          type: "ESCROW_RELEASE",
          status: "SUCCESSFUL",
          paymentGateway: "INTERNAL_LEDGER",
          gatewayTransactionRef: `int-${milestone.id.slice(0, 8)}-${Date.now()}`,
          idempotencyKey: `ms-${milestone.id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
          metadata: {
            note: "Internal ledger settlement — awaiting live payment gateway integration.",
          },
        },
      });

      await tx.contractMilestone.update({
        where: { id: milestone.id },
        data: { status: "PAID_OUT" },
      });

      const remaining = await tx.contractMilestone.count({
        where: { contractId: contract.id, status: { not: "PAID_OUT" } },
      });

      let completedContract = false;
      if (remaining === 0) {
        await tx.contract.update({
          where: { id: contract.id },
          data: { status: "COMPLETED" },
        });
        await tx.marketplaceTask.update({
          where: { id: contract.taskId },
          data: { status: "COMPLETED" },
        });
        const talentProfile = await tx.profile.findUnique({ where: { userId: contract.talentId } });
        if (talentProfile) {
          await tx.profile.update({
            where: { id: talentProfile.id },
            data: { completedProjectsCount: { increment: 1 } },
          });
        }
        completedContract = true;
      }

      return { amount, completedContract };
    });

    return NextResponse.json({
      success: true,
      message: "Milestone approved and paid through the internal ledger.",
      settlement: result,
    });
  } catch (error) {
    console.error("POST milestone action error:", error);
    return apiError(500, "Failed to process milestone action.");
  }
}