---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-30
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts (Wave 0 installs) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | DSGN-01, DSGN-02, DSGN-03 | build | `npm run build` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | AUTH-01 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | AUTH-02, AUTH-04 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 1 | AUTH-03 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 2 | DEMO-01 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 2 | DEMO-02, DEMO-03, DEMO-04, DEMO-05 | seed | `npm run seed` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest` + `@testing-library/react` — install test framework
- [ ] `vitest.config.ts` — configure vitest for Next.js
- [ ] Test infrastructure will be set up as part of project scaffolding

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dark RPG theme renders correctly | DSGN-01 | Visual verification | Open app, verify Void Black background, Forge Gray panels |
| Cinzel + IBM Plex Sans fonts load | DSGN-02 | Visual verification | Inspect heading and body text fonts in browser DevTools |
| Pre-generated assets display | DSGN-03 | Visual verification | Check logo, favicon, and node icons render in browser |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
