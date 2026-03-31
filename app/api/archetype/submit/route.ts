import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, archetypes } from "@/db/schema";
import { signToken, SESSION_COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/auth";

const VALID_ARCHETYPES = ["builder", "analyst", "explorer", "collaborator"];

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { archetype } = body as { archetype: string };

    if (!archetype || !VALID_ARCHETYPES.includes(archetype)) {
      return NextResponse.json(
        { error: "Invalid archetype. Must be one of: builder, analyst, explorer, collaborator" },
        { status: 400 }
      );
    }

    // Find archetype record
    const archetypeRows = await db
      .select()
      .from(archetypes)
      .where(eq(archetypes.name, archetype))
      .limit(1);

    const archetypeRecord = archetypeRows[0];
    if (!archetypeRecord) {
      return NextResponse.json(
        { error: "Archetype not found in database" },
        { status: 404 }
      );
    }

    // Update user's archetypeId
    await db
      .update(users)
      .set({ archetypeId: archetypeRecord.id })
      .where(eq(users.id, userId));

    // Reissue JWT with archetypeId
    const role = request.headers.get("x-user-role") || "learner";
    const token = await signToken({
      userId,
      role,
      archetypeId: archetypeRecord.id,
    });

    const response = NextResponse.json({
      success: true,
      archetype: {
        name: archetypeRecord.name,
        color: archetypeRecord.color,
        iconKey: archetypeRecord.iconKey,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, COOKIE_OPTIONS);

    return response;
  } catch (error) {
    console.error("Archetype submit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
