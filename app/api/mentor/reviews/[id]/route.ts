import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import {
  challengeSubmissions,
  challenges,
  userNodeMastery,
} from "@/db/schema";
import { MASTERY_ORDER, type MasteryLevel } from "@/lib/tree-utils";

const XP_PER_LEVEL: Record<string, number> = {
  novice: 25,
  apprentice: 35,
  journeyman: 50,
  expert: 75,
  master: 100,
};

const XP_REQUIRED: Record<string, number> = {
  novice: 100,
  apprentice: 200,
  journeyman: 350,
  expert: 500,
  master: 750,
};

function nextMasteryLevel(current: MasteryLevel): MasteryLevel | null {
  const idx = MASTERY_ORDER.indexOf(current);
  if (idx < 0 || idx >= MASTERY_ORDER.length - 1) return null;
  return MASTERY_ORDER[idx + 1];
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = req.headers.get("x-user-role");
    const mentorId = req.headers.get("x-user-id");
    if (role !== "mentor" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!mentorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: submissionId } = await params;
    const body = await req.json();
    const { action, feedback } = body as {
      action: "approve" | "reject";
      feedback?: string;
    };

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Load submission
    const [submission] = await db
      .select()
      .from(challengeSubmissions)
      .where(eq(challengeSubmissions.id, submissionId))
      .limit(1);

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Update submission status
    const newStatus = action === "approve" ? "completed" : "rejected";
    await db
      .update(challengeSubmissions)
      .set({
        status: newStatus,
        mentorId,
        feedback: feedback ?? null,
        reviewedAt: new Date(),
        score: action === "approve" ? 100 : 0,
      })
      .where(eq(challengeSubmissions.id, submissionId));

    // If approved, award XP
    if (action === "approve") {
      // Load challenge info
      const [challenge] = await db
        .select()
        .from(challenges)
        .where(eq(challenges.id, submission.challengeId))
        .limit(1);

      if (!challenge) {
        return NextResponse.json({ updated: true, status: newStatus });
      }

      const earnedXP = XP_PER_LEVEL[challenge.masteryLevel] ?? 25;

      // Upsert mastery
      const existingMastery = await db
        .select()
        .from(userNodeMastery)
        .where(
          and(
            eq(userNodeMastery.userId, submission.userId),
            eq(userNodeMastery.nodeId, challenge.nodeId)
          )
        )
        .limit(1);

      let currentLevel: MasteryLevel;
      let xpCurrent: number;
      let xpRequired: number;
      let leveledUp = false;

      if (existingMastery.length === 0) {
        currentLevel = "novice";
        xpCurrent = earnedXP;
        xpRequired = XP_REQUIRED.novice;

        if (xpCurrent >= xpRequired) {
          const next = nextMasteryLevel(currentLevel);
          if (next && next !== "locked") {
            currentLevel = next;
            xpCurrent = 0;
            xpRequired = XP_REQUIRED[currentLevel] ?? 750;
            leveledUp = true;
          }
        }

        await db.insert(userNodeMastery).values({
          userId: submission.userId,
          nodeId: challenge.nodeId,
          currentLevel,
          xpCurrent,
          xpRequired,
        });
      } else {
        const existing = existingMastery[0];
        currentLevel = existing.currentLevel as MasteryLevel;
        xpCurrent = existing.xpCurrent + earnedXP;
        xpRequired = existing.xpRequired;

        if (xpCurrent >= xpRequired) {
          const next = nextMasteryLevel(currentLevel);
          if (next && next !== "locked") {
            currentLevel = next;
            xpCurrent = 0;
            xpRequired = XP_REQUIRED[currentLevel] ?? 750;
            leveledUp = true;
          }
        }

        await db
          .update(userNodeMastery)
          .set({
            currentLevel,
            xpCurrent,
            xpRequired,
            lastActivityAt: new Date(),
          })
          .where(eq(userNodeMastery.id, existing.id));
      }

      return NextResponse.json({
        updated: true,
        status: newStatus,
        xpAwarded: earnedXP,
        leveledUp,
      });
    }

    return NextResponse.json({ updated: true, status: newStatus });
  } catch (err) {
    console.error("POST /api/mentor/reviews/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
