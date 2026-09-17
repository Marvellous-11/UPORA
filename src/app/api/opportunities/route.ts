import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { apiError } from "@/lib/api/respond";

const querySchema = z.object({
  type: z.string().optional(),
  trustStatus: z.string().optional(),
  remoteOnly: z.string().optional(),
});

/** Lists active, database-backed external opportunities with trust telemetry. */
export async function GET(request: Request) {
  const raw = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = querySchema.safeParse(raw);

  try {
    const where: Record<string, unknown> = { isActive: true };
    if (parsed.success) {
      if (parsed.data.type) where.type = parsed.data.type;
      if (parsed.data.trustStatus) where.trustStatus = parsed.data.trustStatus;
      if (parsed.data.remoteOnly === "true") where.isRemoteEligible = true;
    }

    const opportunities = await prisma.externalOpportunity.findMany({
      where,
      orderBy: [{ trustStatus: "asc" }, { trustScore: "desc" }],
    });

    return NextResponse.json({
      success: true,
      opportunities: opportunities.map((o) => ({
        id: o.id,
        title: o.title,
        organizationName: o.organizationName,
        organizationDomain: o.organizationDomain,
        type: o.type,
        location: o.location,
        isRemoteEligible: o.isRemoteEligible,
        salaryOrStipendUSD: o.salaryOrStipendUSD,
        applicationUrl: o.applicationUrl,
        deadline: o.deadline,
        trustStatus: o.trustStatus,
        trustScore: o.trustScore,
        trustRationale: o.trustRationale,
        rawSource: o.rawSource,
      })),
    });
  } catch (error) {
    console.error("GET /api/opportunities error:", error);
    return apiError(500, "Failed to retrieve opportunities.");
  }
}