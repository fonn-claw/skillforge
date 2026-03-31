# Requirements: SkillForge

**Defined:** 2026-03-30
**Core Value:** The interactive skill tree IS the experience -- a full-canvas, zoomable graph where learners spatially navigate their knowledge landscape with RPG-inspired visual feedback.

## v1 Requirements

### Authentication

- [x] **AUTH-01**: User can sign up with email and password
- [x] **AUTH-02**: User can log in and maintain session across browser refresh
- [x] **AUTH-03**: User can log out from any screen
- [x] **AUTH-04**: System enforces role-based access (learner, mentor, admin) with appropriate view switching

### Skill Tree Visualization

- [ ] **TREE-01**: Learner sees full-canvas interactive skill tree with hexagonal nodes and curved connection lines
- [ ] **TREE-02**: Learner can zoom and pan the skill tree canvas
- [ ] **TREE-03**: Skill tree displays node mastery state visually (locked=dim/dashed, novice=faint blue, apprentice=blue, journeyman=teal, expert=gold, master=white-gold)
- [ ] **TREE-04**: Connection lines animate with gradient flow when prerequisites are met
- [ ] **TREE-05**: Minimap shows full tree with current viewport highlighted (bottom-left)
- [ ] **TREE-06**: Mastered nodes emit slow rhythmic pulse in their mastery color
- [ ] **TREE-07**: Top bar displays archetype badge, progress counter, and user avatar (48px, semi-transparent)

### Node Interaction

- [ ] **NODE-01**: Clicking a node opens a floating detail panel (400px, slides from right)
- [ ] **NODE-02**: Detail panel shows skill name, mastery level badge, description, prerequisites with check/lock status
- [ ] **NODE-03**: Detail panel shows available challenges as stacked clickable cards
- [ ] **NODE-04**: Mastery progress displayed as 5 rune-like step indicators (not a progress bar)
- [ ] **NODE-05**: Hovering a node shows tooltip with skill name and current level

### Prerequisite System

- [ ] **PREREQ-01**: Nodes unlock when all prerequisite nodes reach required mastery level
- [ ] **PREREQ-02**: Unlocking a node triggers animated energy flow along connection from parent to child (800ms)
- [ ] **PREREQ-03**: Newly unlocked node transitions from locked to novice state with brief flash
- [ ] **PREREQ-04**: Locked nodes display with desaturated color, dashed border, and lock icon overlay

### Challenge System

- [ ] **CHAL-01**: Learner can start a quiz challenge from the node detail panel
- [ ] **CHAL-02**: Quiz challenges present multiple-choice questions with immediate feedback
- [ ] **CHAL-03**: Completing a challenge awards mastery XP toward next level
- [ ] **CHAL-04**: Challenges increase in difficulty with mastery level (mechanically distinct per level, not just harder questions)
- [ ] **CHAL-05**: Learner can submit project challenges (link/description) for mentor review

### Mastery Progression

- [ ] **MAST-01**: Each node has 5 mastery levels: Novice, Apprentice, Journeyman, Expert, Master
- [ ] **MAST-02**: Completing level-appropriate challenges advances mastery toward next level
- [ ] **MAST-03**: Node visual intensity (glow, size, border color) updates in real-time as mastery advances
- [ ] **MAST-04**: Expert and Master nodes display particle effects (embers drifting upward)

### Archetype System

- [ ] **ARCH-01**: New learner takes 5-7 question archetype quiz with visual card answers (not radio buttons)
- [ ] **ARCH-02**: Quiz presented one question at a time with smooth transitions on dark atmospheric background
- [ ] **ARCH-03**: After final question, archetype reveal with converging particles, icon, color, and description
- [ ] **ARCH-04**: Four archetypes: Builder (forge orange), Analyst (crystal blue), Explorer (verdant green), Collaborator (royal purple)
- [ ] **ARCH-05**: Archetype badge displayed in top bar and learner profile

### Mentor Features

- [ ] **MENT-01**: Mentor sees skill tree with heatmap overlay showing cohort mastery levels per node
- [ ] **MENT-02**: Clicking a node in mentor view shows learner breakdown (who's at what level, who's stuck)
- [ ] **MENT-03**: Mentor can review and approve/reject submitted challenge responses
- [ ] **MENT-04**: Stuck learners highlighted in amber on the heatmap overlay

### Admin Features

- [ ] **ADMN-01**: Admin can add new skill nodes to the tree with name, description, and position
- [ ] **ADMN-02**: Admin can create/remove prerequisite connections between nodes
- [ ] **ADMN-03**: Admin can define mastery criteria and challenges for each node
- [ ] **ADMN-04**: Admin sees engagement analytics: popular paths, drop-off nodes, learner counts per mastery level

### Demo Data

- [ ] **DEMO-01**: CodeForge Academy with web dev skill tree: 3 branches (Frontend, Backend, DevOps), ~15 nodes
- [ ] **DEMO-02**: 20 learners at various progression points including 1 advanced (Expert React), 1 beginner, 3 stuck on Database
- [ ] **DEMO-03**: 3 demo accounts: learner@skillforge.app, mentor@skillforge.app, admin@skillforge.app (all password: demo1234)
- [ ] **DEMO-04**: Pre-populated challenges with quiz questions for each node at each mastery level
- [ ] **DEMO-05**: 4 learner archetypes represented across demo learners

### Visual Design

- [x] **DSGN-01**: Dark RPG-inspired theme using design spec colors (Void Black #0A0E17 background, Forge Gray panels, Arcane Blue primary)
- [x] **DSGN-02**: Cinzel font for headings/skill names, IBM Plex Sans for body text
- [x] **DSGN-03**: All pre-generated assets from public/assets/ used as documented (logos, node icons, archetype portraits, backgrounds)
- [ ] **DSGN-04**: Responsive design that works on desktop and tablet viewports

## v2 Requirements

### Enhanced Challenges

- **CHAL-V2-01**: Code exercise challenges with inline code editor
- **CHAL-V2-02**: Peer review challenges matching learners for mutual assessment

### Enhanced Analytics

- **ANAL-V2-01**: Admin dashboard with time-to-mastery metrics per node
- **ANAL-V2-02**: Path popularity visualization overlaid on tree

### Enhanced Social

- **SOCL-V2-01**: Archetype-based path recommendations ("As a Builder, try Frontend next")
- **SOCL-V2-02**: Learner profile pages with skill radar chart

## Out of Scope

| Feature | Reason |
|---------|--------|
| Video hosting / content authoring | SkillForge is the gamification layer, not a course platform |
| Real-time chat / messaging | Not needed for skill progression, adds WebSocket complexity |
| Payment / subscription system | Not part of v1 demo |
| Mobile native app | Responsive web sufficient for demo |
| Email notifications | Not needed for demo scenario |
| OAuth / social login | Email/password sufficient for v1 |
| Leaderboards / rankings | Research shows they demotivate bottom-50% learners |
| Streak mechanics | Creates anxiety-driven engagement, not intrinsic motivation |
| AI-generated learning paths | Undermines learner agency that the skill tree provides |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| TREE-01 | Phase 2 | Pending |
| TREE-02 | Phase 2 | Pending |
| TREE-03 | Phase 2 | Pending |
| TREE-04 | Phase 2 | Pending |
| TREE-05 | Phase 2 | Pending |
| TREE-06 | Phase 2 | Pending |
| TREE-07 | Phase 2 | Pending |
| NODE-01 | Phase 2 | Pending |
| NODE-02 | Phase 2 | Pending |
| NODE-03 | Phase 2 | Pending |
| NODE-04 | Phase 2 | Pending |
| NODE-05 | Phase 2 | Pending |
| PREREQ-01 | Phase 2 | Pending |
| PREREQ-02 | Phase 2 | Pending |
| PREREQ-03 | Phase 2 | Pending |
| PREREQ-04 | Phase 2 | Pending |
| CHAL-01 | Phase 3 | Pending |
| CHAL-02 | Phase 3 | Pending |
| CHAL-03 | Phase 3 | Pending |
| CHAL-04 | Phase 3 | Pending |
| CHAL-05 | Phase 3 | Pending |
| MAST-01 | Phase 3 | Pending |
| MAST-02 | Phase 3 | Pending |
| MAST-03 | Phase 3 | Pending |
| MAST-04 | Phase 3 | Pending |
| ARCH-01 | Phase 3 | Pending |
| ARCH-02 | Phase 3 | Pending |
| ARCH-03 | Phase 3 | Pending |
| ARCH-04 | Phase 3 | Pending |
| ARCH-05 | Phase 3 | Pending |
| MENT-01 | Phase 4 | Pending |
| MENT-02 | Phase 4 | Pending |
| MENT-03 | Phase 4 | Pending |
| MENT-04 | Phase 4 | Pending |
| ADMN-01 | Phase 4 | Pending |
| ADMN-02 | Phase 4 | Pending |
| ADMN-03 | Phase 4 | Pending |
| ADMN-04 | Phase 4 | Pending |
| DEMO-01 | Phase 1 | Pending |
| DEMO-02 | Phase 1 | Pending |
| DEMO-03 | Phase 1 | Pending |
| DEMO-04 | Phase 1 | Pending |
| DEMO-05 | Phase 1 | Pending |
| DSGN-01 | Phase 1 | Complete |
| DSGN-02 | Phase 1 | Complete |
| DSGN-03 | Phase 1 | Complete |
| DSGN-04 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 42 total
- Mapped to phases: 42
- Unmapped: 0

---
*Requirements defined: 2026-03-30*
*Last updated: 2026-03-30 after roadmap creation*
