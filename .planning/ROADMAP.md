# Roadmap: SkillForge

## Overview

SkillForge delivers an RPG-inspired skill tree learning platform in four phases: foundation (database, auth, seed data), the hero skill tree visualization, the engagement loop (archetype quiz, challenges, mastery), and role-specific views with polish. Each phase builds strictly on the previous -- the tree needs data, engagement needs the tree, and role views overlay the working learner experience.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Foundation** - Database schema, auth, API routes, seed data, project scaffolding
- [ ] **Phase 2: Skill Tree Canvas** - Interactive React Flow visualization with hexagonal nodes, connections, minimap, and node detail panel
- [ ] **Phase 3: Engagement Loop** - Archetype quiz, challenge system, mastery progression, and unlock flow
- [ ] **Phase 4: Role Views and Polish** - Mentor heatmap, admin tools, responsive design, visual polish, deployment

## Phase Details

### Phase 1: Foundation
**Goal**: A running Next.js app with complete database schema, authentication, API routes, and realistic seed data -- everything downstream phases need to render and interact with
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, DEMO-01, DEMO-02, DEMO-03, DEMO-04, DEMO-05, DSGN-01, DSGN-02, DSGN-03
**Success Criteria** (what must be TRUE):
  1. User can sign up, log in, and log out; session persists across browser refresh
  2. Three demo accounts (learner/mentor/admin) exist and can log in with role-appropriate access
  3. CodeForge Academy skill tree with 3 branches and ~15 nodes is queryable from the API, including challenges at each mastery level
  4. 20 demo learners exist with varied progression, including the specific scenarios (1 advanced, 1 beginner, 3 stuck on Database)
  5. App renders with dark RPG theme, correct fonts (Cinzel/IBM Plex Sans), and pre-generated assets loaded
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md — Project scaffold, RPG design system (Tailwind tokens, fonts), and complete Drizzle schema
- [ ] 01-02-PLAN.md — JWT auth system, middleware, auth/tree API routes, login/register UI pages
- [ ] 01-03-PLAN.md — Seed data (CodeForge Academy tree, 23 users, challenges, progression), DAG validation, smoke tests

### Phase 2: Skill Tree Canvas
**Goal**: Learners see and navigate a full-canvas interactive skill tree -- the hero experience where hexagonal nodes show mastery state, connections animate, and clicking a node reveals its details
**Depends on**: Phase 1
**Requirements**: TREE-01, TREE-02, TREE-03, TREE-04, TREE-05, TREE-06, TREE-07, NODE-01, NODE-02, NODE-03, NODE-04, NODE-05, PREREQ-01, PREREQ-02, PREREQ-03, PREREQ-04, DSGN-04
**Success Criteria** (what must be TRUE):
  1. Learner sees a full-canvas zoomable/pannable skill tree with hexagonal nodes color-coded by mastery level (locked=dim through master=white-gold glow)
  2. Clicking a node opens a slide-in detail panel showing skill name, mastery level, description, prerequisites, and available challenges
  3. Nodes unlock when prerequisites are met, with animated energy flow along connections and a flash transition on the newly unlocked node
  4. Minimap in bottom-left shows full tree with viewport indicator; top bar shows archetype badge, progress counter, and avatar
  5. Tree renders responsively on desktop and tablet viewports
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — Core React Flow canvas with hexagonal nodes, animated edges, mastery CSS, minimap, and zoom/pan
- [ ] 02-02-PLAN.md — Top bar (archetype/progress/avatar), node detail panel (slide-in), mastery steps, challenges API, responsive
- [ ] 02-03-PLAN.md — Prerequisite unlock logic, energy flow animation on edges, node flash on unlock

### Phase 3: Engagement Loop
**Goal**: Learners can discover their archetype, complete challenges to level up skills, and experience the full mastery progression loop that makes the tree come alive
**Depends on**: Phase 2
**Requirements**: ARCH-01, ARCH-02, ARCH-03, ARCH-04, ARCH-05, CHAL-01, CHAL-02, CHAL-03, CHAL-04, CHAL-05, MAST-01, MAST-02, MAST-03, MAST-04
**Success Criteria** (what must be TRUE):
  1. New learner completes a 5-7 question visual archetype quiz and sees a dramatic reveal of their archetype (Builder/Analyst/Explorer/Collaborator) with icon and color
  2. Learner can start a quiz challenge from a node's detail panel, answer multiple-choice questions, and receive immediate feedback with mastery XP awarded
  3. Completing enough challenges advances mastery level (Novice through Master), with node visual intensity updating in real-time (glow, border color, particle effects at Expert/Master)
  4. Archetype badge appears in top bar and learner profile after quiz completion
  5. Learner can submit project challenges (link/description) for mentor review
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Role Views and Polish
**Goal**: Mentors can monitor cohort progress and review challenges, admins can configure the skill tree and view analytics, and the full app is polished and deployed
**Depends on**: Phase 3
**Requirements**: MENT-01, MENT-02, MENT-03, MENT-04, ADMN-01, ADMN-02, ADMN-03, ADMN-04
**Success Criteria** (what must be TRUE):
  1. Mentor sees a heatmap overlay on the skill tree showing cohort mastery levels per node, with stuck learners highlighted in amber
  2. Mentor can click a node to see learner breakdown and can review/approve/reject submitted challenge responses
  3. Admin can add nodes, create/remove prerequisite connections, and define mastery criteria and challenges
  4. Admin sees engagement analytics showing popular paths, drop-off nodes, and learner counts per mastery level
  5. App is deployed to Vercel at skillforge.demos.fonnit.com with all demo accounts functional
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD
- [ ] 04-03: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/3 | Planning complete | - |
| 2. Skill Tree Canvas | 0/3 | Planning complete | - |
| 3. Engagement Loop | 0/2 | Not started | - |
| 4. Role Views and Polish | 0/3 | Not started | - |
