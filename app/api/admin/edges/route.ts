import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/db";
import { nodeEdges } from "@/db/schema";
import { validateDAG } from "@/lib/dag";

export async function POST(request: Request) {
  try {
    const headerList = await headers();
    const role = headerList.get("x-user-role");
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { sourceNodeId, targetNodeId, requiredMasteryLevel } = body;

    if (!sourceNodeId || !targetNodeId) {
      return NextResponse.json(
        { error: "sourceNodeId and targetNodeId are required" },
        { status: 400 }
      );
    }

    // Get all existing edges and validate DAG with the proposed edge
    const existingEdges = await db.select().from(nodeEdges);
    const allEdges = [
      ...existingEdges.map((e) => ({
        sourceNodeId: e.sourceNodeId,
        targetNodeId: e.targetNodeId,
      })),
      { sourceNodeId, targetNodeId },
    ];

    const result = validateDAG(allEdges);
    if (!result.valid) {
      return NextResponse.json(
        { error: "Adding this edge would create a cycle" },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(nodeEdges)
      .values({
        sourceNodeId,
        targetNodeId,
        requiredMasteryLevel: requiredMasteryLevel ?? "novice",
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Admin create edge error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
