---
phase: 01-foundation
plan: 02
subsystem: auth
tags: [jwt, jose, bcryptjs, zod4, middleware, next-auth-guard, api-routes]

requires:
  - phase: 01-foundation-01
    provides: "Drizzle schema (users, skillNodes, nodeEdges, userNodeMastery tables), db connection, Tailwind theme, fonts"
provides:
  - "JWT sign/verify utilities (lib/auth.ts) with httpOnly cookie helpers"
  - "Auth middleware injecting x-user-id and x-user-role headers"
  - "4 auth API routes (register, login, logout, me)"
  - "2 tree data API routes (nodes with mastery, edges)"
  - "Login/register UI pages with RPG dark theme"
  - "Authenticated layout shell with logout"
affects: [02-skill-tree, 03-challenges, 04-polish]

tech-stack:
  added: []
  patterns: [jose-jwt-cookie, zod4-validation, middleware-auth-guard, neon-http-queries]

key-files:
  created:
    - lib/auth.ts
    - lib/validations.ts
    - middleware.ts
    - app/api/auth/login/route.ts
    - app/api/auth/register/route.ts
    - app/api/auth/logout/route.ts
    - app/api/auth/me/route.ts
    - app/api/tree/nodes/route.ts
    - app/api/tree/edges/route.ts
    - app/login/page.tsx
    - app/register/page.tsx
    - app/(authenticated)/layout.tsx
    - app/(authenticated)/page.tsx
  modified: []

key-decisions:
  - "Removed root app/page.tsx to avoid conflict with (authenticated) route group -- middleware handles redirect"
  - "Case-insensitive email storage via toLowerCase() on register and login"

patterns-established:
  - "Auth API pattern: validate with Zod 4 schema, query Drizzle, sign JWT, set cookie on response"
  - "Protected route pattern: middleware reads session cookie, verifies JWT, sets x-user-id/x-user-role headers"
  - "Tree API pattern: read x-user-id from headers, query nodes + user mastery, merge and return"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04]

duration: 2min
completed: 2026-03-31
---

# Phase 1 Plan 2: Auth System & API Routes Summary

**JWT auth with jose and httpOnly cookies, Zod 4 validation, middleware auth guard, tree data APIs, and RPG-themed login/register pages**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-31T00:14:39Z
- **Completed:** 2026-03-31T00:17:24Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments
- Complete auth flow: register creates user with bcrypt hash, login issues JWT cookie, logout clears cookie, /api/auth/me returns current user
- Middleware guards all authenticated routes, injects user ID and role into request headers
- Tree API routes return skill nodes merged with per-user mastery data and edge prerequisites
- Login and register pages use hero-bg.png background, logo.svg, Cinzel headings, forge-gray cards, and arcane-blue CTAs

## Task Commits

Each task was committed atomically:

1. **Task 1: Auth library, middleware, and API routes** - `451e92d` (feat)
2. **Task 2: Tree API routes and login/register UI pages** - `ad93476` (feat)

## Files Created/Modified
- `lib/auth.ts` - JWT sign/verify with jose, httpOnly cookie constants
- `lib/validations.ts` - Zod 4 login and register schemas
- `middleware.ts` - Auth guard with x-user-id/x-user-role header injection
- `app/api/auth/register/route.ts` - Registration with bcrypt hashing
- `app/api/auth/login/route.ts` - Login with credential validation
- `app/api/auth/logout/route.ts` - Cookie clearing
- `app/api/auth/me/route.ts` - Current user endpoint
- `app/api/tree/nodes/route.ts` - Skill nodes with mastery merge
- `app/api/tree/edges/route.ts` - Prerequisite edge data
- `app/login/page.tsx` - RPG-themed login with hero-bg background
- `app/register/page.tsx` - RPG-themed registration page
- `app/(authenticated)/layout.tsx` - Auth layout shell with logout
- `app/(authenticated)/page.tsx` - Placeholder for skill tree

## Decisions Made
- Removed root `app/page.tsx` to avoid route conflict with `(authenticated)` group page -- middleware already redirects unauthenticated users to `/login`
- Case-insensitive email with `toLowerCase()` on both register and login to prevent duplicate accounts

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed conflicting root page.tsx**
- **Found during:** Task 2 (Creating authenticated layout)
- **Issue:** `app/page.tsx` and `app/(authenticated)/page.tsx` both map to `/`, causing a route conflict
- **Fix:** Removed `app/page.tsx` -- middleware handles auth redirect, `(authenticated)/page.tsx` serves as the root
- **Files modified:** app/page.tsx (deleted)
- **Verification:** `npm run build` passes with correct route table
- **Committed in:** ad93476

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary to resolve Next.js route conflict. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Auth system complete: all 4 endpoints working, middleware guarding routes
- Tree data APIs ready to serve seed data once database is populated (Plan 03)
- Login/register UI styled with design spec colors and assets
- Authenticated layout shell ready for skill tree canvas in Phase 2

---
*Phase: 01-foundation*
*Completed: 2026-03-31*
