import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { skillNodes, userNodeMastery } from "@/db/schema";
import { headers } from "next/headers";

export async function GET() {
  try {
    const headerList = await headers();
    const userId = headerList.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all skill nodes
    const nodes = await db
      .select()
      .from(skillNodes)
      .orderBy(skillNodes.branchName, skillNodes.positionX);

    // Get mastery records for the current user
    const masteryRecords = await db
      .select()
      .from(userNodeMastery)
      .where(eq(userNodeMastery.userId, userId));

    // Build mastery lookup
    const masteryMap = new Map(
      masteryRecords.map((m) => [
        m.nodeId,
        {
          currentLevel: m.currentLevel,
          xpCurrent: m.xpCurrent,
          xpRequired: m.xpRequired,
        },
      ])
    );

    // Merge nodes with mastery
    const result = nodes.map((node) => ({
      id: node.id,
      name: node.name,
      description: node.description,
      iconKey: node.iconKey,
      positionX: node.positionX,
      positionY: node.positionY,
      branchName: node.branchName,
      mastery: masteryMap.get(node.id) ?? null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Tree nodes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
