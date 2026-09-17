import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { apiError } from "@/lib/api/respond";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Contract detail — visible only to the client and talent of the contract. */
export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "You must be signed in to view a contract.");

  const { id } = await context.params;

  try {
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            description: true,
            tier: true,
            requiredSkills: true,
            deadline: true,
            client: { select: { profile: { select: { fullName: true, headline: true } } } },
          },
        },
        client: { select: { profile: { select: { fullName: true, headline: true } } } },
        talent: { select: { profile: { select: { fullName: true, headline: true } } } },
        milestones: { orderBy: { createdAt: "asc" } },
        dispute: true,
      },
    });

    if (!contract) return apiError(404, "Contract not found.");
    if (contract.clientId !== user.userId && contract.talentId !== user.userId) {
      return apiError(403, "You do not have access to this contract.");
    }

    return NextResponse.json({
      success: true,
      contract: {
        id: contract.id,
        task: contract.task,
        status: contract.status,
        totalAmount: Number(contract.totalAmount),
        currency: contract.currency,
        platformFeePercent: Number(contract.platformFeePercent),
        myRole: contract.clientId === user.userId ? "CLIENT" : "TALENT",
        clientName: contract.client.profile?.fullName || "Client",
        talentName: contract.talent.profile?.fullName || "Talent",
        milestones: contract.milestones.map((m) => ({
          id: m.id,
          title: m.title,
          amount: Number(m.amount),
          status: m.status,
          dueDate: m.dueDate,
          deliverableNote: m.deliverableNote,
          revisionCount: m.revisionCount,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
        })),
        dispute: contract.dispute,
        createdAt: contract.createdAt,
      },
    });
  } catch (error) {
    console.error("GET /api/contracts/[id] error:", error);
    return apiError(500, "Failed to retrieve contract.");
  }
}