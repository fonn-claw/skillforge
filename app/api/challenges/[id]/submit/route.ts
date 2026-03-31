import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import {
  challenges,
  challengeSubmissions,
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
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: challengeId } = await params;
    const body = await req.json();

    // Load challenge
    const rows = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    const challenge = rows[0];

    // ── Quiz submission ──────────────────────────────────────────────────
    if (challenge.type === "quiz") {
      const { answers } = body as { answers: number[] };
      const content = challenge.content as {
        questions: { question: string; options: string[]; correctIndex: number }[];
      };

      if (!content?.questions || !Array.isArray(answers)) {
        return NextResponse.json(
          { error: "Invalid quiz submission" },
          { status: 400 }
        );
      }

      // Score
      let correctCount = 0;
      for (let i = 0; i < content.questions.length; i++) {
        if (answers[i] === content.questions[i].correctIndex) {
          correctCount++;
        }
      }
      const score = Math.round((correctCount / content.questions.length) * 100);

      // XP
      const xpForLevel = XP_PER_LEVEL[challenge.masteryLevel] ?? 25;
      const earnedXP = Math.round((score / 100) * xpForLevel);

      // Save submission
      await db.insert(challengeSubmissions).values({
        userId,
        challengeId,
        status: "completed",
        score,
        response: { answers, correctCount },
      });

      // Upsert mastery
      const existingMastery = await db
        .select()
        .from(userNodeMastery)
        .where(
          and(
            eq(userNodeMastery.userId, userId),
            eq(userNodeMastery.nodeId, challenge.nodeId)
          )
        )
        .limit(1);

      let currentLevel: MasteryLevel;
      let xpCurrent: number;
      let xpRequired: number;
      let leveledUp = false;

      if (existingMastery.length === 0) {
        // Create new mastery record
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
          userId,
          nodeId: challenge.nodeId,
          currentLevel,
          xpCurrent,
          xpRequired,
        });
      } else {
        // Update existing
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
        score,
        earnedXP,
        newMastery: { currentLevel, xpCurrent, xpRequired },
        leveledUp,
      });
    }

    // ── Project submission ───────────────────────────────────────────────
    if (challenge.type === "project_submission") {
      const { description, url } = body as {
        description: string;
        url?: string;
      };

      if (!description || description.trim().length < 10) {
        return NextResponse.json(
          { error: "Description must be at least 10 characters" },
          { status: 400 }
        );
      }

      await db.insert(challengeSubmissions).values({
        userId,
        challengeId,
        status: "pending",
        response: { description: description.trim(), url: url?.trim() || null },
      });

      return NextResponse.json({ submitted: true, status: "pending" });
    }

    return NextResponse.json(
      { error: "Unknown challenge type" },
      { status: 400 }
    );
  } catch (err) {
    console.error("POST /api/challenges/[id]/submit error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
