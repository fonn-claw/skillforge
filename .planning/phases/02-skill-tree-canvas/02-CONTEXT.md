# Phase 2: Skill Tree Canvas - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Full-canvas interactive skill tree visualization using React Flow (@xyflow/react). Learners see hexagonal nodes color-coded by mastery level, connected by animated prerequisite paths, with a slide-in detail panel, minimap, zoom controls, and top bar. This is the hero experience — the tree IS the app.

</domain>

<decisions>
## Implementation Decisions

### Node Rendering
- Custom React Flow node component using SVG hexagon shape from public/assets/node-hexagon.svg as base
- Node border color indicates mastery level per DESIGN-SPEC.md mastery level colors (locked=#2A3150, novice=#4A7CFF@40%, apprentice=#4A7CFF, journeyman=#14B8A6, expert=#F0A830, master=#FFF7DB)
- Outer glow ring via CSS box-shadow/filter, intensity increases with mastery level
- Center contains skill icon (16×16px simplified SVG — use generic icons per branch for now)
- Locked nodes: desaturated, dashed border, lock icon overlay from public/assets/icon-node-locked.svg
- Mastery indicator icons from public/assets/ (icon-node-novice.svg through icon-node-master.svg) shown on node
- 64×64px at default zoom, scale to 1.1× on hover with tooltip showing skill name and level
- Nodes must be memoized (React.memo) to prevent re-render performance issues with 15+ nodes

### Connection Lines
- Custom React Flow edge component with SVG curved paths (bezier, not straight lines)
- Inactive connections: #2A3150 (barely visible, 2px)
- Active (prerequisite met): animated gradient flow from parent to child using SVG animateMotion or CSS dash-offset, colors #4A7CFF → #14B8A6
- Completed path: solid #34D399 with subtle particle dots flowing along path
- Connection animation triggers when prerequisite node reaches required mastery level

### Node Detail Panel
- 400px wide floating panel, slides in from right edge on node click
- Dark glass effect: #151A28 at 95% opacity with backdrop-filter: blur(20px)
- Top: large skill icon + name + mastery level badge (pill/shield shape in mastery color)
- Middle: description, prerequisites listed with check/lock icons
- Bottom: challenge cards (stacked, clickable) — cards show challenge type and difficulty
- Mastery progress as 5 rune-like step indicators (not a progress bar)
- Dismiss by clicking outside, pressing Escape, or clicking canvas background
- Clicking another node while panel is open switches panel content (no close/reopen)

### Canvas Interaction
- React Flow with fitView on initial load, centered on root node "Web Fundamentals"
- Zoom range: 0.3 min, 2.0 max — smooth scroll zoom with trackpad support
- Pan via click-drag on canvas background
- Minimap in bottom-left (160×120px) using React Flow's built-in MiniMap component, shows current viewport
- Zoom controls in bottom-right: minimal +/- buttons styled in forge aesthetic

### Top Bar
- 48px height, semi-transparent dark overlay (#151A28 at 90% opacity with backdrop-filter: blur)
- Left: hamburger menu icon + "SkillForge" logo from public/assets/logo.svg
- Center: archetype badge (shield icon in archetype color) + progress counter ("★ 14/47" format)
- Right: user avatar circle with first initial + dropdown for logout
- Top bar is always visible (does not hide on zoom/scroll for v1)

### Mastery Pulse Animation
- Mastered nodes emit slow rhythmic pulse (3s CSS keyframe cycle) in their mastery color
- Expert/Master nodes: additional subtle particle effect (CSS pseudo-elements drifting upward like embers)
- Locked nodes: no animation, static muted appearance

### Claude's Discretion
- Exact React Flow configuration options (nodeTypes, edgeTypes, proOptions)
- SVG path calculations for hexagonal node shape
- Minimap styling details
- Exact transition timing for panel slide-in
- How to structure React components (file organization)
- Whether to use React Flow's built-in controls or custom zoom buttons

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Visual Identity
- `DESIGN-SPEC.md` — Complete design system: colors (#0A0E17 bg, #4A7CFF primary, #F0A830 secondary), typography (Cinzel/IBM Plex Sans), component specs for skill nodes (64×64 hex, mastery colors), connection lines, node detail panel, mastery badges, top bar layout, motion design (connection flow 800ms, pulse 3s cycle)
- `DESIGN-SPEC.md` §Layout Structure — Full-canvas with floating overlays, 48px top bar, 400px detail panel, 160×120 minimap, zoom controls

### Assets
- `DESIGN-SPEC.md` §Asset Manifest — All SVG/PNG assets with dimensions and usage
- `public/assets/node-hexagon.svg` — 64×64 base skill node shape
- `public/assets/icon-node-*.svg` — Mastery level indicator icons (locked, novice, apprentice, journeyman, expert, master)
- `public/assets/icon-archetype-*.svg` — Archetype badge icons for top bar

### Data Layer (Phase 1)
- `db/schema.ts` — Skill tree schema: skillNodes (name, description, branch, positionX, positionY, iconUrl), nodeEdges (sourceId, targetId, requiredMasteryLevel), userNodeMastery (userId, nodeId, currentLevel, xpCurrent, xpRequired)
- `app/api/tree/nodes/route.ts` — GET skill nodes with user's mastery data merged
- `app/api/tree/edges/route.ts` — GET prerequisite edges
- `lib/auth.ts` — JWT auth utilities for getting current user

### Research
- `.planning/research/STACK.md` — React Flow (@xyflow/react v12), must use 'use client' + dynamic import with ssr:false
- `.planning/research/PITFALLS.md` — React Flow SSR gotcha, memoization requirement, CSS-based animations over JS state

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `db/schema.ts` — Complete schema with skillNodes, nodeEdges, userNodeMastery tables
- `app/api/tree/nodes/route.ts` — API endpoint returning nodes with mastery data
- `app/api/tree/edges/route.ts` — API endpoint returning prerequisite edges
- `lib/auth.ts` — JWT auth with getCurrentUser() helper
- `public/assets/` — 23 pre-generated SVGs and PNGs for nodes, archetypes, backgrounds
- `tailwind.config.ts` — 20+ RPG color tokens already configured (void-black, forge-gray, arcane-blue, ember-gold, etc.)

### Established Patterns
- Next.js App Router with `app/` directory structure
- `app/(authenticated)/layout.tsx` — Auth-gated layout wrapper
- Tailwind CSS with custom design tokens for RPG theme
- API routes return JSON with standard error handling

### Integration Points
- `app/(authenticated)/page.tsx` — Currently a placeholder, this is where the skill tree canvas will render
- Tree data fetched via `/api/tree/nodes` and `/api/tree/edges` endpoints
- Auth context available via `/api/auth/me` and middleware headers (x-user-id, x-user-role)

</code_context>

<specifics>
## Specific Ideas

- The tree must feel like Path of Exile's passive skill tree — a living constellation map, not a static org chart
- Nodes radiate outward from Web Fundamentals at center, three branches spread like galaxy arms
- The "unlock moment" (energy flowing from completed node to newly unlocked) is the most important animation — 800ms per DESIGN-SPEC.md
- React Flow must be loaded client-side only (SSR: false) due to DOM dependency
- Node positions are stored in DB (hand-tuned in seed data) — use these coordinates directly in React Flow

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-skill-tree-canvas*
*Context gathered: 2026-03-31*
