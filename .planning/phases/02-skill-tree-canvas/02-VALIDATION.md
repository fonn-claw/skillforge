---
phase: 2
slug: skill-tree-canvas
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-31
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + build verification |
| **Config file** | vitest.config.ts (from Phase 1) |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build`
- **Before `/gsd:verify-work`:** Full build must succeed
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | TREE-01, TREE-02, TREE-03 | build | `npm run build` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | TREE-04, TREE-05, TREE-06, TREE-07 | build | `npm run build` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | NODE-01, NODE-02, NODE-03, NODE-04, NODE-05 | build | `npm run build` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | PREREQ-01, PREREQ-02, PREREQ-03, PREREQ-04, DSGN-04 | build | `npm run build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing vitest + build infrastructure from Phase 1 covers this phase

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Hexagonal nodes render with correct mastery colors | TREE-03 | Visual verification | Open tree, verify locked nodes are dim, mastered nodes glow |
| Connection lines animate on prerequisite met | TREE-04 | Animation verification | Check active connections show flowing gradient |
| Minimap shows viewport indicator | TREE-05 | Visual verification | Zoom/pan and verify minimap tracks viewport |
| Node detail panel slides in from right | NODE-01 | Interaction verification | Click a node, verify 400px panel slides in |
| Tree is responsive on tablet | DSGN-04 | Device verification | Open on tablet viewport, verify zoom/pan works |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
