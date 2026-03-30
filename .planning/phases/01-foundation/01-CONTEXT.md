# Phase 1: Foundation - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

A running Next.js app with complete database schema (Neon Postgres via Drizzle ORM), authentication system (3 roles), API routes for skill tree data, and realistic seed data for CodeForge Academy. Everything downstream phases need to render the skill tree and build engagement features on top of.

</domain>

<decisions>
## Implementation Decisions

### Database Schema Design
- Relational tables modeling a DAG: `users`, `skill_nodes`, `node_edges` (prerequisite connections), `challenges`, `user_node_mastery`, `challenge_submissions`
- Skill nodes store x,y position coordinates for hand-tuned tree layout (not auto-layout)
- Node edges represent prerequisite relationships with required_mastery_level field
- Challenges stored per-node per-mastery-level with type discriminator (quiz, project_submission)
- Quiz challenges store questions/answers as JSONB
- User mastery tracked per-node with current_level enum (locked, novice, apprentice, journeyman, expert, master) and xp_current/xp_required fields
- Archetype stored on user record after quiz completion
- DAG validation (cycle detection) enforced at data layer

### Authentication Approach
- Simple JWT auth with bcryptjs for password hashing and jose for JWT signing/verification
- HTTP-only secure cookie for session persistence across browser refresh
- Role enum on user: learner, mentor, admin
- Middleware checks JWT on protected routes and injects user context
- No NextAuth/Auth.js — too much complexity for 3 demo accounts with email/password

### Seed Data Strategy
- Drizzle seed script (`db/seed.ts`) run via `npm run seed`
- CodeForge Academy tree: 3 branches (Frontend, Backend, DevOps) with ~15 total nodes branching from "Web Fundamentals" root
- Hand-tuned x,y positions for each node ensuring RPG-aesthetic spatial layout
- 20 demo learners with specific scenarios: 1 advanced (Expert React, Journeyman Testing), 1 beginner (2 nodes unlocked), 3 stuck on Database node, rest distributed across tree
- 2 mentor accounts reviewing challenge submissions
- 3 demo login accounts: learner@skillforge.app, mentor@skillforge.app, admin@skillforge.app (all: demo1234)
- 4 archetypes distributed across learners: Builder, Analyst, Explorer, Collaborator
- Quiz questions seeded per node per mastery level (3-5 questions each)
- Some pending challenge submissions for mentor review workflow

### Project Scaffolding
- Next.js with App Router (app/ directory)
- Tailwind CSS with custom design tokens matching DESIGN-SPEC.md palette (void-black, forge-gray, arcane-blue, ember-gold, etc.)
- Google Fonts: Cinzel (headings) + IBM Plex Sans (body)
- Folder structure: app/ (routes), components/ (UI), lib/ (shared utilities, auth, db), db/ (schema, seed, migrations)
- Drizzle ORM with Neon serverless driver (@neondatabase/serverless)
- Pre-generated assets served from public/assets/ (17 SVGs + 6 PNGs)
- Environment variables: DATABASE_URL, SESSION_SECRET

### Claude's Discretion
- Exact Drizzle schema column types and index strategy
- API route structure (how many routes, naming)
- Tailwind config organization
- Seed data distribution details beyond specified scenarios
- Error page styling

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Visual Identity
- `DESIGN-SPEC.md` — Complete design system: colors, typography, layout structure, component specs, motion design, anti-patterns. MUST be followed exactly.

### Project Brief
- `BRIEF.md` — Domain context, user personas, demo data scenarios, tech stack requirements

### Pre-generated Assets
- `DESIGN-SPEC.md` §Asset Manifest — Lists all 23 files in public/assets/ with dimensions and usage

### Research
- `.planning/research/STACK.md` — Verified library versions and rationale (Next.js 16, React 19, React Flow 12, Drizzle 0.45, Neon serverless 1.0)
- `.planning/research/PITFALLS.md` — DAG validation requirement, Neon driver patterns, SSR gotchas
- `.planning/research/ARCHITECTURE.md` — Component boundaries, data flow, schema design patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `public/assets/` — 23 pre-generated files (17 SVGs for logos/icons/nodes, 6 PNGs for backgrounds/archetype portraits)
- `public/assets/favicon.svg` — Ready to use as site favicon
- `public/assets/logo.svg` — 200×48 logo for top bar and login
- `public/assets/hero-bg.png` — Login/landing page background

### Established Patterns
- None yet — this is greenfield. Phase 1 establishes all patterns.

### Integration Points
- Database schema is the foundation everything else builds on
- Auth middleware will be used by all subsequent phases
- API routes established here will be extended in later phases
- Tailwind theme tokens will be used across all components

</code_context>

<specifics>
## Specific Ideas

- The skill tree graph structure in BRIEF.md: Root "Web Fundamentals" → 3 branches (Frontend: React → State Management → Testing → Performance; Backend: Node.js → Databases → APIs → Authentication; DevOps: Git → CI/CD → Cloud → Monitoring)
- Design spec mandates Void Black (#0A0E17) background, not generic dark mode
- Login page should use hero-bg.png as atmospheric background
- The archetype quiz background uses quiz-bg.png

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-30*
