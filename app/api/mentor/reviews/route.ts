import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { challengeSubmissions, challenges, users } from "@/db/schema";

export async function GET(req: NextRequest) {
  try {
    const role = req.headers.get("x-user-role");
    if (role !== "mentor" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all pending submissions
    const pending = await db
      .select()
      .from(challengeSubmissions)
      .where(eq(challengeSubmissions.status, "pending"))
      .orderBy(challengeSubmissions.submittedAt);

    if (pending.length === 0) {
      return NextResponse.json([]);
    }

    // Get unique user and challenge IDs
    const userIds = [...new Set(pending.map((s) => s.userId))];
    const challengeIds = [...new Set(pending.map((s) => s.challengeId))];

    // Fetch users and challenges in bulk
    const userRows = await db.select().from(users);
    const challengeRows = await db.select().from(challenges);

    const userMap = new Map(userRows.map((u) => [u.id, u]));
    const challengeMap = new Map(challengeRows.map((c) => [c.id, c]));

    const result = pending.map((s) => {
      const learner = userMap.get(s.userId);
      const challenge = challengeMap.get(s.challengeId);
      return {
        id: s.id,
        learnerName: learner?.displayName ?? "Unknown",
        learnerEmail: learner?.email ?? "",
        challengeTitle: challenge?.title ?? "Unknown Challenge",
        challengeType: challenge?.type ?? "quiz",
        masteryLevel: challenge?.masteryLevel ?? "novice",
        nodeId: challenge?.nodeId ?? null,
        response: s.response,
        submittedAt: s.submittedAt,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/mentor/reviews error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
