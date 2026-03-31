import { NextResponse } from "next/server";
import { db } from "@/db";
import { nodeEdges } from "@/db/schema";

export async function GET() {
  try {
    const edges = await db
      .select({
        id: nodeEdges.id,
        sourceNodeId: nodeEdges.sourceNodeId,
        targetNodeId: nodeEdges.targetNodeId,
        requiredMasteryLevel: nodeEdges.requiredMasteryLevel,
      })
      .from(nodeEdges);

    return NextResponse.json(edges);
  } catch (error) {
    console.error("Tree edges error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
