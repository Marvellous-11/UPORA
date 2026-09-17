import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiError } from "@/lib/api/respond";

/** Returns the skills catalog for onboarding and self-reporting. */
export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({
      success: true,
      skills: skills.map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.name,
        category: s.category,
        description: s.description,
        difficultyLevel: s.difficultyLevel,
        isHighDemand: s.isHighDemand,
      })),
    });
  } catch (error) {
    console.error("GET /api/skills error:", error);
    return apiError(500, "Failed to retrieve skills catalog.");
  }
}