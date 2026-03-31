import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { challenges } from "@/db/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const rows = await db
      .select({
        id: challenges.id,
        title: challenges.title,
        description: challenges.description,
        type: challenges.type,
        masteryLevel: challenges.masteryLevel,
        sortOrder: challenges.sortOrder,
      })
      .from(challenges)
      .where(eq(challenges.nodeId, id))
      .orderBy(challenges.masteryLevel, challenges.sortOrder);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Challenges endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
