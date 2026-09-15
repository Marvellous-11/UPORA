import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getNextBestAction } from "@/lib/roadmap/next-action";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const action = await getNextBestAction(user?.userId);

    return NextResponse.json({
      success: true,
      nextAction: action,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to determine next best action" },
      { status: 500 }
    );
  }
}
