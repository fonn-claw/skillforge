import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { challenges } from "@/db/schema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: challengeId } = await params;

    const rows = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    const c = rows[0];
    return NextResponse.json({
      id: c.id,
      title: c.title,
      description: c.description,
      type: c.type,
      masteryLevel: c.masteryLevel,
      content: c.content,
      nodeId: c.nodeId,
    });
  } catch (err) {
    console.error("GET /api/challenges/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
