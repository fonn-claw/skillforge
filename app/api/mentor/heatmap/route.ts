import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { skillNodes, userNodeMastery, users } from "@/db/schema";
import { eq, sql, count } from "drizzle-orm";

const MASTERY_INDEX: Record<string, number> = {
  locked: 0,
  novice: 1,
  apprentice: 2,
  journeyman: 3,
  expert: 4,
  master: 5,
};

export async function GET(req: NextRequest) {
  try {
    const role = req.headers.get("x-user-role");
    if (role !== "mentor" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all skill nodes
    const allNodes = await db.select().from(skillNodes);

    // Count total learners
    const [{ value: totalLearners }] = await db
      .select({ value: count() })
      .from(users)
      .where(eq(users.role, "learner"));

    // Get mastery aggregation: nodeId, currentLevel, count
    const masteryAgg = await db
      .select({
        nodeId: userNodeMastery.nodeId,
        currentLevel: userNodeMastery.currentLevel,
        cnt: count(),
        stuckCount: count(
          sql`CASE WHEN ${userNodeMastery.lastActivityAt} < NOW() - INTERVAL '3 days'
               AND ${userNodeMastery.currentLevel} IN ('novice', 'apprentice')
               THEN 1 END`
        ),
      })
      .from(userNodeMastery)
      .groupBy(userNodeMastery.nodeId, userNodeMastery.currentLevel);

    // Build per-node lookup
    const nodeStats = new Map<
      string,
      {
        breakdown: Record<string, number>;
        totalWithRecords: number;
        stuckCount: number;
      }
    >();

    for (const row of masteryAgg) {
      if (!nodeStats.has(row.nodeId)) {
        nodeStats.set(row.nodeId, {
          breakdown: { locked: 0, novice: 0, apprentice: 0, journeyman: 0, expert: 0, master: 0 },
          totalWithRecords: 0,
          stuckCount: 0,
        });
      }
      const stats = nodeStats.get(row.nodeId)!;
      const level = row.currentLevel;
      stats.breakdown[level] = (stats.breakdown[level] ?? 0) + Number(row.cnt);
      stats.totalWithRecords += Number(row.cnt);
      stats.stuckCount += Number(row.stuckCount);
    }

    // Build response
    const result = allNodes.map((node) => {
      const stats = nodeStats.get(node.id);
      const breakdown = stats?.breakdown ?? {
        locked: 0,
        novice: 0,
        apprentice: 0,
        journeyman: 0,
        expert: 0,
        master: 0,
      };

      // Calculate average mastery index
      let totalIndex = 0;
      let totalCount = 0;
      for (const [level, cnt] of Object.entries(breakdown)) {
        totalIndex += (MASTERY_INDEX[level] ?? 0) * cnt;
        totalCount += cnt;
      }

      // Include learners without records as "locked" for average
      const learnersWithoutRecords = totalLearners - (stats?.totalWithRecords ?? 0);
      // locked = index 0, so it doesn't change totalIndex, but affects count
      const effectiveTotal = totalCount + learnersWithoutRecords;
      const avgMasteryIndex = effectiveTotal > 0 ? totalIndex / effectiveTotal : 0;

      return {
        nodeId: node.id,
        nodeName: node.name,
        totalLearners: stats?.totalWithRecords ?? 0,
        breakdown: {
          ...breakdown,
          locked: (breakdown.locked ?? 0) + learnersWithoutRecords,
        },
        avgMasteryIndex: Math.round(avgMasteryIndex * 100) / 100,
        stuckCount: stats?.stuckCount ?? 0,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/mentor/heatmap error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
