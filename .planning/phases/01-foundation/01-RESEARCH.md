# Phase 1: Foundation - Research

**Researched:** 2026-03-30
**Domain:** Next.js App Router + Neon Postgres + Drizzle ORM + JWT Auth + Seed Data
**Confidence:** HIGH

## Summary

Phase 1 establishes the entire backend foundation: a Next.js 16 app with Drizzle ORM connected to Neon Postgres, a custom JWT auth system with role-based access, the complete database schema modeling a skill tree DAG, and comprehensive seed data for CodeForge Academy. The phase also sets up the design system (Tailwind theme tokens, fonts, pre-generated assets) so downstream phases can build UI immediately.

The tech choices are all locked by CONTEXT.md decisions. The stack is well-documented and versions are current as of today. The primary risks are: (1) getting the DAG schema right with proper constraints from day one, (2) the Zod 4 API differences from older tutorials, and (3) ensuring the seed script creates the specific learner scenarios the brief demands.

**Primary recommendation:** Build in this order -- project scaffold with Tailwind theme, then Drizzle schema + Neon connection, then auth system, then seed script, then API routes, then a minimal login page to prove it all works end-to-end.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Relational tables modeling a DAG: `users`, `skill_nodes`, `node_edges` (prerequisite connections), `challenges`, `user_node_mastery`, `challenge_submissions`
- Skill nodes store x,y position coordinates for hand-tuned tree layout (not auto-layout)
- Node edges represent prerequisite relationships with required_mastery_level field
- Challenges stored per-node per-mastery-level with type discriminator (quiz, project_submission)
- Quiz challenges store questions/answers as JSONB
- User mastery tracked per-node with current_level enum (locked, novice, apprentice, journeyman, expert, master) and xp_current/xp_required fields
- Archetype stored on user record after quiz completion
- DAG validation (cycle detection) enforced at data layer
- Simple JWT auth with bcryptjs for password hashing and jose for JWT signing/verification
- HTTP-only secure cookie for session persistence across browser refresh
- Role enum on user: learner, mentor, admin
- Middleware checks JWT on protected routes and injects user context
- No NextAuth/Auth.js
- Drizzle seed script (`db/seed.ts`) run via `npm run seed`
- CodeForge Academy tree: 3 branches (Frontend, Backend, DevOps) with ~15 total nodes branching from "Web Fundamentals" root
- Hand-tuned x,y positions for each node ensuring RPG-aesthetic spatial layout
- 20 demo learners with specific scenarios: 1 advanced (Expert React, Journeyman Testing), 1 beginner (2 nodes unlocked), 3 stuck on Database node, rest distributed across tree
- 2 mentor accounts reviewing challenge submissions
- 3 demo login accounts: learner@skillforge.app, mentor@skillforge.app, admin@skillforge.app (all: demo1234)
- 4 archetypes distributed across learners: Builder, Analyst, Explorer, Collaborator
- Quiz questions seeded per node per mastery level (3-5 questions each)
- Some pending challenge submissions for mentor review workflow
- Next.js with App Router (app/ directory)
- Tailwind CSS with custom design tokens matching DESIGN-SPEC.md palette
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

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can sign up with email and password | bcryptjs 3.0.3 for hashing, jose 6.2.2 for JWT, Drizzle users table with passwordHash column |
| AUTH-02 | User can log in and maintain session across browser refresh | JWT in httpOnly secure cookie, jose sign/verify, Next.js middleware for session check |
| AUTH-03 | User can log out from any screen | Clear the httpOnly cookie via API route, redirect to login |
| AUTH-04 | System enforces role-based access (learner, mentor, admin) | pgEnum for roles, middleware extracts role from JWT, server-side role checks on API routes |
| DEMO-01 | CodeForge Academy with web dev skill tree: 3 branches, ~15 nodes | Seed script with hand-tuned x,y positions, node_edges for prerequisite DAG |
| DEMO-02 | 20 learners at various progression including specific scenarios | Seed script with explicit mastery states per user per node |
| DEMO-03 | 3 demo accounts with specific emails and password | Seed with bcryptjs-hashed "demo1234" password, role assignments |
| DEMO-04 | Pre-populated challenges with quiz questions per node per mastery level | challenges table with JSONB content, 3-5 questions seeded per node per level |
| DEMO-05 | 4 learner archetypes represented across demo learners | archetypes table seeded, users assigned archetype_id |
| DSGN-01 | Dark RPG theme using design spec colors | Tailwind config with custom color tokens (void-black, forge-gray, arcane-blue, etc.) |
| DSGN-02 | Cinzel font for headings, IBM Plex Sans for body | next/font/google with Cinzel and IBM_Plex_Sans, CSS variables on root layout |
| DSGN-03 | All pre-generated assets from public/assets/ used | 23 files verified present (17 SVGs + 6 PNGs), favicon.svg linked in layout |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.1 | Full-stack framework (App Router) | Project requirement. Server components for data fetching, route handlers for API. |
| React | 19.2.4 | UI layer | Ships with Next.js 16. |
| TypeScript | 5.x (bundled) | Type safety | Non-negotiable for Drizzle type inference. |
| Drizzle ORM | 0.45.2 | Query builder and schema | Project requirement. Type-safe, SQL-like, excellent Neon integration. |
| drizzle-kit | 0.31.10 | Migrations CLI | Companion to Drizzle. Handles `drizzle-kit push` and migration generation. |
| @neondatabase/serverless | 1.0.2 | Neon WebSocket/HTTP driver | Required for serverless Neon connections on Vercel. |
| Tailwind CSS | 4.2.2 | Utility-first styling | Fast development, custom dark theme via config. |
| Zod | 4.3.6 | Schema validation | API input validation, form validation. **Note: Zod 4 has breaking changes from v3.** |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| bcryptjs | 3.0.3 | Password hashing | Auth signup/login. Pure JS, works in serverless. |
| jose | 6.2.2 | JWT sign/verify | Session tokens. Works in Edge Runtime (unlike jsonwebtoken). |
| drizzle-zod | 0.8.3 | Schema-to-validation | Generate Zod schemas from Drizzle tables. Supports Zod 4. |
| lucide-react | 1.7.0 | General UI icons | Menu, close, lock icons for UI chrome. |
| framer-motion | 12.38.0 | UI animations | Panel slide-ins, page transitions. Not needed in Phase 1 but install now. |
| @xyflow/react | 12.10.2 | Skill tree canvas | Not used in Phase 1 but install now to avoid later dependency conflicts. |

**Installation:**
```bash
npm install next@16.2.1 react@19.2.4 react-dom@19.2.4 \
  drizzle-orm@0.45.2 @neondatabase/serverless@1.0.2 \
  zod@4.3.6 drizzle-zod@0.8.3 \
  bcryptjs@3.0.3 jose@6.2.2 \
  lucide-react@1.7.0 framer-motion@12.38.0 \
  @xyflow/react@12.10.2

npm install -D typescript@latest @types/react@latest @types/react-dom@latest \
  @types/bcryptjs@3.0.0 \
  drizzle-kit@0.31.10 \
  tailwindcss@4.2.2 @tailwindcss/postcss@latest \
  postcss@latest
```

## Architecture Patterns

### Recommended Project Structure
```
skillforge/
├── app/
│   ├── layout.tsx              # Root layout: fonts, theme, metadata
│   ├── page.tsx                # Redirect to /login or /tree based on auth
│   ├── login/
│   │   └── page.tsx            # Login page (hero-bg.png background)
│   ├── register/
│   │   └── page.tsx            # Signup page
│   ├── (authenticated)/
│   │   ├── layout.tsx          # Auth guard layout, top bar shell
│   │   └── page.tsx            # Main tree page (Phase 2+)
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── register/route.ts
│       │   └── logout/route.ts
│       └── tree/
│           ├── nodes/route.ts  # GET skill tree nodes
│           └── edges/route.ts  # GET skill tree edges
├── components/
│   └── ui/                     # Shared UI components
├── db/
│   ├── schema.ts               # Drizzle schema (all tables)
│   ├── index.ts                # DB connection singleton
│   ├── seed.ts                 # Seed script
│   └── migrations/             # Generated by drizzle-kit
├── lib/
│   ├── auth.ts                 # JWT sign/verify, cookie helpers
│   ├── middleware-auth.ts      # Auth check for middleware
│   └── validations.ts          # Zod schemas for API inputs
├── middleware.ts                # Next.js middleware (auth guard)
├── drizzle.config.ts           # Drizzle Kit config
├── tailwind.config.ts          # Design system tokens
├── public/
│   └── assets/                 # 23 pre-generated files (already present)
└── .env.local                  # DATABASE_URL, SESSION_SECRET
```

### Pattern 1: Neon + Drizzle Connection (HTTP adapter for serverless)
**What:** Single DB instance module using the neon-http adapter.
**When:** Every server-side data access.
**Example:**
```typescript
// db/index.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```
Source: [Drizzle + Neon docs](https://orm.drizzle.team/docs/connect-neon)

### Pattern 2: JWT Auth with httpOnly Cookie
**What:** Sign JWT with jose, set as httpOnly cookie, verify in middleware.
**When:** All auth flows.
**Example:**
```typescript
// lib/auth.ts
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function signToken(payload: { userId: string; role: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as { userId: string; role: string };
}

// Setting cookie in login route handler:
// response.cookies.set('session', token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
```
Source: [jose library](https://github.com/panva/jose), [Next.js auth patterns](https://nextjs.org/docs/pages/building-your-application/authentication)

### Pattern 3: Drizzle pgEnum for Role and Mastery
**What:** Use Drizzle's `pgEnum` for type-safe enums.
**When:** role, mastery_level, challenge_type, archetype columns.
**Example:**
```typescript
// db/schema.ts
import { pgEnum, pgTable, text, integer, real, timestamp, jsonb, uuid } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['learner', 'mentor', 'admin']);
export const masteryLevelEnum = pgEnum('mastery_level', ['locked', 'novice', 'apprentice', 'journeyman', 'expert', 'master']);
export const challengeTypeEnum = pgEnum('challenge_type', ['quiz', 'project_submission']);
export const archetypeEnum = pgEnum('archetype_name', ['builder', 'analyst', 'explorer', 'collaborator']);
```
Source: [Drizzle pgEnum docs](https://orm.drizzle.team/docs/column-types/pg)

### Pattern 4: Middleware Auth Guard
**What:** Next.js middleware checks JWT cookie on protected routes.
**When:** Every request to authenticated routes.
**Example:**
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  try {
    const payload = await verifyToken(token);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-role', payload.role as string);
    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!login|register|api/auth|_next|assets|favicon).*)'],
};
```

### Pattern 5: Seed Script with Deterministic Data
**What:** A standalone TypeScript script that seeds all demo data idempotently.
**When:** Run via `npm run seed` after schema push.
**Example approach:**
```typescript
// db/seed.ts
// 1. Clear all tables (in dependency order: submissions, mastery, challenges, edges, nodes, users, archetypes)
// 2. Insert 4 archetypes
// 3. Insert 3 demo accounts + 20 learner accounts (bcryptjs hash "demo1234")
// 4. Insert ~15 skill nodes with hand-tuned x,y positions
// 5. Insert edges (prerequisite connections)
// 6. Insert challenges per node per mastery level (JSONB quiz content)
// 7. Insert learner progress (mastery states per user per node)
// 8. Insert some challenge submissions (pending mentor review)
```

### Anti-Patterns to Avoid
- **Storing unlock state in the DB:** Unlock state should be derived from prerequisites + mastery data, not stored separately. Storing it creates sync bugs.
- **Using jsonwebtoken instead of jose:** jsonwebtoken requires Node.js crypto and fails in Edge Runtime where Next.js middleware runs. jose uses Web Crypto API.
- **Connection pooling overkill:** At demo scale (20 users), use the neon-http driver (one HTTP request per query). No need for WebSocket pooling or pgbouncer.
- **Putting auth logic in client components only:** Every API route and server action must independently verify the JWT. Client-side role checks are for UI only, never for security.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Password hashing | Custom hash function | bcryptjs | Salt handling, timing attacks, work factor tuning |
| JWT tokens | Manual base64 + HMAC | jose library | Header formatting, expiry checks, algorithm validation |
| DB migrations | Raw SQL files | drizzle-kit push/generate | Schema diffing, rollback tracking, type consistency |
| Form/API validation | Manual if/else checks | Zod 4 schemas | Type inference, error messages, composability |
| Font optimization | Manual font file hosting | next/font/google | Self-hosting, font-display, preload, no layout shift |
| Cookie security | Manual Set-Cookie headers | Next.js cookies() API | httpOnly, secure, sameSite defaults, easier to get right |

**Key insight:** This phase is infrastructure. Every shortcut in auth or schema design compounds into bugs in Phases 2-4. Use the established libraries exactly as documented.

## Common Pitfalls

### Pitfall 1: Zod 4 API Differences
**What goes wrong:** Copy-pasting Zod 3 patterns from tutorials. `z.string().email()` becomes `z.email()` in Zod 4. `.strict()` on objects is now `z.strictObject()`.
**Why it happens:** Most online examples still show Zod 3 syntax.
**How to avoid:** Use Zod 4 API. Format validators are top-level: `z.email()`, `z.uuid()`. Object strictness: `z.strictObject({...})`. Error customization uses `error` param not `message`.
**Warning signs:** TypeScript errors on `.email()` method, runtime "not a function" errors.

### Pitfall 2: Neon Driver Choice Confusion
**What goes wrong:** Using `@neondatabase/serverless` with the WebSocket adapter when you need the HTTP adapter, or vice versa.
**Why it happens:** Neon offers both `neon()` (HTTP, one query per request) and `Pool()` (WebSocket, persistent connection). The HTTP driver is simpler for serverless.
**How to avoid:** Use `import { neon } from '@neondatabase/serverless'` with `drizzle-orm/neon-http`. This is the recommended pattern for Vercel serverless functions.
**Warning signs:** Connection timeout errors, "WebSocket is not defined" in edge runtime.

### Pitfall 3: Middleware Running in Edge Runtime
**What goes wrong:** Importing Node.js-only modules (bcryptjs, node:crypto) in middleware.ts which runs in Edge Runtime.
**Why it happens:** Middleware feels like "server code" but Next.js runs it at the edge by default.
**How to avoid:** Only use Edge-compatible libraries in middleware.ts. jose works in Edge. bcryptjs does NOT -- only use it in API route handlers (which run in Node.js runtime). Middleware should only verify JWTs, not hash passwords.
**Warning signs:** "Module not found: Can't resolve 'crypto'" errors in middleware.

### Pitfall 4: Seed Script Transaction Ordering
**What goes wrong:** Foreign key violations when seeding because tables are inserted in wrong order, or the seed script fails halfway leaving partial data.
**Why it happens:** The schema has circular-ish dependencies (users reference archetypes, progress references users AND nodes).
**How to avoid:** Seed in dependency order: archetypes -> users -> skill_nodes -> node_edges -> challenges -> user_node_mastery -> challenge_submissions. Wrap in a transaction or clear all tables first (delete in reverse order).
**Warning signs:** "violates foreign key constraint" errors during seeding.

### Pitfall 5: DAG Validation at the Wrong Layer
**What goes wrong:** Cycle detection implemented only in the admin UI (client-side), so direct API calls or seed scripts can create cycles.
**Why it happens:** Easier to validate in the UI than in the data layer.
**How to avoid:** Implement cycle detection as a utility function in `lib/` that is called by both the seed script and the API routes. Use topological sort -- if it fails, reject the edge.
**Warning signs:** Seed data with circular prerequisites, learners with permanently locked nodes.

### Pitfall 6: Forgetting to Hash Demo Passwords
**What goes wrong:** Seed script stores plaintext "demo1234" in passwordHash column.
**Why it happens:** Developer tests with plaintext comparison during dev, forgets to add bcrypt before shipping.
**How to avoid:** Hash passwords in the seed script: `await bcrypt.hash('demo1234', 10)`. Test by actually logging in with the login API.

## Code Examples

### Complete Drizzle Schema Pattern
```typescript
// db/schema.ts
import { pgTable, pgEnum, uuid, text, integer, real, timestamp, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['learner', 'mentor', 'admin']);
export const masteryLevelEnum = pgEnum('mastery_level', ['locked', 'novice', 'apprentice', 'journeyman', 'expert', 'master']);
export const challengeTypeEnum = pgEnum('challenge_type', ['quiz', 'project_submission']);

// Users
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name').notNull(),
  role: roleEnum('role').notNull().default('learner'),
  archetypeId: uuid('archetype_id').references(() => archetypes.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Archetypes
export const archetypes = pgTable('archetypes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),  // builder, analyst, explorer, collaborator
  description: text('description').notNull(),
  color: text('color').notNull(),         // hex color
  iconKey: text('icon_key').notNull(),    // maps to public/assets/icon-archetype-*.svg
});

// Skill Nodes
export const skillNodes = pgTable('skill_nodes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  iconKey: text('icon_key'),
  positionX: real('position_x').notNull(),
  positionY: real('position_y').notNull(),
  branchName: text('branch_name'),        // 'frontend', 'backend', 'devops', null for root
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Node Edges (prerequisite DAG)
export const nodeEdges = pgTable('node_edges', {
  id: uuid('id').defaultRandom().primaryKey(),
  sourceNodeId: uuid('source_node_id').notNull().references(() => skillNodes.id, { onDelete: 'cascade' }),
  targetNodeId: uuid('target_node_id').notNull().references(() => skillNodes.id, { onDelete: 'cascade' }),
  requiredMasteryLevel: masteryLevelEnum('required_mastery_level').notNull().default('novice'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Challenges
export const challenges = pgTable('challenges', {
  id: uuid('id').defaultRandom().primaryKey(),
  nodeId: uuid('node_id').notNull().references(() => skillNodes.id, { onDelete: 'cascade' }),
  masteryLevel: masteryLevelEnum('mastery_level').notNull(),
  type: challengeTypeEnum('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  content: jsonb('content'),              // quiz questions/answers as JSON
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User Node Mastery (learner progress)
export const userNodeMastery = pgTable('user_node_mastery', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  nodeId: uuid('node_id').notNull().references(() => skillNodes.id, { onDelete: 'cascade' }),
  currentLevel: masteryLevelEnum('current_level').notNull().default('novice'),
  xpCurrent: integer('xp_current').notNull().default(0),
  xpRequired: integer('xp_required').notNull().default(100),
  unlockedAt: timestamp('unlocked_at').defaultNow(),
  lastActivityAt: timestamp('last_activity_at').defaultNow(),
}, (table) => [
  uniqueIndex('user_node_unique').on(table.userId, table.nodeId),
]);

// Challenge Submissions
export const challengeSubmissions = pgTable('challenge_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  challengeId: uuid('challenge_id').notNull().references(() => challenges.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('pending'), // pending, passed, failed, in_review
  response: jsonb('response'),            // quiz answers or project submission link
  score: integer('score'),
  mentorId: uuid('mentor_id').references(() => users.id),
  feedback: text('feedback'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at'),
});
```

### Drizzle Config
```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Tailwind Design Tokens
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'void-black': '#0A0E17',
        'forge-gray': '#151A28',
        'anvil-gray': '#1E2438',
        'steel-edge': '#2A3150',
        'arcane-blue': '#4A7CFF',
        'ember-gold': '#F0A830',
        'forge-fire': '#FF6B35',
        'moonlight': '#E8ECF4',
        'mist': '#8892A8',
        'verdant': '#34D399',
        'amber-glow': '#FBBF24',
        'blood-ruby': '#EF4444',
        // Mastery colors
        'mastery-novice': 'rgba(74, 124, 255, 0.4)',
        'mastery-apprentice': '#4A7CFF',
        'mastery-journeyman': '#14B8A6',
        'mastery-expert': '#F0A830',
        'mastery-master': '#FFF7DB',
        // Archetype colors
        'archetype-builder': '#FF6B35',
        'archetype-analyst': '#38BDF8',
        'archetype-explorer': '#34D399',
        'archetype-collaborator': '#A78BFA',
      },
      fontFamily: {
        heading: ['var(--font-cinzel)', 'serif'],
        body: ['var(--font-ibm-plex-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### Font Loading in Root Layout
```typescript
// app/layout.tsx
import { Cinzel, IBM_Plex_Sans } from 'next/font/google';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-cinzel',
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-sans',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${ibmPlexSans.variable}`}>
      <body className="bg-void-black text-moonlight font-body">
        {children}
      </body>
    </html>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Zod 3 `z.string().email()` | Zod 4 `z.email()` | 2025 Q4 | Format validators are top-level functions |
| Zod 3 `.strict()` on objects | Zod 4 `z.strictObject()` | 2025 Q4 | Method moved to top-level |
| `reactflow` package | `@xyflow/react` package | 2024 (v12) | Rebranded under @xyflow scope |
| `drizzle-orm/neon-serverless` (WebSocket) | `drizzle-orm/neon-http` (HTTP) | Current best practice | HTTP adapter simpler for serverless, no WebSocket needed |
| NextAuth for all auth | jose + bcryptjs for simple demos | Always valid for demos | Avoid NextAuth overhead for password-only demo apps |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None yet -- greenfield project |
| Config file | none -- see Wave 0 |
| Quick run command | `npx tsx db/seed.ts` (validates schema + seed) |
| Full suite command | TBD after framework setup |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Signup creates user with hashed password | smoke | `curl -X POST /api/auth/register` | No -- Wave 0 |
| AUTH-02 | Login returns httpOnly cookie, persists | smoke | `curl -X POST /api/auth/login -c cookies.txt && curl /api/tree/nodes -b cookies.txt` | No -- Wave 0 |
| AUTH-03 | Logout clears session | smoke | `curl -X POST /api/auth/logout -b cookies.txt` | No -- Wave 0 |
| AUTH-04 | Role-based access enforced | smoke | Verify learner cannot access admin routes | No -- Wave 0 |
| DEMO-01 | Skill tree with 3 branches, ~15 nodes | smoke | `curl /api/tree/nodes \| jq length` (expect ~15) | No -- Wave 0 |
| DEMO-02 | 20 learners with varied progression | manual | Query DB after seed to verify learner states | No -- Wave 0 |
| DEMO-03 | 3 demo accounts can log in | smoke | Login with each demo email + demo1234 | No -- Wave 0 |
| DEMO-04 | Challenges seeded per node per level | smoke | `curl /api/tree/nodes \| jq '.[0].challenges'` or DB query | No -- Wave 0 |
| DEMO-05 | 4 archetypes distributed | manual | Query DB: SELECT archetype, COUNT(*) FROM users GROUP BY archetype | No -- Wave 0 |
| DSGN-01 | Dark RPG theme colors applied | manual | Visual check of rendered login page | No |
| DSGN-02 | Cinzel/IBM Plex Sans fonts loaded | manual | Visual check + DevTools font inspection | No |
| DSGN-03 | Pre-generated assets loaded | manual | Visual check of login page with hero-bg.png and logo.svg | No |

### Sampling Rate
- **Per task commit:** Verify schema pushes without errors, seed script runs clean
- **Per wave merge:** All demo accounts can log in, API returns tree data
- **Phase gate:** Full end-to-end: login -> see authenticated page -> API returns tree nodes

### Wave 0 Gaps
- [ ] No test framework installed -- for Phase 1, validation is via seed script success + curl/manual smoke tests
- [ ] Seed script doubles as integration test (it exercises all schema tables and relationships)
- [ ] Consider adding a simple `scripts/smoke-test.sh` that curls all API endpoints after deployment

## Open Questions

1. **Drizzle `push` vs `generate` + `migrate` for initial schema**
   - What we know: `drizzle-kit push` applies schema directly without migration files; `generate` + `migrate` creates versioned SQL files
   - Recommendation: Use `push` for initial development speed, switch to `generate` + `migrate` before production deploy. For a demo project, `push` is sufficient throughout.

2. **Neon connection string format**
   - What we know: Neon provides connection strings in format `postgresql://user:pass@host/db?sslmode=require`
   - What's unclear: Whether `?pgbouncer=true` suffix is needed with the HTTP driver (it's not -- that's for WebSocket pooling only)
   - Recommendation: Use the connection string as-is from Neon dashboard with the HTTP driver.

3. **Tailwind v4 CSS-first config vs JS config**
   - What we know: Tailwind 4 supports CSS-first configuration (`@theme` directive in CSS) as an alternative to `tailwind.config.ts`
   - Recommendation: Use the JS config file for now -- it's more familiar, easier to share color tokens with TypeScript code, and well-documented. CSS-first is newer and less battle-tested.

## Sources

### Primary (HIGH confidence)
- [Drizzle + Neon tutorial](https://orm.drizzle.team/docs/tutorials/drizzle-with-neon) - Connection setup, adapter choice
- [Drizzle pgEnum docs](https://orm.drizzle.team/docs/column-types/pg) - Enum syntax verified
- [Neon Drizzle guide](https://neon.com/docs/guides/drizzle) - Official Neon integration docs
- [Zod 4 migration guide](https://zod.dev/v4/changelog) - Breaking changes from v3
- npm registry - All package versions verified 2026-03-30

### Secondary (MEDIUM confidence)
- [Next.js JWT auth patterns 2026](https://www.authgear.com/post/nextjs-jwt-authentication) - Middleware + jose pattern
- [jose library](https://github.com/panva/jose) - Edge Runtime compatible JWT
- [drizzle-zod npm](https://www.npmjs.com/package/drizzle-zod) - Confirmed Zod 4 support via peerDependencies

### Tertiary (LOW confidence)
- None -- all findings verified with primary or secondary sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all versions verified via npm registry today
- Architecture: HIGH - patterns from official Drizzle/Neon/Next.js docs, cross-verified
- Pitfalls: HIGH - Zod 4 changes verified, Edge Runtime constraints well-documented
- Schema design: MEDIUM - based on CONTEXT.md decisions + Drizzle docs, exact column types at implementer discretion

**Research date:** 2026-03-30
**Valid until:** 2026-04-30 (stable stack, no fast-moving dependencies)
