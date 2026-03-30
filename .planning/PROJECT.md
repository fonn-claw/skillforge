# SkillForge

## What This Is

SkillForge is a learning gamification and skill progression platform that wraps around educational content with RPG-inspired mechanics. Learners navigate an interactive, zoomable skill tree — a visual graph of interconnected hexagonal nodes representing skills — progressing through mastery levels (Novice → Master) by completing applied challenges. It serves learners who choose their own path, mentors who monitor cohort progress, and admins who configure the skill tree structure.

## Core Value

The interactive skill tree IS the experience — a full-canvas, zoomable, pannable graph where learners spatially navigate their knowledge landscape, see what they've mastered, what's next, and what's locked, with RPG-inspired visual feedback that makes progression feel like powering up.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Interactive zoomable/pannable skill tree as the primary UI (full-canvas, hexagonal nodes, glowing connections)
- [ ] Learner archetype quiz (Builder, Analyst, Explorer, Collaborator) with character-creation-style reveal
- [ ] 5-level mastery system per node (Novice → Apprentice → Journeyman → Expert → Master) with visual distinction
- [ ] Node detail panel with mastery level, description, prerequisites, and challenges
- [ ] Challenge system (quiz, code exercise, project submission, peer review)
- [ ] Prerequisite-based node unlocking with animated connection flow
- [ ] Mentor heatmap overlay showing cohort mastery levels and stuck learners
- [ ] Mentor challenge review workflow
- [ ] Admin skill tree configuration (add nodes, set prerequisites, define mastery criteria)
- [ ] Admin engagement analytics (popular paths, drop-off points)
- [ ] Authentication with role-based access (learner, mentor, admin)
- [ ] Demo data: CodeForge Academy with 20 learners, web dev skill tree, 3 branches
- [ ] Responsive design with RPG-inspired dark theme (enchanted forge aesthetic)

### Out of Scope

- Video hosting / content authoring — this is the gamification layer, not a course platform
- Real-time collaboration / chat — not needed for skill progression
- Payment / subscription system — not part of v1
- Mobile native app — web-first, responsive design sufficient
- Email notifications — not needed for demo
- OAuth / social login — email/password sufficient for v1

## Context

- **Visual identity**: RPG skill tree (Path of Exile / Diablo inspired), dark atmospheric canvas, hexagonal nodes with mastery-level glow, enchanted forge color palette
- **UI paradigm**: Graph-first, full-canvas with floating overlays. No sidebar, no dashboard, no separate pages. The tree IS the app.
- **Design spec**: Detailed in DESIGN-SPEC.md — includes specific colors, typography (Cinzel + IBM Plex Sans), component specs, motion design, and anti-patterns
- **Pre-generated assets**: 23 files in public/assets/ (SVG icons for nodes/archetypes/mastery + DALL-E illustrations for backgrounds/archetype reveals)
- **Demo scenario**: CodeForge Academy teaching web development — 3 branches (Frontend, Backend, DevOps), 20 learners at various progress levels, 4 archetypes represented
- **Tech ecosystem**: Next.js with App Router, Neon Postgres, Drizzle ORM, deploy to Vercel
- **Graph rendering**: React Flow or similar library for the interactive skill tree canvas

## Constraints

- **Tech stack**: Next.js App Router + Neon Postgres + Drizzle ORM — specified by project requirements
- **Database**: Must use Neon Postgres, NOT SQLite
- **Deployment**: Vercel with custom domain skillforge.demos.fonnit.com
- **Assets**: Must use pre-generated assets in public/assets/ as documented in DESIGN-SPEC.md
- **Design**: Must follow DESIGN-SPEC.md exactly — colors, typography, layout, anti-patterns
- **Single session**: Complete build in one session

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React Flow for skill tree | Best maintained React graph library, supports custom nodes/edges, zoom/pan built-in | — Pending |
| Full-canvas layout with floating overlays | Design spec mandates graph-first UI, no sidebar/dashboard | — Pending |
| Hexagonal nodes with mastery glow | Design spec specifies exact node design, matches RPG aesthetic | — Pending |
| Cinzel + IBM Plex Sans typography | Design spec font choices — gravitas for headings, readability for body | — Pending |
| Demo accounts with seeded data | 3 demo accounts (learner/mentor/admin) with realistic CodeForge Academy data | — Pending |

---
*Last updated: 2026-03-30 after initialization*
