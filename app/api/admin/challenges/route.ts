import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/db";
import { challenges } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const headerList = await headers();
    const role = headerList.get("x-user-role");
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { nodeId, masteryLevel, type, title, description, content } = body;

    if (!nodeId || !masteryLevel || !type || !title) {
      return NextResponse.json(
        { error: "nodeId, masteryLevel, type, and title are required" },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(challenges)
      .values({
        nodeId,
        masteryLevel,
        type,
        title,
        description: description ?? null,
        content: content ?? null,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Admin create challenge error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
