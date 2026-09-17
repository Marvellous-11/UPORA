import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { apiError } from "@/lib/api/respond";

/** Lists contracts where the caller is talent or client. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "You must be signed in to view contracts.");

  try {
    const contracts = await prisma.contract.findMany({
      where: { OR: [{ clientId: user.userId }, { talentId: user.userId }] },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            tier: true,
            requiredSkills: true,
            deadline: true,
          },
        },
        client: { select: { profile: { select: { fullName: true } } } },
        talent: { select: { profile: { select: { fullName: true } } } },
        milestones: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      contracts: contracts.map((c) => ({
        id: c.id,
        taskTitle: c.task.title,
        tier: c.task.tier,
        requiredSkills: c.task.requiredSkills,
        totalAmount: Number(c.totalAmount),
        currency: c.currency,
        platformFeePercent: Number(c.platformFeePercent),
        status: c.status,
        myRole: c.clientId === user.userId ? "CLIENT" : "TALENT",
        clientName: c.client.profile?.fullName || "Client",
        talentName: c.talent.profile?.fullName || "Talent",
        milestones: c.milestones.map((m) => ({
          id: m.id,
          title: m.title,
          amount: Number(m.amount),
          status: m.status,
          dueDate: m.dueDate,
          updatedAt: m.updatedAt,
        })),
        createdAt: c.createdAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/contracts error:", error);
    return apiError(500, "Failed to retrieve contracts.");
  }
}