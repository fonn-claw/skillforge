# Technology Stack

**Project:** SkillForge -- Learning Gamification & Skill Progression Platform
**Researched:** 2026-03-30

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 16.2.1 | Full-stack framework (App Router) | Project requirement. App Router gives server components for data-heavy tree queries, server actions for mutations, and Vercel-native deployment. |
| React | 19.2.4 | UI layer | Ships with Next.js 16. React 19 server components reduce client bundle for the heavy graph canvas. |
| TypeScript | 5.x (bundled) | Type safety | Non-negotiable for a data-rich app with complex node/edge/mastery types. Drizzle's type inference depends on it. |

**Confidence: HIGH** -- Versions verified via npm registry.

### Database

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Neon Postgres | (managed) | Primary database | Project requirement. Serverless Postgres with branching, auto-scaling, and Vercel integration. |
| @neondatabase/serverless | 1.0.2 | Neon WebSocket driver | Required for serverless/edge Neon connections. Works over WebSockets, no TCP needed. |
| Drizzle ORM | 0.45.2 | Query builder & schema | Project requirement. Type-safe, lightweight, SQL-like syntax. Excellent Neon integration. |
| drizzle-kit | 0.31.10 | Migrations & introspection | Companion CLI for Drizzle. Handles schema push and migration generation. |

**Confidence: HIGH** -- Versions verified via npm registry. Neon + Drizzle is a well-documented pairing.

### Graph Visualization (The Hero)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @xyflow/react (React Flow) | 12.10.2 | Interactive skill tree canvas | The clear winner for this use case. Built-in zoom/pan, custom nodes/edges, minimap plugin, handles/connections, performant with 50+ nodes. Custom hexagonal nodes via SVG. Actively maintained by xyflow team. |

**Confidence: HIGH** -- Version verified. React Flow is the dominant React graph library. v12 is the current major under the @xyflow scope.

**Why React Flow over alternatives:**

| Alternative | Why Not |
|-------------|---------|
| D3.js | Too low-level. Would need to build zoom/pan/minimap/node-click from scratch. React integration is awkward (D3 wants DOM control). 10x more code for the same result. |
| vis.js / vis-network | Outdated, jQuery-era mental model. Poor React integration. Limited custom node styling. |
| Cytoscape.js | Better for data analysis graphs, worse for interactive UIs. Custom node rendering is painful. No built-in React wrapper with the quality of React Flow. |
| Custom SVG/Canvas | Maximum flexibility but weeks of work for zoom/pan/minimap/hit-testing/accessibility. Only justified if React Flow can't handle hexagonal nodes (it can via custom nodes). |
| Sigma.js | Optimized for large-scale network visualization (10K+ nodes). Overkill and harder to customize for 20-50 styled nodes. |

### Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 4.2.2 | Utility-first CSS | Fast development, easy to implement the dark RPG theme with custom colors. Design spec colors map directly to Tailwind config. |
| CSS custom properties | -- | Mastery level theming | Glow effects, gradients, and dynamic color changes per mastery level are easier with CSS variables than Tailwind alone. |

**Confidence: HIGH** -- Tailwind 4 is current stable. Ships with Next.js scaffolding.

### Animation & Motion

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Framer Motion | 12.38.0 | UI animations (panels, quiz, reveals) | Best React animation library. Handles the archetype reveal, panel slide-ins, quiz transitions. AnimatePresence for mount/unmount animations. |
| CSS animations + React Flow | -- | Graph animations (node glow, connection flow) | Node pulse effects and connection energy flow are better as CSS animations on React Flow custom nodes/edges. Framer Motion inside React Flow nodes adds overhead. |

**Confidence: HIGH** -- Framer Motion 12.x is current. The split approach (Framer for UI chrome, CSS for graph elements) avoids performance issues on the canvas.

### Authentication

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| bcryptjs | 3.0.3 | Password hashing | Pure JS bcrypt. Works in serverless/edge. No native bindings to worry about on Vercel. |
| jose | 6.2.2 | JWT tokens | Lightweight, standards-compliant JWT library. Works in edge runtime (unlike jsonwebtoken which needs Node crypto). |
| Next.js middleware | -- | Auth guard | Route protection via middleware.ts. Checks JWT, redirects unauthenticated users. |

**Confidence: HIGH** -- This is a demo app. Rolling simple JWT auth is faster than integrating NextAuth/Auth.js for 3 hardcoded demo accounts. No OAuth, no magic links, no session DB needed.

**Why not NextAuth/Auth.js:**
- Adds complexity for a demo with 3 seeded accounts
- Configuration overhead for a problem that's 20 lines of code
- The app doesn't need OAuth, email verification, or session management
- Simple JWT with httpOnly cookies is sufficient and faster to implement

### Validation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Zod | 4.3.6 | Schema validation | Type-safe validation for server actions, API inputs, archetype quiz responses. Drizzle has Zod integration for schema-to-validation generation. |

**Confidence: HIGH** -- Zod 4 is current stable.

### Icons & UI Components

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Lucide React | 1.7.0 | General UI icons | Lightweight, tree-shakeable icon set. For UI chrome only -- skill nodes use custom SVG assets from public/assets/. |

**Confidence: HIGH** -- Pre-generated SVG assets in public/assets/ handle domain-specific icons (mastery levels, archetypes, node shapes). Lucide fills gaps for generic UI (menu, close, zoom, settings).

### Fonts

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| next/font/google | (bundled) | Font loading | Cinzel (headings) and IBM Plex Sans (body) per design spec. next/font handles self-hosting and optimization automatically. |

**Confidence: HIGH** -- Built into Next.js, no additional dependency.

## Full Dependency List

### Production Dependencies

```bash
npm install next@latest react@latest react-dom@latest \
  @xyflow/react@latest \
  drizzle-orm@latest @neondatabase/serverless@latest \
  framer-motion@latest \
  zod@latest \
  bcryptjs@latest jose@latest \
  lucide-react@latest
```

### Dev Dependencies

```bash
npm install -D typescript@latest @types/react@latest @types/react-dom@latest \
  @types/bcryptjs@latest \
  drizzle-kit@latest \
  tailwindcss@latest @tailwindcss/postcss@latest \
  postcss@latest
```

## What NOT to Use

| Technology | Why Avoid |
|------------|-----------|
| **NextAuth / Auth.js** | Over-engineered for 3 demo accounts with password login. Adds config complexity, session DB tables, and callback chains for a problem solved by 20 lines of JWT code. |
| **D3.js** | Wrong abstraction level. React Flow gives you zoom/pan/minimap/custom-nodes out of the box. D3 would require building all of that manually while fighting React for DOM control. |
| **Prisma** | Project specifies Drizzle. Also: Prisma's client generation step adds build complexity, and its query engine is heavier than Drizzle's thin SQL layer. |
| **shadcn/ui** | The RPG aesthetic is too custom for a component library. The design spec demands hexagonal nodes, glowing edges, forge-themed panels. Pre-built components would need so much override they'd slow you down. Build bespoke components with Tailwind. |
| **Radix UI** | Same reasoning as shadcn. The app has very few standard UI patterns (no tables, no dropdowns, no complex forms). The quiz, tree, and panels are all custom. |
| **Socket.io / real-time** | No real-time requirements. The skill tree updates on user action, not live. Server actions + revalidation handle state changes. |
| **Redis / caching layer** | Demo scale. Neon handles the query load. Adding Redis adds infra complexity for no benefit at 20 users. |
| **CSS-in-JS (styled-components, Emotion)** | Tailwind + CSS custom properties cover everything. CSS-in-JS adds runtime overhead, especially problematic in a canvas-heavy app. |
| **react-force-graph / 3D libraries** | The skill tree is 2D with fixed positions (admin places nodes). Force-directed layout would make the tree chaotic and non-deterministic. Nodes need stable, intentional positioning. |

## Architecture Notes for Stack

### React Flow Custom Nodes Strategy
React Flow supports fully custom node rendering. The hexagonal skill nodes will be custom React components rendered inside React Flow's node system. This means:
- Each node is a React component with access to props (mastery level, locked state, skill data)
- CSS animations for glow/pulse effects run on the node component
- Click handlers open the detail panel (React state, not React Flow state)
- The minimap plugin renders automatically from the node graph

### Neon + Drizzle Connection Pattern
Use `@neondatabase/serverless` with Drizzle's `drizzle-orm/neon-serverless` adapter. Connection is per-request (serverless model), no connection pooling needed for demo scale.

```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);
```

### Font Loading
```typescript
import { Cinzel, IBM_Plex_Sans } from 'next/font/google';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700'] });
const ibmPlexSans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'] });
```

## Sources

- npm registry (all versions verified via `npm view <package> version` on 2026-03-30)
- React Flow documentation: https://reactflow.dev
- Drizzle ORM documentation: https://orm.drizzle.team
- Neon documentation: https://neon.tech/docs
- Next.js documentation: https://nextjs.org/docs
