# Feature Research

**Domain:** Learning Gamification & Skill Progression
**Researched:** 2026-03-30
**Confidence:** MEDIUM (based on training data analysis of Duolingo, Khan Academy, Codecademy, Treehouse, Pluralsight, Path of Exile skill trees, and edtech gamification research; no live web search available)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Authentication with role-based access** | Every platform has login; roles (learner/mentor/admin) are fundamental to multi-user education tools | LOW | Email/password sufficient for v1. 3 roles: learner, mentor, admin. Use session-based auth with hashed passwords. |
| **Interactive skill tree visualization** | This IS the product. A learning gamification platform without a visual, navigable skill tree is just another LMS with badges bolted on. Duolingo has its path, Khan Academy has its mastery map. | HIGH | React Flow for zoom/pan/custom nodes. Hexagonal nodes per design spec. This is the single hardest feature and must be excellent. |
| **Node detail view with skill info** | Clicking a node and seeing nothing useful is a dead end. Users expect description, current level, prerequisites, and available actions. | MEDIUM | Floating panel (400px right slide-in per design spec). Must load fast since it is the primary action surface. |
| **Prerequisite-based unlocking** | Skill trees without gating are just flat lists with lines drawn between them. Prerequisites create the "tree" in skill tree. Users of any RPG or tech tree expect locked/unlocked states. | MEDIUM | Graph traversal logic in DB. When a node reaches required mastery level, downstream nodes unlock. Must handle circular dependency prevention in admin. |
| **Mastery levels per node** | Binary done/not-done is what SkillForge exists to replace. Multi-level mastery (Novice through Master) is the core depth mechanic. Duolingo has crown levels, Khan has mastery. | MEDIUM | 5 levels: Novice, Apprentice, Journeyman, Expert, Master. Each needs distinct visual treatment (glow intensity per design spec). Challenges gate level progression. |
| **Challenge/assessment system** | Without challenges, there is no way to advance mastery. Learners need concrete actions to take. Every learning platform has some form of assessment. | HIGH | Multiple types: quiz (multiple choice), code exercise (text input evaluated), project submission (file/link upload for review), peer review. Quiz is simplest, project submission requires mentor review workflow. |
| **Progress persistence** | Users expect to close the browser and return to their exact state. Losing progress is an instant uninstall. | LOW | All progress stored in Postgres. Node mastery levels, challenge completions, archetype assignment. Straightforward CRUD. |
| **Responsive design** | Users will try it on tablets and phones. A broken mobile experience looks amateur even for a demo. | MEDIUM | The full skill tree canvas works poorly on small screens. Mobile needs a simplified tree view or node-list fallback. Touch zoom/pan must work. |
| **Demo data with realistic state** | This is a demo product. Without seeded data showing the system in action (learners at various stages, pending reviews, skill gaps), evaluators see an empty shell. | MEDIUM | 20 learners, 2 mentors, 1 admin. CodeForge Academy web dev tree with 3 branches. Must show variety: advanced learner, beginner, stuck learners, pending reviews. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Learner archetype system** | Identity investment before learning begins. "I'm a Builder" creates psychological ownership that generic platforms lack. Duolingo does not do this. No mainstream edtech does archetypes well. | MEDIUM | 4 archetypes: Builder, Analyst, Explorer, Collaborator. 5-7 question quiz with visual card answers. Character-creation-style reveal is the hook. Archetype should influence recommended path order or challenge type emphasis. |
| **RPG-inspired visual design** | Every competitor looks like a corporate LMS or a children's app. An atmospheric, dark-themed, forge-inspired aesthetic with glowing nodes and particle effects stands out immediately. Most edtech uses light mode with progress bars. | HIGH | This is primarily a design/CSS/animation effort, not a logic effort. But getting particle effects, glow animations, and the "enchanted forge" feel right requires significant polish time. |
| **Mentor heatmap overlay** | Mentors typically get a table of student scores. A heatmap ON the skill tree lets mentors see cohort health spatially — "the Database cluster is cold" is instantly visible. This is genuinely novel in edtech. | MEDIUM | Same tree canvas with a color overlay based on aggregated learner mastery per node. Clicking a node shows learner breakdown. Requires aggregation queries but the visualization piggybacks on the existing tree renderer. |
| **Unlock animation flow** | The moment energy flows from a completed node to a newly unlocked node is the "reward moment" that keeps learners coming back. Most platforms show a static checkmark. This creates the Duolingo-like dopamine hit via spatial, visible progress. | MEDIUM | CSS/SVG animation along connection paths (800ms per design spec). Destination node transitions from locked to novice state. This is the emotional payoff of the entire product. |
| **Node mastery pulse and particles** | Mastered nodes that glow and emit particles make the tree feel alive. A static tree is a diagram; a breathing tree is a world. This is what makes it feel like an RPG skill screen, not a flowchart. | LOW | CSS keyframe animations for pulse (3s cycle). Canvas or CSS particles for Expert/Master nodes. Can be added incrementally — start with pulse, add particles later. |
| **Minimap navigation** | Large skill trees need spatial orientation. An RTS-style minimap (like StarCraft or Factorio) lets learners see the full tree and their viewport position. No edtech platform does this. | LOW | React Flow has minimap support built in. Configuration, not custom development. Small effort, big UX payoff for large trees. |
| **Admin tree configuration** | Most gamification is hardcoded. Letting admins visually edit the tree (add nodes, draw connections, set prerequisites) makes the platform configurable for any domain, not just the demo. | HIGH | Drag-and-drop node creation, connection drawing, mastery criteria editing. This is essentially a graph editor — complex UI but the design spec calls for it as an overlay on the existing canvas. |
| **Engagement analytics for admins** | Knowing which paths are popular vs. where learners drop off lets platform owners iterate on content. Standard in mature edtech but rare in gamification-first tools. | MEDIUM | Aggregated queries: path popularity, drop-off nodes, average time-to-mastery per node, active vs. churned learners. Dashboard-style overlay or separate admin panel. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Leaderboards / competitive rankings** | "Gamification means competition!" | Research consistently shows leaderboards discourage bottom-50% learners. Those who need motivation most are demoralized by seeing how far behind they are. Duolingo uses them but also sees massive churn from league anxiety. | Show personal progress velocity ("You mastered 3 nodes this week") and peer comparison without explicit ranking ("Learners like you also explored Backend next"). |
| **Streak mechanics** | Duolingo's most famous feature | Streaks create anxiety-driven engagement, not intrinsic motivation. They punish absence (life happens) and create resentment. A missed day feels like failure. For skill progression (which is deeper than daily language drills), streaks are counterproductive. | Show "last active" and "total time invested" as non-judgmental engagement signals. Celebrate returns ("Welcome back! You left off at React State Management.") |
| **Content authoring / course builder** | "We need to create the learning content too" | Scope explosion. SkillForge is the gamification LAYER, not a course platform. Building a content CMS doubles the project scope and competes with established tools (Teachable, Thinkific, etc.). | Challenges reference external content via URLs. Skill nodes have descriptions and links to external resources. The platform wraps around content, it does not host it. |
| **Real-time multiplayer / collaborative challenges** | "Learning is social!" | WebSocket infrastructure, presence management, conflict resolution, synchronization. Massive complexity for marginal value in an asynchronous skill progression context. | Peer review challenges (asynchronous). Social proof via "X learners also mastered this node." Cohort progress visible to mentors. |
| **AI-generated personalized learning paths** | "AI can optimize the path for each learner" | Requires ML infrastructure, training data, and creates a black box that undermines the agency the skill tree provides. If the AI tells you what to learn next, the tree becomes decoration. | Archetype-based recommendations ("As a Builder, you might enjoy the Frontend branch"). Prerequisite logic already creates structure. Let learners choose. |
| **Badges/achievements for everything** | "More gamification = better" | Badge fatigue. When everything earns a badge, nothing feels meaningful. Most edtech platforms have 50+ meaningless badges that users ignore after the first week. | Mastery levels ARE the achievement. 5 levels per node is inherently meaningful because it represents actual skill depth. Reserve special badges for genuinely hard accomplishments (e.g., "Mastered all nodes in a branch"). |
| **Video hosting or embedded video player** | "Learners need video content" | Storage, transcoding, streaming infrastructure. Not the product's purpose. | Link to external video resources. Embed YouTube/Vimeo iframes at most. The tree is the experience, not a media player. |
| **Mobile native app** | "Everyone uses mobile" | Two codebases, app store review processes, push notification infrastructure. For a demo/v1, web responsive is sufficient. | Responsive web design. Touch-friendly zoom/pan on the skill tree. Progressive enhancement for mobile (simplified tree view if needed). |

## Feature Dependencies

```
[Authentication]
    |
    +--requires--> [Skill Tree Visualization]
    |                  |
    |                  +--requires--> [Node Detail Panel]
    |                  |                  |
    |                  |                  +--requires--> [Challenge System]
    |                  |                                     |
    |                  |                                     +--requires--> [Mastery Level Progression]
    |                  |                                     |
    |                  |                                     +--requires--> [Mentor Challenge Review]
    |                  |
    |                  +--requires--> [Prerequisite Unlocking]
    |                  |                  |
    |                  |                  +--requires--> [Unlock Animations]
    |                  |
    |                  +--enhances--> [Minimap]
    |                  +--enhances--> [Node Mastery Pulse/Particles]
    |
    +--requires--> [Archetype Quiz]
    |                  |
    |                  +--enhances--> [Skill Tree] (archetype-colored starting experience)
    |
    +--requires--> [Mentor Heatmap Overlay]
    |                  |
    |                  +--requires--> [Skill Tree Visualization]
    |                  +--requires--> [Mastery Level Data]
    |
    +--requires--> [Admin Tree Configuration]
    |                  |
    |                  +--requires--> [Skill Tree Visualization]
    |                  +--requires--> [Node/Edge CRUD]

[Demo Data Seeding]
    +--requires--> [Database Schema]
    +--requires--> [Authentication]
    +--requires--> [Skill Tree Data Model]
```

### Dependency Notes

- **Challenge System requires Node Detail Panel:** Challenges are launched from the node detail view; without the panel, there is no UI surface for challenges.
- **Mastery Level Progression requires Challenge System:** Leveling up a node is gated by completing challenges at the current level. No challenges = no progression.
- **Mentor Heatmap requires both Tree Visualization and Mastery Data:** The heatmap overlays aggregated mastery data onto the existing tree canvas. Both must exist first.
- **Unlock Animations require Prerequisite Unlocking:** You can only animate an unlock if the prerequisite logic exists to trigger it.
- **Admin Tree Configuration requires Tree Visualization:** Admin edits the same canvas learners see, but in edit mode. The canvas must exist first.
- **Archetype Quiz enhances but does not block Tree:** A learner could theoretically see the tree without an archetype, but the quiz should gate first access for the intended experience.

## MVP Definition

### Launch With (v1)

Minimum viable product -- what is needed to validate the concept.

- [x] **Authentication with 3 roles** -- foundation for everything; gates access to correct views
- [x] **Database schema and seed data** -- the demo must show a populated, living system
- [x] **Interactive skill tree canvas** -- the entire product thesis; if this is not excellent, nothing else matters
- [x] **Hexagonal nodes with mastery-level visuals** -- nodes must communicate state (locked, novice, master) at a glance
- [x] **Node detail panel** -- the primary action surface where learners see info and launch challenges
- [x] **Prerequisite-based node unlocking** -- creates the "tree" structure; without gating, it is a flat graph
- [x] **Challenge system (quiz type at minimum)** -- learners need something to DO; quiz is simplest to implement
- [x] **Mastery level progression** -- completing challenges advances mastery; this is the core loop
- [x] **Archetype quiz with reveal** -- the onboarding hook; creates identity investment before tree exploration
- [x] **Unlock and mastery animations** -- the emotional reward; without this, progression feels clinical
- [x] **Mentor heatmap overlay** -- demonstrates the multi-role value proposition
- [x] **Mentor challenge review** -- mentors need to validate submissions; closes the challenge loop
- [x] **Admin tree configuration** -- shows the platform is configurable, not hardcoded
- [x] **Minimap** -- trivial with React Flow; big spatial navigation payoff

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] **Project submission challenges** -- requires file/link upload and review workflow; more complex than quiz
- [ ] **Peer review challenges** -- requires matching learners and review rubrics
- [ ] **Engagement analytics dashboard for admin** -- aggregated queries on path popularity, drop-off nodes
- [ ] **Archetype-influenced recommendations** -- "As a Builder, try Frontend next" suggestions on the tree
- [ ] **Code exercise challenges** -- requires a code execution sandbox or at minimum a code editor with test validation

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **OAuth / social login** -- convenience feature, not core value
- [ ] **Email notifications** -- "You have a challenge to review" nudges
- [ ] **API for external content integration** -- let LMS platforms push content into the tree
- [ ] **Learner-to-learner messaging** -- social features beyond peer review
- [ ] **Custom archetype creation for admins** -- beyond the 4 defaults
- [ ] **Tree templates / marketplace** -- pre-built skill trees for common domains

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Skill tree canvas (zoom, pan, render) | HIGH | HIGH | P1 |
| Hexagonal nodes with mastery visuals | HIGH | MEDIUM | P1 |
| Authentication + roles | HIGH | LOW | P1 |
| Database schema + seed data | HIGH | MEDIUM | P1 |
| Node detail panel | HIGH | MEDIUM | P1 |
| Prerequisite unlocking logic | HIGH | MEDIUM | P1 |
| Challenge system (quiz) | HIGH | MEDIUM | P1 |
| Mastery level progression | HIGH | LOW | P1 |
| Archetype quiz + reveal | HIGH | MEDIUM | P1 |
| Unlock animations | MEDIUM | MEDIUM | P1 |
| Node mastery pulse/glow | MEDIUM | LOW | P1 |
| Minimap | MEDIUM | LOW | P1 |
| Mentor heatmap overlay | MEDIUM | MEDIUM | P1 |
| Mentor challenge review | MEDIUM | MEDIUM | P1 |
| Admin tree config (CRUD) | MEDIUM | HIGH | P1 |
| Engagement analytics | LOW | MEDIUM | P2 |
| Project submission challenges | MEDIUM | HIGH | P2 |
| Archetype recommendations | LOW | LOW | P2 |
| Peer review challenges | LOW | HIGH | P3 |
| Code exercise challenges | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch (the brief requires all three roles to be functional with demo data)
- P2: Should have, add if time permits in session
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Duolingo | Khan Academy | Codecademy | Treehouse | SkillForge Approach |
|---------|----------|--------------|------------|-----------|---------------------|
| Visual progression | Linear path with nodes | Mastery map (grid) | Linear syllabus | Linear badges | Branching spatial tree (RPG-style) |
| Mastery depth | Crown levels (1-5) | Mastery levels (3) | Completion % | Completion only | 5 mastery levels per node |
| Learner identity | None | None | None | None | Archetype system (4 types) |
| Gamification core | Streaks, XP, leagues | Points, badges | Streaks, badges | Points, badges | Skill tree IS the gamification |
| Non-linear paths | No (strictly linear) | Partially (some choice) | No | No | Yes (branching prerequisite graph) |
| Mentor tools | None (self-service) | Teacher dashboard (table) | None | None | Heatmap overlay on tree |
| Visual polish | Bright, cartoon | Clean, corporate | Dark, minimal | Clean, corporate | RPG atmospheric, forge-themed |
| Applied challenges | Translation exercises | Math exercises | Code exercises | Video + quizzes | Multiple types including project submission |
| Spatial navigation | No | No | No | No | Yes (zoom, pan, minimap) |

**Key insight:** No mainstream platform combines visual skill tree navigation with multi-level mastery and archetype identity. Most treat gamification as decoration (badges, points, streaks) rather than the core interaction model. SkillForge's differentiation is that the gamification IS the product, not a feature of the product.

## Sources

- Training data analysis of Duolingo (gamification mechanics, streak system, crown levels, league system)
- Training data analysis of Khan Academy (mastery system, teacher tools, course map)
- Training data analysis of Codecademy (career paths, streak system, code exercises)
- Training data analysis of Path of Exile passive skill tree (RPG skill tree UX patterns)
- Training data on gamification research (leaderboard effects on motivation, badge fatigue, intrinsic vs. extrinsic motivation)
- Project BRIEF.md and DESIGN-SPEC.md (domain requirements and visual identity)

**Confidence note:** All competitor analysis is based on training data (cutoff ~May 2025). These platforms may have shipped new features since then. The gamification research findings (leaderboard demotivation, streak anxiety, badge fatigue) are well-established in academic literature and unlikely to have changed. Web search was unavailable for verification.

---
*Feature research for: Learning Gamification & Skill Progression*
*Researched: 2026-03-30*
