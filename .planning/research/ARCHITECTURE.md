# Architecture Patterns

**Domain:** Learning gamification platform with interactive skill tree graph
**Researched:** 2026-03-30
**Confidence:** MEDIUM (based on training data knowledge of React Flow, Next.js App Router, Drizzle ORM; no live docs verification possible)

## Recommended Architecture

This is a **graph-centric single-screen application** with role-based overlays. The skill tree canvas is the persistent UI shell; everything else (detail panels, quiz flow, admin tools) renders as overlays on top of it.

### High-Level Structure

```
Browser
  |
  +-- Next.js App Router (SSR + Client Components)
  |     |
  |     +-- Layout Shell (auth check, top bar, theme provider)
  |     |     |
  |     |     +-- Skill Tree Canvas (React Flow - CLIENT COMPONENT)
  |     |     |     |
  |     |     |     +-- Custom Hex Nodes (learner/mentor/admin variants)
  |     |     |     +-- Custom Animated Edges (prerequisite flow)
  |     |     |     +-- Minimap (React Flow built-in)
  |     |     |     +-- Zoom Controls
  |     |     |
  |     |     +-- Floating Overlays (client-side state driven)
  |     |           +-- Node Detail Panel (slide-in right)
  |     |           +-- Challenge Modal
  |     |           +-- Archetype Quiz (full-screen overlay)
  |     |           +-- Mentor Heatmap Toggle
  |     |           +-- Admin Edit Toolbar
  |     |
  |     +-- API Routes (Next.js Route Handlers)
  |           +-- /api/auth/* (session management)
  |           +-- /api/tree/* (node/edge CRUD, tree structure)
  |           +-- /api/progress/* (learner mastery, challenge completion)
  |           +-- /api/challenges/* (submission, review)
  |           +-- /api/quiz/* (archetype quiz logic)
  |           +-- /api/analytics/* (mentor/admin aggregations)
  |
  +-- Drizzle ORM
  |     |
  |     +-- Neon Postgres (serverless, connection pooling via @neondatabase/serverless)
```

### Component Boundaries

| Component | Responsibility | Communicates With | Rendering |
|-----------|---------------|-------------------|-----------|
| **Layout Shell** | Auth gate, session provider, theme, top bar | Auth API, all child components | Server Component (outer), Client (top bar) |
| **Skill Tree Canvas** | React Flow instance, node/edge rendering, zoom/pan, viewport state | Tree API (initial load), Progress API (mastery data), local state for interactions | Client Component (must be - React Flow requires DOM) |
| **Custom Hex Node** | Render single hexagonal skill node with mastery glow, handle click | Canvas (parent), Node Detail Panel (on click) | Client Component (React Flow node type) |
| **Custom Animated Edge** | Render connection with prerequisite-based animation state | Canvas (parent), derives state from connected nodes' mastery | Client Component (React Flow edge type) |
| **Node Detail Panel** | Show skill details, mastery level, challenges list, launch challenges | Tree API (node data), Progress API (user mastery), Challenge API | Client Component |
| **Challenge Modal** | Quiz UI, code exercise display, submission form, peer review | Challenge API (submit/review), Progress API (update mastery on completion) | Client Component |
| **Archetype Quiz** | Full-screen quiz flow, archetype calculation, reveal animation | Quiz API (questions, submit answers), user profile update | Client Component |
| **Mentor Heatmap Overlay** | Aggregate mastery visualization on same tree, learner breakdown per node | Analytics API (cohort data), overlays on Canvas nodes | Client Component |
| **Admin Edit Mode** | Drag nodes, add/remove connections, edit node metadata | Tree API (CRUD), modifies Canvas node/edge state | Client Component |
| **API Route Handlers** | Data access, business logic, authorization | Drizzle ORM / Neon Postgres | Server only |
| **Drizzle Schema** | Database schema definition, migrations, type-safe queries | Neon Postgres | Build time + Server |

### Data Flow

**Initial Page Load (Server-side):**
```
1. User hits / (or /tree)
2. Layout Server Component checks auth via cookie/session
3. If unauthenticated -> redirect to /login
4. If no archetype -> show Archetype Quiz overlay
5. Server fetches: tree structure (nodes + edges) + user progress (mastery levels)
6. Passes as props to client-side Skill Tree Canvas
7. Canvas renders React Flow with custom nodes reflecting user's mastery state
```

**Node Interaction (Client-side):**
```
1. User clicks hex node on canvas
2. Canvas sets selectedNodeId in local state
3. Node Detail Panel slides in, shows cached node data
4. If challenge data not loaded -> fetch from /api/challenges?nodeId=X
5. User starts challenge -> Challenge Modal opens
6. User completes challenge -> POST /api/challenges/submit
7. Server calculates new mastery level -> returns updated progress
8. Client updates node appearance (glow, level badge) via React state
9. If mastery threshold met -> check if new nodes should unlock
10. Unlock animation plays on newly available connections/nodes
```

**Mentor View (Same tree, different lens):**
```
1. Mentor toggles heatmap mode (client-side state)
2. Fetch /api/analytics/cohort-mastery (aggregated data per node)
3. Overlay heatmap colors on existing tree nodes
4. Click node -> instead of challenges, show learner breakdown
5. Click learner -> see their individual progress on this node
6. Pending reviews badge -> fetch /api/challenges/pending-reviews
```

**Admin Edit Mode:**
```
1. Admin toggles edit mode (client-side state)
2. Nodes become draggable (React Flow built-in)
3. Floating toolbar appears with: Add Node, Delete Node, Edit Node, Add Connection
4. Changes are optimistic -> PATCH /api/tree/nodes or /api/tree/edges
5. Save/publish mechanism to prevent accidental tree changes from going live
```

## Database Schema Architecture

The schema has four major entity groups:

### 1. Identity & Auth
- **users** (id, email, passwordHash, role: learner|mentor|admin, archetypeId, displayName, createdAt)
- **sessions** (id, userId, expiresAt) -- simple session table, no JWT complexity needed for a demo

### 2. Tree Structure (admin-managed, shared across all users)
- **skillNodes** (id, name, description, iconKey, positionX, positionY, branchName, createdAt)
- **skillEdges** (id, sourceNodeId, targetNodeId, createdAt) -- directed prerequisite edges
- **masteryLevelDefinitions** (id, nodeId, level: 1-5, title: "Novice"|...|"Master", description, requiredChallenges)

### 3. Learner Progress (per-user)
- **learnerProgress** (id, userId, nodeId, masteryLevel: 0-5, unlockedAt, lastActivityAt)
  - masteryLevel 0 = locked, 1 = novice, ..., 5 = master
- **challengeAttempts** (id, userId, challengeId, submittedAt, status: pending|passed|failed, response, mentorReviewId)

### 4. Challenges & Content
- **challenges** (id, nodeId, masteryLevel, type: quiz|code|project|peerReview, title, description, content JSON, order)
- **challengeReviews** (id, attemptId, mentorId, score, feedback, reviewedAt)

### 5. Archetypes
- **archetypes** (id, name, description, color, iconKey)
- **quizQuestions** (id, questionText, order)
- **quizAnswers** (id, questionId, answerText, archetypeId, weight)

**Key relationships:**
```
users --(1:many)--> learnerProgress --(many:1)--> skillNodes
skillNodes --(1:many via skillEdges)--> skillNodes (prerequisite graph)
skillNodes --(1:many)--> challenges --(1:many)--> challengeAttempts
challengeAttempts --(1:1)--> challengeReviews
users --(many:1)--> archetypes
```

## Patterns to Follow

### Pattern 1: Server Data, Client Rendering
**What:** Fetch tree structure and user progress server-side in the page component, pass to client-side React Flow as initial data. Subsequent interactions use client-side fetches to API routes.
**When:** Always for the main tree view. This gives fast initial render with SEO (not critical here but good practice) and avoids loading spinners on the primary view.
**Why:** React Flow must be a client component (it needs DOM access for canvas rendering). But the data it needs can be fetched server-side and passed as props, avoiding a client-side loading state on first paint.

```typescript
// app/(authenticated)/page.tsx (Server Component)
export default async function TreePage() {
  const session = await getSession();
  const [nodes, edges, progress] = await Promise.all([
    db.query.skillNodes.findMany(),
    db.query.skillEdges.findMany(),
    db.query.learnerProgress.findMany({ where: eq(learnerProgress.userId, session.userId) }),
  ]);

  return <SkillTreeCanvas initialNodes={nodes} initialEdges={edges} userProgress={progress} />;
}
```

### Pattern 2: Custom Node Types with React Flow
**What:** Define a `HexNode` custom node type that renders the hexagonal skill node with mastery-aware styling. Register it once with React Flow via `nodeTypes` prop.
**When:** For all skill nodes on the canvas.
**Why:** React Flow's custom nodes are React components -- they receive `data` prop where you pass mastery level, lock state, archetype relevance, etc. This keeps rendering logic in React, not in canvas/SVG manipulation.

```typescript
const nodeTypes = {
  hexNode: HexNode,  // registered once, used for all skill nodes
};

// HexNode component receives: data.masteryLevel, data.name, data.iconKey, data.isLocked
```

### Pattern 3: Derived Unlock State
**What:** Node unlock state is computed from prerequisites, not stored directly. A node is unlocked when ALL prerequisite nodes (via edges) have masteryLevel >= 1 (Novice).
**When:** On every progress update.
**Why:** Storing unlock state separately creates sync issues. Computing it from the graph + progress data is the single source of truth. The computation is cheap (small graph, ~20-50 nodes).

```typescript
function computeUnlockedNodes(edges: Edge[], progress: Map<string, number>): Set<string> {
  const unlocked = new Set<string>();
  for (const node of allNodes) {
    const prerequisites = edges.filter(e => e.targetNodeId === node.id);
    if (prerequisites.length === 0 || prerequisites.every(e => (progress.get(e.sourceNodeId) ?? 0) >= 1)) {
      unlocked.add(node.id);
    }
  }
  return unlocked;
}
```

### Pattern 4: Role-Based View Composition
**What:** Same tree canvas, different overlays and interaction handlers based on user role. Not separate pages.
**When:** Mentor and admin views.
**Why:** The design spec explicitly requires the tree as the single screen. Role changes what clicking a node does (learner: see challenges, mentor: see learner breakdown, admin: edit node) and what overlays are available.

```typescript
// In SkillTreeCanvas
const handleNodeClick = (nodeId: string) => {
  if (role === 'admin' && editMode) return handleAdminNodeEdit(nodeId);
  if (role === 'mentor') return handleMentorNodeInspect(nodeId);
  return handleLearnerNodeDetail(nodeId);
};
```

### Pattern 5: Optimistic Updates for Challenge Completion
**What:** When a learner completes a challenge, immediately update the node's visual state (glow, level) before server confirms.
**When:** Challenge submission responses.
**Why:** The "unlock moment" animation is the core dopamine hit. Waiting 200-500ms for a server round-trip kills the feel. Optimistically update, then reconcile if server disagrees (rare in practice).

## Anti-Patterns to Avoid

### Anti-Pattern 1: Separate Pages per Feature
**What:** Creating /dashboard, /skills, /challenges, /quiz as separate routes.
**Why bad:** Directly violates the design spec. The tree IS the app. Navigation away from the tree breaks spatial continuity -- the core UX mechanic.
**Instead:** Single route (/) with the tree canvas. Everything else is floating overlays, panels, and modals managed by client-side state.

### Anti-Pattern 2: Storing the Full Graph in Global State
**What:** Putting all nodes, edges, and progress into a global state manager (Redux, Zustand) for the entire app.
**Why bad:** React Flow already manages its own internal state for nodes, edges, viewport. Duplicating this in external state creates sync bugs and re-render storms.
**Instead:** Let React Flow own the graph state. Pass initial data as props. Use React Flow's `onNodesChange` / `onEdgesChange` callbacks only when you need to persist changes (admin mode). Keep UI overlay state (selectedNode, activePanel) in a lightweight context or local state.

### Anti-Pattern 3: Computing Heatmaps Client-Side
**What:** Fetching all 20 learners' full progress data to the mentor's browser and computing aggregates there.
**Why bad:** Doesn't scale (even though demo is small), and leaks individual learner data unnecessarily to the client before it's needed.
**Instead:** Server-side aggregation endpoint: `/api/analytics/cohort-mastery` returns `{nodeId, avgMastery, learnerCount, stuckCount}[]`. Drill-down to individual learners only on node click.

### Anti-Pattern 4: Heavy Canvas Animations Without requestAnimationFrame
**What:** Using CSS transitions or setInterval for the mastery pulse and connection flow animations.
**Why bad:** CSS animations on SVG elements inside React Flow can cause layout thrashing. Many simultaneous CSS transitions on 20+ nodes will jank.
**Instead:** Use CSS animations with `will-change: opacity` and `transform` for simple pulses. For particle effects (Expert/Master nodes), use a lightweight canvas overlay or CSS `@keyframes` with GPU-composited properties only. Keep it simple -- a glowing box-shadow pulse is more performant than actual particle systems.

### Anti-Pattern 5: JWT for Auth in a Demo App
**What:** Implementing full JWT with refresh tokens, token rotation, etc.
**Why bad:** Overengineered for a demo. Adds complexity without benefit. Session-based auth with a server-side session table is simpler and more secure by default.
**Instead:** Cookie-based sessions. `httpOnly` cookie with session ID. Session table in Postgres. Simple middleware that checks session on each request.

## Component Build Order (Dependencies)

The build order is driven by what blocks what:

```
Phase 1: Foundation (nothing depends on UI yet)
  |- Database schema + Drizzle setup + Neon connection
  |- Auth system (users, sessions, login/register)
  |- Seed script skeleton (creates demo accounts)

Phase 2: Tree Data Layer (API + data before visualization)
  |- Skill node/edge CRUD API routes
  |- Seed the CodeForge Academy tree structure (nodes, edges, mastery definitions)
  |- Progress tracking API (read/write learner mastery)

Phase 3: Tree Visualization (the hero feature, needs Phase 1+2 data)
  |- React Flow setup with custom HexNode and AnimatedEdge
  |- Server-side data fetch -> client canvas rendering
  |- Node click -> Detail Panel (slide-in)
  |- Minimap + zoom controls
  |- Mastery level visual states (locked through master)
  |- Connection animation (unlock flow)

Phase 4: Engagement Layer (needs tree + progress)
  |- Archetype quiz (onboarding flow, full-screen overlay)
  |- Challenge system (quiz type first, then project submission)
  |- Mastery progression (complete challenge -> level up -> unlock animation)
  |- Seed full demo data (20 learners with progress)

Phase 5: Role Views (needs all of the above)
  |- Mentor heatmap overlay + learner breakdown
  |- Mentor challenge review workflow
  |- Admin tree edit mode
  |- Admin analytics view

Phase 6: Polish
  |- Animations (mastery pulse, unlock moment, archetype reveal)
  |- Responsive design adjustments
  |- Demo account login flow
```

**Why this order:**
- Schema first because everything reads/writes to the database
- Auth before anything else because every API route needs it
- Tree data before visualization because React Flow needs nodes/edges to render
- Visualization before engagement because challenges reference nodes that must be visible
- Role views last because they layer on top of the working learner experience
- Polish last because animations are meaningless without working functionality

## Scalability Considerations

| Concern | Demo (20 users) | 1K users | 10K+ users |
|---------|-----------------|----------|------------|
| **Tree rendering** | React Flow handles 50 nodes trivially | Same -- tree structure doesn't grow per user | Same -- tree is shared, ~50-100 nodes max |
| **Progress queries** | Direct DB query per user | Add index on (userId, nodeId) | Same, Neon scales reads well |
| **Heatmap aggregation** | COUNT/AVG query | Same, add materialized view if slow | Background job to pre-compute |
| **Challenge submissions** | Simple INSERT | Same | Consider queue for mentor notifications |
| **Session management** | Session table works fine | Same | Consider Redis if session checks become bottleneck |

For this demo, none of these are concerns. The tree structure is admin-managed and shared (not per-user), so the graph size stays small regardless of user count.

## Key Architectural Decision: React Flow

**Why React Flow over D3 or custom SVG/Canvas:**

| Criterion | React Flow | D3.js | Custom SVG |
|-----------|-----------|-------|------------|
| React integration | Native -- nodes are React components | Imperative, fights React's model | Manual, lots of boilerplate |
| Custom node rendering | Pass any React component as node type | SVG manipulation, no React components inside | Full control but from scratch |
| Zoom/Pan | Built-in, performant | Built-in (d3-zoom) but wiring to React is painful | Must implement from scratch |
| Minimap | Built-in component | Must build | Must build |
| Edge animations | Custom edge components (React) | SVG animation, doable but verbose | Must implement |
| Learning curve | Low for React devs | High (completely different paradigm) | N/A (no library to learn) |
| Maintenance | Actively maintained, large community | Stable but no React-specific support | You maintain everything |

React Flow is the clear choice. It treats nodes and edges as React components, which means the hex node styling, mastery glow, and click handlers are all standard React code. The zoom/pan/minimap are built-in. Custom edges support animation. It is the standard library for this type of interactive graph UI in React.

**Version note:** React Flow v12+ (rebranded from reactflow to @xyflow/react). Use `@xyflow/react` as the npm package. (MEDIUM confidence -- verify package name at install time.)

## Sources

- React Flow documentation (reactflow.dev) -- training data, not live-verified
- Next.js App Router patterns -- training data, well-established patterns
- Drizzle ORM with Neon Postgres -- training data, known integration
- Design spec and brief from project files -- direct project context
