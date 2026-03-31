# Phase 4: Role Views and Polish - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Mentor heatmap overlay, mentor challenge review, admin skill tree configuration, admin engagement analytics, and deployment. This phase completes the three-role experience.

</domain>

<decisions>
## Implementation Decisions

### Mentor Heatmap Overlay
- Toggle button in TopBar (visible only to mentors) switches between learner view and mentor heatmap
- Heatmap reuses the same React Flow canvas — overlays color-coded circles on each node based on cohort mastery
- API: GET /api/mentor/heatmap returns per-node aggregated mastery: { nodeId, totalLearners, avgMasteryIndex, stuckCount, breakdown: { locked: N, novice: N, ... } }
- Heatmap node colors: cold (blue = low avg mastery), warm (green = medium), hot (gold = high mastery), amber glow = stuck learners (3+ at same level for 3+ days)
- Clicking a node in heatmap mode shows learner breakdown instead of regular detail panel

### Mentor Challenge Review
- API: GET /api/mentor/reviews returns pending challengeSubmissions with user info and challenge details
- Review panel accessible from TopBar or as a sidebar/panel
- Shows: learner name, challenge title, submission content, approve/reject buttons
- API: POST /api/mentor/reviews/{id} with { action: 'approve' | 'reject', feedback?: string }
- Approved project submissions award XP (same formula as quiz: based on mastery level)

### Admin Node CRUD
- Admin view overlays the same skill tree canvas with edit controls
- Click a node → edit form (name, description, branch, position)
- Add node button → create new node at click position or default position
- Draw connections between nodes (or use form-based edge creation)
- API: POST/PUT/DELETE /api/admin/nodes, POST/DELETE /api/admin/edges
- For demo, keep it simple: form-based CRUD, not visual drag-and-drop

### Admin Challenge Management
- From node detail panel in admin mode: add/edit/delete challenges
- API: POST/PUT/DELETE /api/admin/challenges

### Admin Analytics
- Simple dashboard overlay or page
- API: GET /api/admin/analytics returns: totalLearners, activeThisWeek, avgMasteryPerNode, popularPaths (nodes sorted by learner count), dropOffNodes (high locked count relative to parent mastery)
- Visual: simple cards with numbers + a mini version of the heatmap

### Deployment
- Push to GitHub: fonn-claw/skillforge
- Deploy to Vercel at skillforge.demos.fonnit.com
- Set env vars: DATABASE_URL, SESSION_SECRET

### Claude's Discretion
- Exact heatmap color interpolation
- Admin form layouts
- Analytics chart choices
- Exact review panel positioning
</decisions>

<code_context>
## Existing Code

### Reusable
- SkillTreeFlow.tsx — same canvas for all roles, just change overlay/behavior
- TopBar.tsx — already shows role, can add role-specific buttons
- NodeDetailPanel.tsx — can be extended for mentor/admin views
- tree-utils.ts — MASTERY_ORDER useful for aggregation

### Integration Points
- Middleware sets x-user-role header — use for API authorization
- TopBar fetches /api/auth/me which includes role
- Role switching happens at the component level (conditional rendering)
</code_context>

---
*Phase: 04-role-views-polish*
*Context gathered: 2026-03-31*
