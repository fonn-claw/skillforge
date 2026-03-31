# Phase 2: Skill Tree Canvas - Research

**Researched:** 2026-03-31
**Domain:** Interactive graph visualization with React Flow (@xyflow/react v12), custom SVG nodes/edges, canvas animations
**Confidence:** HIGH

## Summary

Phase 2 builds the hero experience: a full-canvas interactive skill tree using React Flow (@xyflow/react v12.10.2). The tree renders hexagonal custom nodes with mastery-level color coding, animated bezier connection lines, a slide-in detail panel, minimap, and top bar with archetype/progress info. All data comes from existing Phase 1 API endpoints (`/api/tree/nodes` and `/api/tree/edges`).

React Flow v12 provides everything needed out of the box: custom node/edge rendering, built-in MiniMap and Controls components, zoom/pan with touch support, and the `useNodesState`/`useEdgesState` hooks for state management. The critical technical challenges are: (1) client-only rendering due to React Flow's DOM dependency, (2) SVG-based hexagonal custom nodes with CSS glow animations, (3) animated gradient edges using SVG `animateMotion`, and (4) memoization to maintain 60fps with 15+ nodes.

**Primary recommendation:** Build a `'use client'` wrapper component that dynamically imports React Flow with `ssr: false`. Define stable `nodeTypes` and `edgeTypes` objects outside the component. Use CSS animations (keyframes, filters) for all visual effects -- never JS state-driven animations on the canvas.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Custom React Flow node component using SVG hexagon shape from public/assets/node-hexagon.svg as base
- Node border color indicates mastery level per DESIGN-SPEC.md mastery level colors (locked=#2A3150, novice=#4A7CFF@40%, apprentice=#4A7CFF, journeyman=#14B8A6, expert=#F0A830, master=#FFF7DB)
- Outer glow ring via CSS box-shadow/filter, intensity increases with mastery level
- Center contains skill icon (16x16px simplified SVG -- use generic icons per branch for now)
- Locked nodes: desaturated, dashed border, lock icon overlay from public/assets/icon-node-locked.svg
- Mastery indicator icons from public/assets/ (icon-node-novice.svg through icon-node-master.svg) shown on node
- 64x64px at default zoom, scale to 1.1x on hover with tooltip showing skill name and level
- Nodes must be memoized (React.memo) to prevent re-render performance issues with 15+ nodes
- Custom React Flow edge component with SVG curved paths (bezier, not straight lines)
- Inactive connections: #2A3150 (barely visible, 2px); Active: animated gradient flow #4A7CFF to #14B8A6; Completed: solid #34D399 with particle dots
- 400px wide floating panel, slides from right on node click, dark glass effect #151A28 at 95% opacity with backdrop-filter: blur(20px)
- React Flow with fitView on initial load, centered on root node "Web Fundamentals"
- Zoom range: 0.3 min, 2.0 max
- Minimap in bottom-left (160x120px) using React Flow's built-in MiniMap component
- 48px top bar, semi-transparent dark overlay, archetype badge + progress counter center, avatar right
- Mastered nodes emit slow rhythmic pulse (3s CSS keyframe cycle)
- Expert/Master nodes: additional subtle particle effect (CSS pseudo-elements drifting upward like embers)
- React Flow must be loaded client-side only (SSR: false) due to DOM dependency
- Node positions stored in DB -- use coordinates directly in React Flow

### Claude's Discretion
- Exact React Flow configuration options (nodeTypes, edgeTypes, proOptions)
- SVG path calculations for hexagonal node shape
- Minimap styling details
- Exact transition timing for panel slide-in
- How to structure React components (file organization)
- Whether to use React Flow's built-in controls or custom zoom buttons

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TREE-01 | Learner sees full-canvas interactive skill tree with hexagonal nodes and curved connection lines | React Flow custom nodes with SVG hexagon + custom bezier edges; dynamic import with ssr:false |
| TREE-02 | Learner can zoom and pan the skill tree canvas | React Flow built-in zoom/pan; minZoom=0.3, maxZoom=2.0, fitView on mount |
| TREE-03 | Skill tree displays node mastery state visually | Custom node component with mastery-level CSS classes for border color, glow intensity, locked state |
| TREE-04 | Connection lines animate with gradient flow when prerequisites are met | Custom edge with SVG linearGradient + animateMotion for active edges |
| TREE-05 | Minimap shows full tree with current viewport highlighted | React Flow built-in MiniMap component, 160x120px, bottom-left positioned |
| TREE-06 | Mastered nodes emit slow rhythmic pulse in their mastery color | CSS @keyframes animation (3s cycle) on custom node wrapper |
| TREE-07 | Top bar displays archetype badge, progress counter, and user avatar | Separate React component above the ReactFlow canvas, fetches user data from /api/auth/me |
| NODE-01 | Clicking a node opens a floating detail panel (400px, slides from right) | React state for selectedNodeId; Framer Motion AnimatePresence for panel slide-in |
| NODE-02 | Detail panel shows skill name, mastery level badge, description, prerequisites with check/lock status | Panel fetches node detail data; prerequisites derived from edges data with mastery check |
| NODE-03 | Detail panel shows available challenges as stacked clickable cards | Fetch challenges for node from API; render as cards (non-functional in Phase 2, wired in Phase 3) |
| NODE-04 | Mastery progress displayed as 5 rune-like step indicators | Custom component with 5 SVG/CSS rune icons, filled/unfilled based on current mastery level ordinal |
| NODE-05 | Hovering a node shows tooltip with skill name and current level | CSS/HTML tooltip on hover within custom node component |
| PREREQ-01 | Nodes unlock when all prerequisite nodes reach required mastery level | Client-side derivation: compare user mastery data against edge requiredMasteryLevel |
| PREREQ-02 | Unlocking a node triggers animated energy flow along connection (800ms) | SVG animateMotion on edge path triggered by state change; 800ms duration |
| PREREQ-03 | Newly unlocked node transitions from locked to novice state with brief flash | CSS transition/animation triggered by mastery level change |
| PREREQ-04 | Locked nodes display with desaturated color, dashed border, and lock icon overlay | CSS classes on custom node: grayscale filter, dashed stroke, lock SVG overlay |
| DSGN-04 | Responsive design that works on desktop and tablet viewports | React Flow handles resize; detail panel collapses to bottom sheet on < 768px; minimap hidden on mobile |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @xyflow/react | 12.10.2 | Graph canvas with zoom/pan/minimap | Locked decision; already in package.json |
| framer-motion | 12.38.0 | Detail panel slide-in/out animation | Already installed; AnimatePresence handles mount/unmount |
| lucide-react | 1.7.0 | UI icons (menu, close, zoom +/-) | Already installed; tree-shakeable |
| next | 16.2.1 | App Router, dynamic imports | Already installed |

### Supporting (no new installs needed)
All required libraries are already in `package.json` from Phase 1. No new dependencies for Phase 2.

**Installation:** None required.

## Architecture Patterns

### Recommended Component Structure
```
app/(authenticated)/
  layout.tsx          # MODIFY: replace current simple layout with skill tree shell
  page.tsx            # MODIFY: replace placeholder with ReactFlow canvas
components/
  tree/
    SkillTreeCanvas.tsx     # 'use client' - main ReactFlow wrapper (dynamic import)
    SkillTreeFlow.tsx       # The actual ReactFlow component with nodes/edges
    HexagonNode.tsx         # Custom node component (React.memo wrapped)
    PrerequisiteEdge.tsx    # Custom edge component with animation states
    NodeDetailPanel.tsx     # 400px slide-in panel (Framer Motion)
    MasterySteps.tsx        # 5 rune-like mastery level indicators
    TopBar.tsx              # 48px top bar with archetype, progress, avatar
    MiniMapStyled.tsx       # Styled MiniMap wrapper (optional)
  ui/
    Tooltip.tsx             # Hover tooltip for nodes
```

### Pattern 1: Client-Only React Flow with Dynamic Import
**What:** React Flow requires DOM APIs and cannot render server-side. Must use Next.js dynamic import with ssr:false.
**When to use:** Always -- React Flow crashes on SSR.
**Example:**
```typescript
// components/tree/SkillTreeCanvas.tsx
'use client';

import dynamic from 'next/dynamic';

const SkillTreeFlow = dynamic(
  () => import('./SkillTreeFlow'),
  { ssr: false, loading: () => <TreeLoadingSkeleton /> }
);

export default function SkillTreeCanvas() {
  return <SkillTreeFlow />;
}
```
Source: [React Flow + Next.js pattern](https://reactflow.dev/learn), [Next.js dynamic imports](https://nextjs.org/docs/pages/guides/lazy-loading)

### Pattern 2: Stable nodeTypes and edgeTypes Outside Component
**What:** Define nodeTypes and edgeTypes as module-level constants so React Flow does not re-register them on every render.
**When to use:** Always -- unstable references cause React Flow to unmount/remount all nodes.
**Example:**
```typescript
// components/tree/SkillTreeFlow.tsx
import { ReactFlow, MiniMap, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import HexagonNode from './HexagonNode';
import PrerequisiteEdge from './PrerequisiteEdge';

// MUST be outside component -- stable reference
const nodeTypes = { hexagon: HexagonNode };
const edgeTypes = { prerequisite: PrerequisiteEdge };

export default function SkillTreeFlow() {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      minZoom={0.3}
      maxZoom={2.0}
      fitView
      fitViewOptions={{ padding: 0.2 }}
    >
      <MiniMap style={{ width: 160, height: 120 }} />
      <Controls />
    </ReactFlow>
  );
}
```
Source: [React Flow custom nodes docs](https://reactflow.dev/examples/nodes/custom-node)

### Pattern 3: Custom Hexagonal Node with Mastery States
**What:** A React.memo-wrapped component rendering the hexagon SVG with CSS-driven mastery visuals.
**When to use:** For every skill node in the tree.
**Example:**
```typescript
// components/tree/HexagonNode.tsx
import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

type HexNodeData = {
  name: string;
  mastery: 'locked' | 'novice' | 'apprentice' | 'journeyman' | 'expert' | 'master';
  iconKey: string | null;
  branchName: string | null;
};

function HexagonNode({ data }: NodeProps) {
  const d = data as HexNodeData;
  return (
    <div className={`hexagon-node mastery-${d.mastery}`}>
      <Handle type="target" position={Position.Top} className="invisible" />
      <svg viewBox="0 0 64 64" width={64} height={64}>
        <polygon
          points="32,4 56,18 56,46 32,60 8,46 8,18"
          className="hex-fill"
        />
        {/* Inner hex for depth */}
        <polygon
          points="32,12 48,22 48,42 32,52 16,42 16,22"
          className="hex-inner"
        />
      </svg>
      {/* Mastery indicator icon overlay */}
      <img
        src={`/assets/icon-node-${d.mastery}.svg`}
        alt=""
        className="mastery-indicator"
      />
      {/* Tooltip on hover */}
      <div className="node-tooltip">{d.name} - {d.mastery}</div>
      <Handle type="source" position={Position.Bottom} className="invisible" />
    </div>
  );
}

export default memo(HexagonNode);
```

### Pattern 4: Custom Animated Edge with SVG animateMotion
**What:** Bezier edge with gradient stroke and animated particle flowing along path for active connections.
**Example:**
```typescript
import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';

type PrereqEdgeData = {
  status: 'inactive' | 'active' | 'completed';
};

export default function PrerequisiteEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  const d = data as PrereqEdgeData;

  return (
    <>
      <defs>
        <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4A7CFF" />
          <stop offset="100%" stopColor="#14B8A6" />
        </linearGradient>
      </defs>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: d.status === 'inactive' ? '#2A3150'
            : d.status === 'completed' ? '#34D399'
            : `url(#grad-${id})`,
          strokeWidth: 2,
        }}
      />
      {d.status === 'active' && (
        <circle r="4" fill="#4A7CFF">
          <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
      {d.status === 'completed' && (
        <circle r="3" fill="#34D399" opacity="0.6">
          <animateMotion dur="3s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
    </>
  );
}
```
Source: [React Flow animating edges](https://reactflow.dev/examples/edges/animating-edges)

### Pattern 5: Data Fetching and Node/Edge Transformation
**What:** Fetch from Phase 1 APIs and transform into React Flow format.
**Example:**
```typescript
// Transform API data to React Flow nodes
function toFlowNodes(apiNodes: ApiNode[]): Node[] {
  return apiNodes.map((n) => ({
    id: n.id,
    type: 'hexagon',
    position: { x: n.positionX, y: n.positionY },
    data: {
      name: n.name,
      mastery: n.mastery?.currentLevel ?? 'locked',
      iconKey: n.iconKey,
      branchName: n.branchName,
      description: n.description,
      xpCurrent: n.mastery?.xpCurrent ?? 0,
      xpRequired: n.mastery?.xpRequired ?? 100,
    },
  }));
}

// Transform API edges to React Flow edges
function toFlowEdges(apiEdges: ApiEdge[], masteryMap: Map<string, string>): Edge[] {
  return apiEdges.map((e) => ({
    id: e.id,
    source: e.sourceNodeId,
    target: e.targetNodeId,
    type: 'prerequisite',
    data: {
      status: getEdgeStatus(e, masteryMap),
    },
  }));
}
```

### Anti-Patterns to Avoid
- **Inline nodeTypes/edgeTypes:** Causes React Flow to unmount/remount all nodes every render
- **JS-driven animations on nodes:** Use CSS @keyframes, not React state changes, for glow/pulse effects
- **box-shadow stacking for glows:** Use `filter: drop-shadow()` instead -- box-shadow does not follow SVG shapes and causes paint performance issues
- **Fetching data inside ReactFlow children:** Fetch in the parent, pass as props to avoid waterfall loads
- **Separate pages for detail panel:** The panel is an overlay on the canvas, not a route change

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Zoom/pan canvas | Custom wheel/touch handlers | React Flow built-in zoom/pan | Touch support, momentum, zoom limits all handled |
| Minimap | Canvas thumbnail renderer | `<MiniMap />` from @xyflow/react | Viewport indicator, click-to-navigate included |
| Edge path calculation | Manual SVG bezier math | `getBezierPath` from @xyflow/react | Handles source/target positions, returns valid SVG path |
| Node hit testing | Manual coordinate math | React Flow's built-in click/hover events | Accounts for zoom level, node bounds, overlaps |
| Panel slide animation | Manual CSS transitions | Framer Motion AnimatePresence | Handles mount/unmount animation, exit animations |
| Tooltip positioning | Manual coordinate tracking | CSS-only tooltip (position: absolute in node) | No z-index fighting with React Flow's SVG layer |

**Key insight:** React Flow handles all the hard canvas interaction problems. The implementation work is in custom node/edge rendering and data transformation -- not in building a canvas from scratch.

## Common Pitfalls

### Pitfall 1: React Flow SSR Crash
**What goes wrong:** Importing @xyflow/react in a server component causes "window is not defined" error.
**Why it happens:** React Flow depends on DOM APIs (window, document, ResizeObserver).
**How to avoid:** Use `dynamic(() => import('./SkillTreeFlow'), { ssr: false })` in a `'use client'` component.
**Warning signs:** Build fails or hydration errors on page load.

### Pitfall 2: Missing React Flow Stylesheet
**What goes wrong:** Nodes render but are invisible, or positioned at 0,0 with no handles visible.
**Why it happens:** React Flow's base CSS (`@xyflow/react/dist/style.css`) not imported.
**How to avoid:** Import the stylesheet in SkillTreeFlow.tsx or the layout.
**Warning signs:** Canvas is blank or nodes stack at origin.

### Pitfall 3: Node Re-render Cascade
**What goes wrong:** Zooming/panning feels laggy with 15+ nodes.
**Why it happens:** Unstable nodeTypes reference or unmemoized custom nodes cause full re-render on every frame.
**How to avoid:** (1) Define nodeTypes outside component, (2) wrap node component in React.memo, (3) keep animations in CSS not React state.
**Warning signs:** DevTools Profiler shows all nodes re-rendering on pan.

### Pitfall 4: SVG Glow Performance
**What goes wrong:** GPU spikes and choppy zoom with multiple glowing nodes.
**Why it happens:** `box-shadow` does not work on SVG elements; `filter: blur()` on many elements is expensive.
**How to avoid:** Use `filter: drop-shadow()` on the node wrapper div (one filter per node). For pulse animation, animate `opacity` of a pre-blurred pseudo-element rather than re-computing blur each frame. Limit SVG feGaussianBlur to selected/focused node only.
**Warning signs:** FPS below 30 during zoom when 10+ nodes have active glow.

### Pitfall 5: Detail Panel Z-Index Fighting
**What goes wrong:** Panel renders behind the React Flow canvas or minimap.
**Why it happens:** React Flow uses its own z-index stacking context for nodes, edges, and controls.
**How to avoid:** Render the NodeDetailPanel as a sibling of the ReactFlow component (not a child), with a higher z-index. Structure: `<div class="relative"><ReactFlow>...</ReactFlow><NodeDetailPanel /></div>`.
**Warning signs:** Panel is invisible or partially covered by canvas elements.

### Pitfall 6: Handles Visible on Hexagonal Nodes
**What goes wrong:** React Flow's default circular handles appear as visible dots on the hexagon.
**Why it happens:** Custom nodes still need Handle components for edge routing, but they should be invisible.
**How to avoid:** Add `className="invisible"` or `style={{ opacity: 0, width: 0, height: 0 }}` to Handle components. They still function for edge attachment but are not visible.
**Warning signs:** Small circles at top/bottom of hexagons.

## Code Examples

### CSS for Mastery Level Glow States
```css
/* Mastery-level glow via CSS classes on node wrapper */
.hexagon-node {
  position: relative;
  width: 64px;
  height: 64px;
  transition: transform 0.2s ease;
}
.hexagon-node:hover {
  transform: scale(1.1);
}

.mastery-locked .hex-fill {
  fill: #151A28;
  stroke: #2A3150;
  stroke-dasharray: 4 2;
}
.mastery-novice .hex-fill {
  fill: #151A28;
  stroke: rgba(74, 124, 255, 0.4);
  filter: drop-shadow(0 0 4px rgba(74, 124, 255, 0.2));
}
.mastery-apprentice .hex-fill {
  fill: #151A28;
  stroke: #4A7CFF;
  filter: drop-shadow(0 0 6px rgba(74, 124, 255, 0.4));
}
.mastery-journeyman .hex-fill {
  fill: #151A28;
  stroke: #14B8A6;
  filter: drop-shadow(0 0 8px rgba(20, 184, 166, 0.5));
}
.mastery-expert .hex-fill {
  fill: #151A28;
  stroke: #F0A830;
  filter: drop-shadow(0 0 10px rgba(240, 168, 48, 0.6));
}
.mastery-master .hex-fill {
  fill: #1E2438;
  stroke: #FFF7DB;
  filter: drop-shadow(0 0 14px rgba(255, 247, 219, 0.7));
}

/* Mastery pulse animation */
@keyframes mastery-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
.mastery-expert .hex-fill,
.mastery-master .hex-fill {
  animation: mastery-pulse 3s ease-in-out infinite;
}

/* Ember particles for Expert/Master via pseudo-elements */
@keyframes ember-rise {
  0% { transform: translateY(0) scale(1); opacity: 0.8; }
  100% { transform: translateY(-20px) scale(0.3); opacity: 0; }
}
.mastery-expert::after,
.mastery-master::after {
  content: '';
  position: absolute;
  width: 3px;
  height: 3px;
  background: currentColor;
  border-radius: 50%;
  bottom: 50%;
  left: 50%;
  animation: ember-rise 2s ease-out infinite;
}
```

### React Flow Wrapper with Data Fetching
```typescript
'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  ReactFlow, MiniMap, useNodesState, useEdgesState,
  type Node, type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const nodeTypes = { hexagon: HexagonNode } as const;
const edgeTypes = { prerequisite: PrerequisiteEdge } as const;

export default function SkillTreeFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/tree/nodes').then(r => r.json()),
      fetch('/api/tree/edges').then(r => r.json()),
    ]).then(([apiNodes, apiEdges]) => {
      setNodes(toFlowNodes(apiNodes));
      setEdges(toFlowEdges(apiEdges, buildMasteryMap(apiNodes)));
    });
  }, []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        minZoom={0.3}
        maxZoom={2.0}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <MiniMap
          style={{ width: 160, height: 120 }}
          nodeColor={(node) => getMasteryColor(node.data.mastery)}
          maskColor="rgba(10, 14, 23, 0.8)"
        />
      </ReactFlow>
      {selectedNodeId && (
        <NodeDetailPanel
          nodeId={selectedNodeId}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  );
}
```

### Detail Panel with Framer Motion
```typescript
import { motion, AnimatePresence } from 'framer-motion';

function NodeDetailPanel({ nodeId, onClose }: { nodeId: string; onClose: () => void }) {
  // Fetch node details...
  return (
    <AnimatePresence>
      <motion.div
        key={nodeId}
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute top-0 right-0 w-[400px] h-full z-50
          bg-forge-gray/95 backdrop-blur-[20px] border-l border-steel-edge
          overflow-y-auto"
      >
        {/* Panel content: skill name, mastery badge, description, prerequisites, challenges */}
      </motion.div>
    </AnimatePresence>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `import ReactFlow from 'reactflow'` | `import { ReactFlow } from '@xyflow/react'` | React Flow v12 (2024) | Package renamed; style import path changed |
| `reactflow/dist/style.css` | `@xyflow/react/dist/style.css` | React Flow v12 | Old import path no longer works |
| `useNodesState` returned 3-tuple | Same 3-tuple but with improved typing | v12 | TypeScript generics for node data types |
| Custom viewport management | `fitView` + `fitViewOptions` | v12 | Built-in initial viewport control |

## Open Questions

1. **Challenge data endpoint for detail panel**
   - What we know: `/api/tree/nodes` returns node data with mastery. Phase 2 CONTEXT says panel shows challenge cards.
   - What's unclear: Is there a `/api/challenges?nodeId=X` endpoint from Phase 1, or does Phase 2 need to create one?
   - Recommendation: Create a lightweight `/api/tree/nodes/[id]/challenges` endpoint or include challenge count in the nodes API. Full challenge interaction is Phase 3.

2. **User profile data for top bar**
   - What we know: JWT contains userId and role. Archetype is in the users table.
   - What's unclear: Is there an `/api/auth/me` endpoint that returns archetype and display name?
   - Recommendation: If not present, create `/api/auth/me` that returns user profile with archetype info for the top bar.

3. **Unlock animation trigger**
   - What we know: PREREQ-02 requires animated energy flow when a node unlocks. In Phase 2 the tree is read-only (no challenge completion).
   - What's unclear: How to demonstrate the unlock animation without the challenge system.
   - Recommendation: Implement the animation infrastructure in Phase 2. The animation can be tested by toggling demo data or adding a dev-only trigger. It will be wired to real events in Phase 3.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Bash smoke tests (scripts/smoke-test.sh) |
| Config file | scripts/smoke-test.sh |
| Quick run command | `npm run build` (build verification) |
| Full suite command | `npm run smoke-test` (requires running server) |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TREE-01 | Hexagonal nodes render on canvas | smoke/manual | `npm run build` (no SSR crash) | Wave 0 |
| TREE-02 | Zoom and pan works | manual-only | Manual browser test | N/A |
| TREE-03 | Mastery state colors render | manual-only | Manual visual verification | N/A |
| TREE-04 | Connection animation on active edges | manual-only | Manual visual verification | N/A |
| TREE-05 | MiniMap visible in bottom-left | manual-only | Manual visual verification | N/A |
| TREE-06 | Mastered nodes pulse | manual-only | Manual visual verification | N/A |
| TREE-07 | Top bar with archetype and progress | smoke | Extend smoke-test to check auth/me endpoint | Wave 0 |
| NODE-01 | Detail panel slides on click | manual-only | Manual browser test | N/A |
| NODE-02 | Detail panel content correct | manual-only | Manual browser test | N/A |
| NODE-03 | Challenge cards in panel | manual-only | Manual browser test | N/A |
| NODE-04 | 5 rune mastery indicators | manual-only | Manual visual verification | N/A |
| NODE-05 | Hover tooltip | manual-only | Manual browser test | N/A |
| PREREQ-01 | Locked nodes when prereqs unmet | smoke | Check API returns mastery=null for locked nodes | Existing |
| PREREQ-04 | Locked node visual state | manual-only | Manual visual verification | N/A |
| DSGN-04 | Responsive on desktop + tablet | manual-only | Manual viewport resize test | N/A |

### Sampling Rate
- **Per task commit:** `npm run build` (verifies no SSR/import errors)
- **Per wave merge:** `npm run build && npm run smoke-test` (with dev server)
- **Phase gate:** Build succeeds + all visual requirements verified manually in browser

### Wave 0 Gaps
- [ ] Extend smoke-test.sh with `/api/auth/me` endpoint check (if created)
- [ ] Extend smoke-test.sh to verify build completes without React Flow SSR errors
- [ ] Most Phase 2 requirements are visual/interactive -- automated testing is limited; build success is the primary automated gate

## Sources

### Primary (HIGH confidence)
- [React Flow Custom Nodes](https://reactflow.dev/examples/nodes/custom-node) - Custom node component pattern, nodeTypes registration
- [React Flow Custom Edges](https://reactflow.dev/learn/customization/custom-edges) - BaseEdge, getBezierPath, custom edge rendering
- [React Flow Animating Edges](https://reactflow.dev/examples/edges/animating-edges) - SVG animateMotion pattern for edge animation
- [React Flow MiniMap](https://reactflow.dev/api-reference/components/minimap) - MiniMap component API, nodeColor prop
- [React Flow Controls](https://reactflow.dev/api-reference/components/controls) - Built-in zoom controls component
- [React Flow NodeProps](https://reactflow.dev/api-reference/types/node-props) - Full NodeProps type reference
- [React Flow v12 Migration](https://reactflow.dev/learn/troubleshooting/migrate-to-v12) - Package rename, API changes
- [Next.js Dynamic Imports](https://nextjs.org/docs/pages/guides/lazy-loading) - ssr:false pattern for client-only components

### Secondary (MEDIUM confidence)
- [Animated SVG Edge component](https://reactflow.dev/components/edges/animated-svg-edge) - Pre-built animated edge reference
- Project STACK.md and PITFALLS.md research from Phase 1

### Tertiary (LOW confidence)
- CSS animation performance for SVG filters -- based on training data, general web platform knowledge

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all packages already installed and version-verified in Phase 1
- Architecture: HIGH - React Flow v12 API verified against current official docs
- Pitfalls: HIGH - React Flow SSR issue is well-documented; performance patterns verified
- Animation patterns: MEDIUM - SVG animateMotion verified, CSS glow performance is training-data-based

**Research date:** 2026-03-31
**Valid until:** 2026-04-30 (React Flow v12 is stable, unlikely to break)
