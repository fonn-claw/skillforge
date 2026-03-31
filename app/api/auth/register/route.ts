import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { registerSchema } from "@/lib/validations";
import { signToken, SESSION_COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { email, password, displayName } = parsed.data;

    // Check if email already exists
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [user] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        displayName,
        role: "learner",
      })
      .returning({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        role: users.role,
      });

    const token = await signToken({ userId: user.id, role: user.role, archetypeId: null });

    const response = NextResponse.json(user, { status: 201 });
    response.cookies.set(SESSION_COOKIE_NAME, token, COOKIE_OPTIONS);

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
