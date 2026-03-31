---
phase: 03-engagement-loop
plan: 01
subsystem: ui
tags: [quiz, archetype, framer-motion, jwt, middleware, gamification]

requires:
  - phase: 01-foundation
    provides: JWT auth, middleware, users table with archetypeId FK, archetypes table
provides:
  - Archetype discovery quiz page with 7 visual questions
  - Archetype submit API with JWT reissue
  - Middleware redirect for learners without archetype
  - archetypeId in JWT payload across all auth flows
affects: [03-engagement-loop, skill-tree-canvas, topbar]

tech-stack:
  added: []
  patterns: [full-screen overlay for immersive experiences, JWT payload extension for feature gating]

key-files:
  created:
    - app/(authenticated)/archetype-quiz/page.tsx
    - app/api/archetype/submit/route.ts
  modified:
    - middleware.ts
    - lib/auth.ts
    - app/api/auth/login/route.ts
    - app/api/auth/register/route.ts

key-decisions:
  - "JWT payload extended with archetypeId for middleware-level feature gating without DB lookups"
  - "Login/register routes updated to include archetypeId in JWT for immediate redirect support"

patterns-established:
  - "Full-screen overlay pattern: fixed inset-0 z-[60] for immersive experiences that cover TopBar"
  - "JWT claim extension: add feature flags to JWT, reissue on state change"

requirements-completed: [ARCH-01, ARCH-02, ARCH-03, ARCH-04, ARCH-05]

duration: 2min
completed: 2026-03-31
---

# Phase 3 Plan 1: Archetype Discovery Quiz Summary

**Full-screen RPG-style archetype quiz with 7 visual questions, dramatic reveal animation, submit API, and middleware redirect gating**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-31T01:05:09Z
- **Completed:** 2026-03-31T01:07:52Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Full-screen quiz overlay with 7 learning-style questions mapped to 4 archetypes
- Dramatic reveal with converging particle animation and archetype portrait
- Submit API saves archetype to DB and reissues JWT with archetypeId
- Middleware redirects learners without archetype to quiz, prevents re-access after completion

## Task Commits

Each task was committed atomically:

1. **Task 1: Create archetype quiz page with visual card questions and reveal** - `95abc22` (feat)
2. **Task 2: Create archetype submit API and update middleware for quiz redirect** - `9145589` (feat)

## Files Created/Modified
- `app/(authenticated)/archetype-quiz/page.tsx` - Full-screen quiz with 7 questions, framer-motion transitions, archetype reveal
- `app/api/archetype/submit/route.ts` - POST endpoint: validates archetype, updates user, reissues JWT
- `middleware.ts` - Added archetype quiz redirect for learners without archetype
- `lib/auth.ts` - Extended signToken/verifyToken to include archetypeId
- `app/api/auth/login/route.ts` - Include archetypeId in JWT on login
- `app/api/auth/register/route.ts` - Include null archetypeId in JWT on register

## Decisions Made
- Extended JWT payload with archetypeId to enable middleware-level gating without DB lookups
- Updated login and register routes to include archetypeId in JWT (Rule 2: missing critical functionality for redirect to work)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Login/register routes missing archetypeId in JWT**
- **Found during:** Task 2 (middleware update)
- **Issue:** Login and register routes called signToken without archetypeId, meaning middleware redirect would never see archetypeId in JWT claims and would redirect all learners to quiz indefinitely
- **Fix:** Updated both routes to include archetypeId (from user record on login, null on register)
- **Files modified:** app/api/auth/login/route.ts, app/api/auth/register/route.ts
- **Verification:** npm run build passes
- **Committed in:** 9145589 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Essential for correctness -- without this, the redirect loop would trap all learners.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Archetype quiz complete, learners can discover their archetype
- JWT now carries archetypeId for downstream feature gating
- Ready for challenge system and mastery progression (plans 03-02, 03-03)

---
*Phase: 03-engagement-loop*
*Completed: 2026-03-31*
