---
phase: 44
slug: test-date-countdown-and-study-plan
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-01
---

# Phase 44 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (via vitest.config.ts) |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `pnpm vitest run src/lib/studyPlan/ -x` |
| **Full suite command** | `pnpm test:run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm vitest run src/lib/studyPlan/ -x`
- **After every plan wave:** Run `pnpm test:run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 44-01-01 | 01 | 1 | RDNS-07 | unit | `pnpm vitest run src/hooks/useTestDate.test.ts -x` | ❌ W0 | ⬜ pending |
| 44-01-02 | 01 | 1 | RDNS-08 | unit | `pnpm vitest run src/lib/studyPlan/studyPlanEngine.test.ts -x` | ❌ W0 | ⬜ pending |
| 44-01-03 | 01 | 1 | RDNS-09 | unit | `pnpm vitest run src/lib/studyPlan/studyPlanEngine.test.ts -x` | ❌ W0 | ⬜ pending |
| 44-01-04 | 01 | 1 | RDNS-10 | unit | `pnpm vitest run src/lib/studyPlan/studyPlanEngine.test.ts -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/studyPlan/studyPlanEngine.test.ts` — stubs for RDNS-08, RDNS-09, RDNS-10 (pure function unit tests)
- [ ] `src/hooks/useTestDate.test.ts` — stubs for RDNS-07 (localStorage persistence)

*Existing infrastructure covers framework installation — Vitest already configured and working.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Urgency gradient color transitions (green → amber → red) | RDNS-08 | Visual rendering | Set test dates at 30+, 14, 7, 3 days out; verify color shifts |
| Post-test "How did it go?" prompt | RDNS-08 | Interactive flow | Set test date to yesterday; open Dashboard; verify prompt appears |
| Checkmark animation on daily completion | RDNS-09 | Animation visual | Complete all daily targets; verify checkmark animation renders |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
