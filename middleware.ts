import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const payload = await verifyToken(token);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-user-role", payload.role);

    const pathname = request.nextUrl.pathname;

    // Archetype quiz redirect for learners without archetype
    if (payload.role === "learner" && !payload.archetypeId) {
      // Allow access to quiz page, API routes, static assets
      if (
        pathname !== "/archetype-quiz" &&
        !pathname.startsWith("/api/") &&
        !pathname.startsWith("/_next/") &&
        !pathname.startsWith("/assets/")
      ) {
        return NextResponse.redirect(
          new URL("/archetype-quiz", request.url)
        );
      }
    }

    // Redirect away from quiz if learner already has archetype
    if (
      payload.role === "learner" &&
      payload.archetypeId &&
      pathname === "/archetype-quiz"
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!login|register|api/auth/login|api/auth/logout|api/auth/register|_next|assets|favicon).*)"],
};
