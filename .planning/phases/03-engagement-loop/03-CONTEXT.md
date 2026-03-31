# Phase 3: Engagement Loop - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Archetype discovery quiz, challenge execution system (quiz + project submission), and mastery XP progression. This is the gameplay loop: learners discover their identity, complete challenges to earn XP, level up mastery, and see the tree respond visually.

</domain>

<decisions>
## Implementation Decisions

### Archetype Quiz
- New route: app/(authenticated)/archetype-quiz/page.tsx — full-screen dark atmospheric page
- 5-7 questions, each with 4 visual card answers (one per archetype: Builder/Analyst/Explorer/Collaborator)
- One question at a time with framer-motion AnimatePresence transitions
- Background: quiz-bg.png from public/assets/
- Each answer adds a point to the corresponding archetype; highest wins
- Tie-breaking: first archetype with highest score wins
- Reveal screen: converging particle CSS animation, large archetype icon from public/assets/archetype-{name}.png, color, description
- API: POST /api/archetype/submit — saves archetypeId to user record
- After reveal: redirect to skill tree (home page)
- Middleware should redirect learners without an archetype to the quiz page

### Challenge Execution (Quiz Type)
- Modal overlay on the skill tree canvas (not a new page)
- Launches from challenge card click in NodeDetailPanel
- Quiz questions loaded from challenge.content JSONB field: { questions: [{ question, options: string[], correctIndex: number }] }
- One question at a time, multiple choice with visual card selection
- Immediate feedback: correct=green flash, incorrect=red flash + show correct answer
- Score calculated as percentage of correct answers
- API: POST /api/challenges/{id}/submit — validates answers, awards XP, returns result
- XP formula: (score * challenge_xp_value). Each challenge awards XP based on mastery level (novice: 25xp, apprentice: 35xp, journeyman: 50xp, expert: 75xp, master: 100xp)
- After quiz: show results screen with score, XP earned, and mastery progress update

### Challenge Execution (Project Submission)
- Same modal system as quiz
- Learner submits a text description + optional URL link
- API: POST /api/challenges/{id}/submit — creates challengeSubmission record with status 'pending'
- No immediate XP — requires mentor review (Phase 4)
- Show "Submitted for review" confirmation

### Mastery Progression
- When XP crosses threshold (xpCurrent >= xpRequired), advance currentLevel to next in MASTERY_ORDER
- Reset xpCurrent to 0, set new xpRequired (increases per level: novice→100, apprentice→200, journeyman→350, expert→500, master→750)
- API updates userNodeMastery record in-place
- After mastery change: refetch tree data so SkillTreeFlow re-renders with new mastery state
- The unlock animation infrastructure from Phase 2 handles visual transitions automatically

### Real-time Tree Updates
- After challenge completion with XP gain: call a refreshTree() callback that re-fetches /api/tree/nodes and /api/tree/edges
- SkillTreeFlow needs to expose this refresh mechanism (e.g., a refetch function via context or callback)
- The Phase 2 unlock animation logic (prevLockMapRef) will detect newly unlocked nodes

### Claude's Discretion
- Exact quiz question content and wording
- Framer-motion transition details for quiz cards
- Exact modal overlay styling
- Whether to use a React context or prop drilling for refresh callback
- Score display layout
</decisions>

<canonical_refs>
## Canonical References

### From Phase 2
- `components/tree/NodeDetailPanel.tsx` — Challenge cards are rendered here; clicking them should open the challenge modal
- `components/tree/SkillTreeFlow.tsx` — TreeSelectionContext, refetch mechanism needed
- `components/tree/TopBar.tsx` — Shows archetype badge; will auto-update after quiz
- `lib/tree-utils.ts` — MASTERY_ORDER, computeNodeUnlockStatus

### Data Layer
- `db/schema.ts` — challenges (content JSONB), challengeSubmissions, userNodeMastery, users.archetypeId, archetypes
- `app/api/tree/nodes/[id]/challenges/route.ts` — Returns challenge list (no content field)

### Assets
- `public/assets/quiz-bg.png` — Background for archetype quiz
- `public/assets/archetype-{builder,analyst,explorer,collaborator}.png` — Large archetype reveal portraits
- `public/assets/icon-archetype-{builder,analyst,explorer,collaborator}.svg` — Archetype icons

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable
- NodeDetailPanel challenge cards already rendered; need onClick handler
- SkillTreeFlow has prevLockMapRef for unlock animation — just needs data refetch
- TopBar fetches /api/auth/me which includes archetype — auto-updates on page load
- MasterySteps component ready for reuse in results screen

### Integration Points
- Challenge modal triggered from NodeDetailPanel challenge card click
- Archetype quiz redirects to skill tree after completion
- Mastery XP update triggers tree data refresh
- Middleware needs update: redirect learners without archetype to quiz

</code_context>

<specifics>
## Specific Ideas

- The archetype quiz should feel like a character creation screen — atmospheric, weighty, not a quick form
- Quiz reveal is the second most important emotional moment after node unlock
- Challenge completion with mastery level-up should chain into the unlock animation if prerequisites are now met
- Keep the challenge modal dark and consistent with the forge aesthetic

</specifics>

<deferred>
## Deferred Ideas

None
</deferred>

---
*Phase: 03-engagement-loop*
*Context gathered: 2026-03-31*
