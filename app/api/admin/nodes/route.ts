import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/db";
import { skillNodes } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const headerList = await headers();
    const role = headerList.get("x-user-role");
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, branchName, positionX, positionY, iconKey } = body;

    if (!name || !description || positionX == null || positionY == null) {
      return NextResponse.json(
        { error: "name, description, positionX, positionY are required" },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(skillNodes)
      .values({
        name,
        description,
        branchName: branchName ?? null,
        positionX,
        positionY,
        iconKey: iconKey ?? null,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Admin create node error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
