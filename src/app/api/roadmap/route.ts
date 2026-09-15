import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const roadmap = await prisma.userRoadmap.findFirst({
      where: { userId: user.userId },
      include: {
        careerPath: true,
        milestones: {
          orderBy: { stepOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!roadmap) {
      return NextResponse.json({
        success: true,
        roadmap: null,
      });
    }

    return NextResponse.json({
      success: true,
      roadmap: {
        id: roadmap.id,
        careerPath: {
          id: roadmap.careerPath.id,
          slug: roadmap.careerPath.slug,
          title: roadmap.careerPath.title,
          description: roadmap.careerPath.description,
          averageGlobalSalaryUSD: Number(roadmap.careerPath.averageGlobalSalaryUSD),
          entryDifficulty: roadmap.careerPath.entryDifficulty,
        },
        currentStepIndex: roadmap.currentStepIndex,
        totalStepsCount: roadmap.totalStepsCount,
        isCompleted: roadmap.isCompleted,
        analysis: roadmap.generatedAnalysis,
        milestones: roadmap.milestones.map((m) => ({
          id: m.id,
          stepOrder: m.stepOrder,
          title: m.title,
          description: m.description,
          actionType: m.actionType,
          targetEntityId: m.targetEntityId,
          status: m.status,
          isCompleted: m.isCompleted,
          completedAt: m.completedAt,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to retrieve roadmap" },
      { status: 500 }
    );
  }
}
