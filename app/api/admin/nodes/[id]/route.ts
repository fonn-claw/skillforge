import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { skillNodes } from "@/db/schema";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: Ctx) {
  try {
    const headerList = await headers();
    const role = headerList.get("x-user-role");
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const updates: Record<string, unknown> = {};
    for (const key of ["name", "description", "branchName", "iconKey"] as const) {
      if (body[key] !== undefined) updates[key] = body[key];
    }
    if (body.positionX != null) updates.positionX = body.positionX;
    if (body.positionY != null) updates.positionY = body.positionY;

    const [updated] = await db
      .update(skillNodes)
      .set(updates)
      .where(eq(skillNodes.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin update node error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: Ctx) {
  try {
    const headerList = await headers();
    const role = headerList.get("x-user-role");
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;

    const [deleted] = await db
      .delete(skillNodes)
      .where(eq(skillNodes.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete node error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
