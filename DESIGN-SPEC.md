# SkillForge — Design Specification

---

## UI Paradigm

**Graph-first.** The entire application is an interactive, zoomable, pannable skill tree rendered on a full canvas. The skill tree is not a feature of the app — it IS the app. Every learner interaction begins and ends on this graph. Think Path of Exile's passive skill tree crossed with a modern constellation map: nodes connected by glowing paths, clusters of related skills forming visible territories, and the learner's progress radiating outward from the center like light spreading through a network.

The graph is the single source of truth for where a learner stands, what they can do next, and how far they've come. There are no separate "dashboard," "courses," or "progress" pages. The tree contains all of that information spatially.

---

## Primary Interaction

**Exploring and activating skill nodes.** The learner spends most of their time:
1. Panning and zooming across the skill tree to survey their landscape
2. Clicking nodes to inspect mastery level, read descriptions, and launch challenges
3. Watching connections illuminate as prerequisites are satisfied

Everything else — archetype quiz, challenge completion, social comparison — feeds back into the tree. The tree is always visible, always the anchor.

---

## Layout Structure

**Full-canvas with floating overlays.**

```
┌─────────────────────────────────────────────────────┐
│ [≡]  SkillForge    ◈ Builder    ★ 14/47    [avatar] │  ← Thin top bar (48px, semi-transparent)
├─────────────────────────────────────────────────────┤
│                                                     │
│                                                     │
│              FULL-CANVAS SKILL TREE                 │
│           (zoomable, pannable graph)                │
│                                                     │
│                  ┌──────────┐                       │
│                  │ Node     │  ← Floating detail    │
│                  │ Detail   │    panel (appears on   │
│                  │ Panel    │    node click)         │
│                  └──────────┘                       │
│                                                     │
│                                                     │
│   ┌─────┐                                           │
│   │ Mini│  ← Minimap (bottom-left, like an RTS)     │
│   │ map │                                           │
│   └─────┘                              [zoom ±]     │
└─────────────────────────────────────────────────────┘
```

- **Top bar**: 48px, semi-transparent dark overlay. Logo left, archetype badge + progress counter center, avatar/menu right. Disappears on scroll/zoom for full immersion, reappears on hover near top edge.
- **Skill tree canvas**: 100% of remaining viewport. Dark background. Nodes and connections rendered via React Flow or similar graph library.
- **Node detail panel**: Floating card that slides in from the right (400px wide) when a node is clicked. Shows mastery level, description, challenges, and progress. Dismissible.
- **Minimap**: Bottom-left corner, 160×120px, shows the full tree with current viewport highlighted. Like an RTS game minimap.
- **Zoom controls**: Bottom-right, minimal +/- buttons.

**Mentor/Admin views** use the same canvas but with an overlay mode:
- Mentor: Heatmap overlay on nodes showing cohort mastery levels. Clicking a node shows learner breakdown instead of challenges.
- Admin: Edit mode where nodes become draggable and connections can be added/removed. Floating toolbar for tree configuration.

---

## Anti-patterns

- **Sidebar navigation** — Wastes horizontal space the tree needs. The tree must be full-width. Navigation lives in the top bar and contextual overlays.
- **Stat card dashboards** — "You completed 3 courses this week" cards destroy the RPG feel. Progress is visible IN the tree, not beside it.
- **Tables and lists of skills** — If skills are in a list, we've failed. The spatial relationship between skills IS the information architecture.
- **Progress bars** — Linear progress bars contradict the branching, non-linear nature of the skill tree. Mastery is shown through node glow intensity and level indicators.
- **Corporate color schemes** — No light grays, no #f5f5f5 backgrounds, no "clean and minimal" aesthetics. This is a rich, atmospheric, RPG-inspired experience.
- **Separate pages for each feature** — No /dashboard, /courses, /progress routes. The tree is the single screen. Everything else is an overlay or panel on top of it.

---

## Design System

### Colors

The palette draws from enchanted forges and arcane workshops — deep backgrounds, glowing accents, warm metallics.

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Background** | Void Black | `#0A0E17` | Canvas background, deepest layer |
| **Surface** | Forge Gray | `#151A28` | Panels, cards, overlays |
| **Surface Elevated** | Anvil Gray | `#1E2438` | Hover states, elevated cards |
| **Border** | Steel Edge | `#2A3150` | Subtle borders, dividers |
| **Primary** | Arcane Blue | `#4A7CFF` | Primary actions, active connections, focused nodes |
| **Secondary** | Ember Gold | `#F0A830` | XP indicators, mastery highlights, achievements |
| **Accent** | Forge Fire | `#FF6B35` | Urgent actions, new unlocks, notifications |
| **Text Primary** | Moonlight | `#E8ECF4` | Primary text |
| **Text Secondary** | Mist | `#8892A8` | Secondary text, descriptions |
| **Success** | Verdant | `#34D399` | Completed nodes, passed challenges |
| **Warning** | Amber Glow | `#FBBF24` | Approaching deadlines, stuck indicators |
| **Danger** | Blood Ruby | `#EF4444` | Failed challenges, errors |

**Mastery Level Colors** (node glow progression):

| Level | Color | Hex | Visual |
|-------|-------|-----|--------|
| Locked | Dim Gray | `#2A3150` | No glow, muted outline |
| Novice | Pale Blue | `#4A7CFF` at 40% opacity | Faint pulse |
| Apprentice | Blue | `#4A7CFF` | Steady glow |
| Journeyman | Teal | `#14B8A6` | Bright glow |
| Expert | Gold | `#F0A830` | Strong glow + particles |
| Master | White-Gold | `#FFF7DB` | Intense radiance, halo effect |

**Archetype Colors:**

| Archetype | Color | Hex |
|-----------|-------|-----|
| Builder | Forge Orange | `#FF6B35` |
| Analyst | Crystal Blue | `#38BDF8` |
| Explorer | Verdant Green | `#34D399` |
| Collaborator | Royal Purple | `#A78BFA` |

### Typography

- **Heading**: **Cinzel** — A Roman-inspired serif with gravitas. Used for skill names, mastery titles, and the logo wordmark. Weights: 400, 700.
- **Body**: **IBM Plex Sans** — Clean, technical, excellent readability at small sizes. Used for descriptions, challenge text, and UI labels. Weights: 400, 500, 600.

### Key Components

**Skill Node (the core element)**
- Hexagonal shape, 64×64px at default zoom
- Border color indicates mastery level (see mastery colors above)
- Center contains a skill icon (16×16px simplified SVG)
- Outer glow ring intensifies with mastery level
- Locked nodes: desaturated, dashed border, lock icon overlay
- On hover: scale to 1.1×, tooltip with skill name and level
- On click: opens detail panel

**Connection Lines**
- 2px paths between nodes following organic curves (not straight lines)
- Inactive: `#2A3150` (barely visible)
- Active (prerequisite met): animated gradient flow from parent to child, `#4A7CFF` → `#14B8A6`
- Completed path: solid `#34D399` with subtle particle flow

**Node Detail Panel**
- 400px wide, slides from right edge
- Dark glass effect: `#151A28` at 95% opacity with `backdrop-filter: blur(20px)`
- Top section: skill icon (large), name, mastery level badge
- Middle: description, prerequisites listed with check/lock icons
- Bottom: challenge cards (stacked, clickable)
- Mastery progress shown as 5 rune-like step indicators, not a progress bar

**Mastery Level Badge**
- Small pill/shield shape beside skill name
- Text label (e.g., "JOURNEYMAN") in mastery level color
- Subtle inner glow matching the level

**Archetype Badge**
- Displayed in top bar and on learner profiles
- Shield-shaped icon with archetype color and symbol
- Builder: hammer, Analyst: crystal/prism, Explorer: compass, Collaborator: linked rings

### Motion

**1. Connection Flow** — When a prerequisite is satisfied, energy visibly flows along the connection line from the completed node to the newly unlocked node. A pulse of light travels the path over 800ms, and the destination node transitions from locked (gray, dashed) to novice (faint blue glow) with a brief flash. This is the "unlock moment" — the most important animation in the app.

**2. Node Mastery Pulse** — Mastered nodes emit a slow, rhythmic pulse (3s cycle) in their mastery color. At Expert and Master levels, tiny particle effects drift upward from the node like embers from a forge. This makes the tree feel alive — a living map of accumulated knowledge.

---

## Screens

### 1. The Skill Tree (Primary Screen — 90% of time spent here)

**What the user sees first:** A dark canvas filled with an interconnected constellation of hexagonal nodes. The learner's starting cluster (Web Fundamentals) glows brightly in the center, with completed nodes radiating steady light and locked nodes fading into the darkness at the periphery. Three main branches (Frontend, Backend, DevOps) extend outward like arms of a galaxy. The top bar shows their archetype badge and progress count.

**What they interact with most:** Clicking nodes to see details, zooming to explore distant branches, watching connections light up after completing challenges. The detail panel is the primary action surface — from here they launch challenges, see their mastery level, and read what's needed to advance.

**What makes it different:** There is no list, no sidebar, no table of contents. The learner orients themselves spatially. "React is up and to the right from JavaScript." "I can see the Database cluster but the path there goes through Node.js." Spatial memory replaces menu memory. The tree breathes with subtle animations — mastered nodes pulse, connections flow, and unlocking a new node sends visible energy across the graph.

### 2. The Archetype Quiz (Onboarding — seen once)

**What the user sees first:** A full-screen, atmospheric experience. Dark background with subtle floating particles. A large question card centered on screen with the SkillForge logo above. "Discover Your Learner Archetype" as the heading. The quiz feels like a character creation screen, not a form.

**What they interact with:** 5-7 scenario-based questions presented one at a time with smooth transitions. Each answer is a visual card (not a radio button) — e.g., "When learning something new, I prefer to..." with four illustrated options. A progress indicator shows question count as small rune marks, not a progress bar.

**What makes it different:** The reveal. After the final question, the screen dims, particles converge to the center, and the archetype result materializes with its icon, color, and a brief description of the learning style. "You are a BUILDER. You learn by making things." This moment creates identity investment before the learner ever sees the tree.

### 3. The Mentor Heatmap (Mentor View)

**What the user sees first:** The same skill tree, but with a cohort heatmap overlay. Each node's color intensity reflects how many learners have reached that point and their average mastery. Hot nodes (many learners, high mastery) glow warmly. Cold nodes (few learners, low mastery) appear dim or highlighted in amber as trouble spots.

**What they interact with most:** Clicking a node to see the learner breakdown — who's at what level, who's stuck, who submitted a challenge for review. A floating panel lists pending challenge submissions that need mentor review, sorted by urgency.

**What makes it different:** The mentor sees the SAME tree as learners but through a diagnostic lens. They can identify at a glance that "3 learners are stuck on Database mastery" because that node pulses amber. No separate analytics page — the analytics ARE the tree.

---

## Asset Manifest

### Tier 1 — Functional SVGs

| Filename | Dimensions | Usage |
|----------|-----------|-------|
| `logo.svg` | 200×48 | Top bar, login screen |
| `logo-mark.svg` | 48×48 | Favicon source, compact spaces |
| `favicon.svg` | 32×32 | Browser tab favicon |
| `icon-node-locked.svg` | 24×24 | Locked skill node overlay |
| `icon-node-novice.svg` | 24×24 | Novice mastery indicator |
| `icon-node-apprentice.svg` | 24×24 | Apprentice mastery indicator |
| `icon-node-journeyman.svg` | 24×24 | Journeyman mastery indicator |
| `icon-node-expert.svg` | 24×24 | Expert mastery indicator |
| `icon-node-master.svg` | 24×24 | Master mastery indicator |
| `icon-archetype-builder.svg` | 24×24 | Builder archetype badge |
| `icon-archetype-analyst.svg` | 24×24 | Analyst archetype badge |
| `icon-archetype-explorer.svg` | 24×24 | Explorer archetype badge |
| `icon-archetype-collaborator.svg` | 24×24 | Collaborator archetype badge |
| `icon-challenge.svg` | 24×24 | Challenge action button |
| `icon-mastery-badge.svg` | 24×24 | Mastery completion badge |
| `empty-state-tree.svg` | 200×200 | Shown before archetype quiz completion |
| `node-hexagon.svg` | 64×64 | Base skill node shape |

### Tier 2 — DALL-E Illustrations

| Filename | Dimensions | Usage |
|----------|-----------|-------|
| `hero-bg.png` | 1024×1024 | Login/landing page background |
| `archetype-builder.png` | 1024×1024 | Builder archetype reveal screen |
| `archetype-analyst.png` | 1024×1024 | Analyst archetype reveal screen |
| `archetype-explorer.png` | 1024×1024 | Explorer archetype reveal screen |
| `archetype-collaborator.png` | 1024×1024 | Collaborator archetype reveal screen |
| `quiz-bg.png` | 1024×1024 | Archetype quiz background atmosphere |
