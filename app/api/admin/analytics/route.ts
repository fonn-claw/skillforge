import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, sql, gt, countDistinct } from "drizzle-orm";
import { db } from "@/db";
import { users, skillNodes, userNodeMastery } from "@/db/schema";

const MASTERY_INDEX: Record<string, number> = {
  locked: 0,
  novice: 1,
  apprentice: 2,
  journeyman: 3,
  expert: 4,
  master: 5,
};

export async function GET() {
  try {
    const headerList = await headers();
    const role = headerList.get("x-user-role");
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Total learners
    const [{ count: totalLearners }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.role, "learner"));

    // Active this week (distinct users with activity in last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [{ count: activeThisWeek }] = await db
      .select({ count: countDistinct(userNodeMastery.userId) })
      .from(userNodeMastery)
      .where(gt(userNodeMastery.lastActivityAt, sevenDaysAgo));

    // Per-node stats: learner count and mastery levels
    const allNodes = await db.select().from(skillNodes);
    const masteryRecords = await db.select().from(userNodeMastery);

    // Group mastery by node
    const nodeStatsMap = new Map<
      string,
      { learnerCount: number; totalMasteryIndex: number }
    >();

    for (const record of masteryRecords) {
      const existing = nodeStatsMap.get(record.nodeId) ?? {
        learnerCount: 0,
        totalMasteryIndex: 0,
      };
      existing.learnerCount++;
      existing.totalMasteryIndex += MASTERY_INDEX[record.currentLevel] ?? 0;
      nodeStatsMap.set(record.nodeId, existing);
    }

    const nodeStats = allNodes.map((node) => {
      const stats = nodeStatsMap.get(node.id);
      return {
        nodeId: node.id,
        nodeName: node.name,
        branchName: node.branchName,
        learnerCount: stats?.learnerCount ?? 0,
        avgMasteryIndex: stats
          ? Math.round((stats.totalMasteryIndex / stats.learnerCount) * 10) / 10
          : 0,
      };
    });

    // Popular paths: top 5 nodes by learner count
    const topPaths = [...nodeStats]
      .sort((a, b) => b.learnerCount - a.learnerCount)
      .slice(0, 5);

    // Drop-off nodes: nodes with high locked/novice ratio
    // (many mastery records at low level relative to total)
    const dropOffs = nodeStats
      .filter((n) => n.learnerCount > 0 && n.avgMasteryIndex <= 1.5)
      .sort((a, b) => b.learnerCount - a.learnerCount)
      .slice(0, 5);

    return NextResponse.json({
      totalLearners,
      activeThisWeek,
      nodeStats,
      topPaths,
      dropOffs,
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
