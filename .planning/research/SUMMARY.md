# Project Research Summary

**Project:** SkillForge -- Learning Gamification & Skill Progression Platform
**Domain:** EdTech gamification layer (interactive skill tree with mastery progression)
**Researched:** 2026-03-30
**Confidence:** MEDIUM-HIGH

## Executive Summary

SkillForge is a graph-centric single-screen application where the skill tree canvas IS the product. This is not a dashboard with a graph widget -- the interactive, zoomable, RPG-styled skill tree is the persistent UI shell, with all features (node details, challenges, mentor tools, admin editing) rendered as overlays on top of it. The expert approach is to treat React Flow as the application frame, let it own graph state, and compose role-based experiences through conditional overlays rather than separate pages.

The recommended build approach is a strict bottom-up dependency chain: database schema and auth first, then tree data APIs, then the React Flow visualization, then the engagement layer (archetype quiz, challenges, mastery progression), then role-specific views (mentor heatmap, admin editing), and finally polish. This order is non-negotiable because each layer depends on the one below it. The skill tree visualization is the highest-risk, highest-value feature and should receive the most attention. React Flow v12 (@xyflow/react) is the clear choice -- it provides zoom/pan/minimap/custom-nodes out of the box and treats nodes as React components.

The key risks are: (1) React Flow custom node re-rendering cascade killing canvas performance at 30+ nodes -- must be solved architecturally from the start with React.memo and CSS-only animations, (2) prerequisite graph validation -- cycles and orphan nodes will silently break the learner experience if DAG constraints are not enforced at the data layer, and (3) gamification that feels hollow -- mastery levels must correspond to genuinely different challenge types and difficulty, not just cosmetic badge upgrades. All three risks are mitigable through upfront architecture decisions documented in this research.

## Key Findings

### Recommended Stack

The stack is fully specified by project requirements (Next.js, Neon Postgres, Drizzle ORM) with React Flow as the critical addition for graph visualization. All versions verified via npm registry. The stack is modern, well-documented, and optimized for Vercel serverless deployment.

**Core technologies:**
- **Next.js 16 (App Router)** -- server components for data-heavy tree queries, server actions for mutations, Vercel-native deployment
- **React Flow (@xyflow/react 12.x)** -- interactive graph canvas with built-in zoom/pan/minimap, custom React component nodes, the single most important dependency
- **Drizzle ORM + Neon Postgres** -- type-safe SQL with serverless-compatible Neon driver (@neondatabase/serverless), per-request connections
- **Framer Motion 12.x** -- UI chrome animations (panel slides, quiz transitions); CSS animations for graph elements to avoid canvas overhead
- **Tailwind CSS 4.x** -- utility-first styling for the dark RPG theme; CSS custom properties for mastery-level dynamic theming
- **Zod 4.x** -- schema validation for server actions, quiz responses, challenge submissions
- **bcryptjs + jose** -- lightweight auth (password hashing + JWT) appropriate for a demo with 3 hardcoded accounts

**What NOT to use:** NextAuth (overkill for demo), D3.js (wrong abstraction level), shadcn/ui or Radix (too generic for RPG aesthetic), Prisma (spec says Drizzle), any real-time/WebSocket library (no live requirements).

### Expected Features

**Must have (table stakes):**
- Interactive skill tree canvas with zoom/pan/minimap -- this IS the product
- Hexagonal custom nodes with mastery-level visual states (locked through master)
- Prerequisite-based node unlocking (DAG-enforced)
- Node detail panel (slide-in right) with skill info, mastery level, challenges
- Challenge system (quiz type minimum) gating mastery progression
- 5-level mastery per node (Novice through Master) with distinct visual treatment
- Archetype quiz with engaging reveal (onboarding hook, identity investment)
- Authentication with 3 roles (learner, mentor, admin)
- Mentor heatmap overlay on the tree canvas
- Mentor challenge review workflow
- Admin tree configuration (node/edge CRUD)
- Seeded demo data showing a living system (20 learners, varied progress)

**Should have (differentiators):**
- Unlock animation (energy flowing along connections) -- the core dopamine hit
- Node mastery pulse/particle effects -- makes the tree feel alive
- RPG atmospheric design (forge-themed, dark, glowing) -- visual differentiation from every competitor

**Defer (v2+):**
- Project submission and peer review challenge types
- Engagement analytics dashboard
- Archetype-influenced path recommendations
- Code exercise challenges (requires sandbox)
- OAuth, email notifications, mobile native app

### Architecture Approach

Single-route application. The tree canvas is the persistent shell rendered as a client component (React Flow requires DOM). Data is fetched server-side and passed as initial props to avoid loading spinners. All other UI (detail panel, challenge modal, archetype quiz, mentor heatmap, admin toolbar) renders as floating overlays driven by client-side state. Role determines which overlays are available and what clicking a node does.

**Major components:**
1. **Layout Shell** -- auth gate, session provider, theme, top bar (server component outer, client inner)
2. **Skill Tree Canvas** -- React Flow instance with custom HexNode and AnimatedEdge types (client component, owns graph state)
3. **Node Detail Panel** -- slide-in right panel showing skill info, mastery, challenges (client component)
4. **Challenge Modal** -- quiz/exercise UI with submission handling (client component)
5. **Archetype Quiz** -- full-screen overlay for onboarding (client component)
6. **Mentor Heatmap Overlay** -- aggregated mastery visualization on same canvas (client component)
7. **Admin Edit Mode** -- drag-to-position, add/remove nodes and connections (client component)
8. **API Route Handlers** -- data access, business logic, role-based authorization (server only)

**Key patterns:** Server data + client rendering, derived unlock state (computed from graph + progress, not stored), role-based view composition on single canvas, optimistic updates for challenge completion, React Flow owns graph state (no external state manager duplication).

### Critical Pitfalls

1. **React Flow re-render cascade** -- Custom nodes re-render on any nodes array change. Wrap in React.memo with custom comparator, use CSS-only animations, define nodeTypes outside component. Must be correct from Phase 1 or requires painful retrofit.

2. **Prerequisite graph cycles/orphans** -- Admin can create cycles or delete nodes leaving orphans. Implement topological sort validation on every edge addition, cascade-delete or reassign on node removal. Enforce at data layer from day one.

3. **Gamification feels hollow** -- Mastery levels without mechanically different challenge types are just cosmetic badges. Define challenge type progression per level upfront (quiz -> short answer -> code -> project -> peer review). Archetype must influence challenge selection, not just display a badge.

4. **Mobile canvas breakage** -- Full-canvas zoomable graph degrades on small screens. Accept degraded-but-functional mobile: increase default zoom, bottom-sheet detail panel, hide minimap, ensure touch zoom works. Desktop-first, adapt last.

5. **Role authorization gaps** -- Same canvas for all roles means conditional rendering alone is insufficient. Server-side role checks on EVERY API route and server action. Define permissions as single source of truth used by both server and client.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation (Database + Auth + Project Setup)
**Rationale:** Everything depends on the schema and auth. The database schema must include node position columns (x/y), DAG-friendly edge structure, mastery level definitions with challenge type progression, and archetype tables. Auth must include role-based middleware from the start.
**Delivers:** Working database with Drizzle schema, Neon connection, auth system with 3 demo accounts, role-based API middleware, project scaffolding (Next.js, Tailwind, fonts).
**Addresses:** Authentication, progress persistence, demo account foundation.
**Avoids:** Pitfall 2 (graph positions not in schema), Pitfall 5 (DAG validation), Pitfall 6 (role auth gaps).

### Phase 2: Tree Data Layer + Seed Data
**Rationale:** React Flow needs nodes and edges to render. The API layer and seed data must exist before visualization work begins. Seeding the full CodeForge Academy tree with hand-tuned positions ensures the visualization phase has real data to work with.
**Delivers:** Node/edge CRUD API routes, progress tracking API, complete seed script (tree structure, 20 learners with varied progress, challenges per node per mastery level, demo accounts).
**Addresses:** Demo data, prerequisite unlocking logic, challenge data model.
**Avoids:** Pitfall 2 (hardcoded positions -- seed includes x/y), Pitfall 3 (hollow gamification -- seed includes challenge type variety).

### Phase 3: Skill Tree Visualization (The Hero)
**Rationale:** This is the product. It depends on Phase 1+2 data. This phase should receive the most time and attention. Performance architecture (memoization, CSS animations) must be correct from the first commit.
**Delivers:** React Flow canvas with custom HexNode, AnimatedEdge, minimap, zoom controls, server-side data fetch to client rendering, node click opens detail panel, mastery-level visual states (locked through master with glow intensity), connection animations.
**Addresses:** Interactive skill tree, hexagonal nodes, minimap, node detail panel, mastery visuals, unlock animations.
**Avoids:** Pitfall 1 (re-render cascade -- memo from start), Pitfall 4 (mobile -- build with viewport awareness).

### Phase 4: Engagement Layer (Quiz + Challenges + Mastery)
**Rationale:** With the tree visible, learners need things to DO. The archetype quiz is the onboarding hook, challenges gate mastery progression, and mastery progression triggers the unlock animations built in Phase 3.
**Delivers:** Archetype quiz (5-7 questions, visual reveal, stored result), challenge system (quiz type with mastery-level-appropriate difficulty), mastery progression loop (complete challenge -> level up -> unlock animation -> new nodes available).
**Addresses:** Archetype quiz, challenge system, mastery progression, unlock flow.
**Avoids:** Pitfall 3 (hollow gamification -- different challenge format per mastery level).

### Phase 5: Role-Specific Views (Mentor + Admin)
**Rationale:** Mentor and admin features layer on top of the working learner experience. They reuse the same canvas with different overlays and interaction handlers.
**Delivers:** Mentor heatmap overlay (aggregated mastery per node, stuck-learner detection, learner breakdown on click), mentor challenge review workflow, admin tree edit mode (drag nodes, add/remove connections with DAG validation), admin analytics view.
**Addresses:** Mentor heatmap, challenge review, admin tree config, engagement analytics.
**Avoids:** Pitfall 5 (cycle detection in admin UI), Pitfall 6 (role auth verified end-to-end).

### Phase 6: Polish + Responsive + Deploy
**Rationale:** Animations are meaningless without working functionality. Mobile adaptation is a final pass. Deploy validates everything works in production (Vercel + Neon).
**Delivers:** Mastery pulse/particle effects, archetype reveal polish, responsive breakpoints (mobile bottom-sheet panel, touch zoom, hidden minimap), demo login flow, Vercel deployment, domain configuration.
**Addresses:** RPG visual polish, responsive design, production deployment.
**Avoids:** Pitfall 4 (mobile breakage -- dedicated responsive pass).

### Phase Ordering Rationale

- Schema before APIs before visualization before engagement before role views -- strict dependency chain where each layer needs the one below
- Tree visualization (Phase 3) is intentionally the largest phase because it is the product; everything else is secondary
- Engagement layer (Phase 4) must follow visualization because challenges are launched from the node detail panel which lives on the canvas
- Role views (Phase 5) come last because mentor/admin overlay the working learner experience; building them first would mean building without the foundation they modify
- Polish is strictly last -- a well-animated broken app is worse than a working app without animations

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Tree Visualization):** React Flow v12 API specifics (custom node types, edge types, useNodesData hook, minimap configuration). Training data may be slightly outdated. Verify against current @xyflow/react docs during implementation.
- **Phase 4 (Engagement Layer):** Archetype quiz scoring algorithm and challenge-mastery gating logic need detailed design. No established pattern to follow -- this is domain-specific.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Next.js + Drizzle + Neon is a well-documented stack. Auth with bcryptjs + jose is straightforward.
- **Phase 2 (Data Layer):** Standard CRUD API routes and seed scripting. No novel patterns.
- **Phase 5 (Role Views):** Builds on existing canvas with conditional overlays. React Flow supports this natively.
- **Phase 6 (Polish):** CSS animations, responsive breakpoints, Vercel deploy -- all standard.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified via npm registry. Well-documented pairings (Next.js + Drizzle + Neon). React Flow is the clear choice for this use case. |
| Features | MEDIUM | Based on training data analysis of Duolingo, Khan Academy, Codecademy, and gamification research. Competitor features may have changed since May 2025 cutoff. Core gamification principles are well-established. |
| Architecture | MEDIUM | React Flow v12 API specifics from training data. Single-screen overlay pattern is sound but React Flow hook names and configuration may need verification. |
| Pitfalls | MEDIUM-HIGH | Performance pitfalls (re-render cascade, SVG filters) are well-documented. Graph validation (DAG cycles) is computer science fundamentals. Gamification UX pitfalls backed by research literature. |

**Overall confidence:** MEDIUM-HIGH

The stack is solid and verified. The architecture pattern (graph-centric single-screen app) is well-suited to the product. The main uncertainty is React Flow v12 API details which may have evolved since training data cutoff. This is a verify-during-implementation risk, not a design risk.

### Gaps to Address

- **React Flow v12 exact API:** The `useNodesData` hook, custom node type registration, and edge animation API should be verified against current docs when Phase 3 begins. The overall approach is sound but method signatures may differ.
- **Neon serverless connection pattern:** The `neon-http` vs `neon-serverless` Drizzle adapter choice should be verified at setup time. Both work but have different tradeoffs (HTTP is simpler, WebSocket supports transactions).
- **Challenge type diversity for demo:** The research recommends different challenge types per mastery level, but the MVP spec only requires quiz type. Decide during Phase 4 planning whether to implement multiple types or simulate them with varied quiz difficulty.
- **Mobile skill tree UX:** No established pattern exists for interactive zoomable graphs on mobile in edtech. The "degraded but functional" approach is the pragmatic choice but may need iteration during Phase 6.

## Sources

### Primary (HIGH confidence)
- npm registry -- all package versions verified on 2026-03-30
- Project BRIEF.md and DESIGN-SPEC.md -- direct requirements
- Next.js App Router documentation (training data)
- Drizzle ORM documentation (training data)

### Secondary (MEDIUM confidence)
- React Flow documentation (reactflow.dev) -- training data, v11-v12 patterns
- Neon documentation (neon.tech/docs) -- training data
- Gamification design research (Schell, Koster) -- established principles
- Competitor analysis (Duolingo, Khan Academy, Codecademy, Path of Exile) -- training data, may be outdated

### Tertiary (LOW confidence)
- React Flow v12 specific hook APIs (useNodesData, edge animation patterns) -- verify during implementation
- Framer Motion 12.x API -- verify AnimatePresence patterns during implementation

---
*Research completed: 2026-03-30*
*Ready for roadmap: yes*
