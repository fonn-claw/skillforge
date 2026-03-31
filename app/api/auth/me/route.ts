import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, archetypes } from "@/db/schema";
import { headers } from "next/headers";

export async function GET() {
  try {
    const headerList = await headers();
    const userId = headerList.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        role: users.role,
        archetypeId: users.archetypeId,
        createdAt: users.createdAt,
        archetypeName: archetypes.name,
        archetypeColor: archetypes.color,
        archetypeIconKey: archetypes.iconKey,
      })
      .from(users)
      .leftJoin(archetypes, eq(users.archetypeId, archetypes.id))
      .where(eq(users.id, userId))
      .limit(1);

    const row = rows[0];

    if (!row) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: row.id,
      email: row.email,
      displayName: row.displayName,
      role: row.role,
      archetypeId: row.archetypeId,
      createdAt: row.createdAt,
      archetype: row.archetypeName
        ? {
            name: row.archetypeName,
            color: row.archetypeColor,
            iconKey: row.archetypeIconKey,
          }
        : null,
    });
  } catch (error) {
    console.error("Me endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
