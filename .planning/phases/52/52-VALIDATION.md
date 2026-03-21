---
phase: 52
slug: e2e-critical-flows-accessibility
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-21
---

# Phase 52 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework (E2E)** | Playwright 1.58.2 |
| **Framework (Unit/A11Y)** | Vitest 4.0.18 + vitest-axe 0.1.0 |
| **Config file (E2E)** | `playwright.config.ts` |
| **Config file (Unit)** | `vitest.config.ts` |
| **Quick run command** | `pnpm test:run` |
| **Full suite command** | `pnpm lint && pnpm lint:css && pnpm format:check && pnpm typecheck && pnpm test:run && pnpm build` |
| **E2E command** | `pnpm test:e2e` |
| **Estimated runtime** | ~30 seconds (unit), ~120 seconds (E2E) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test:run` (unit tests including vitest-axe)
- **After every plan wave:** Run full verification suite + `pnpm test:e2e`
- **Before `/gsd:verify-work`:** Full suite must be green + all E2E tests pass
- **Max feedback latency:** 30 seconds (unit), 120 seconds (E2E)

---

## Per-Task Verification Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? | Status |
|--------|----------|-----------|-------------------|-------------|--------|
| TEST-03 | Auth login -> dashboard | E2E | `npx playwright test e2e/auth-dashboard.spec.ts` | ❌ W0 | ⬜ pending |
| TEST-04 | Mock test lifecycle | E2E | `npx playwright test e2e/mock-test.spec.ts` | ❌ W0 | ⬜ pending |
| TEST-05 | Practice session | E2E | `npx playwright test e2e/practice.spec.ts` | ❌ W0 | ⬜ pending |
| TEST-06 | Flashcard sort | E2E | `npx playwright test e2e/flashcard-sort.spec.ts` | ❌ W0 | ⬜ pending |
| TEST-07 | Offline -> online sync | E2E | `npx playwright test e2e/offline-sync.spec.ts` | ❌ W0 | ⬜ pending |
| TEST-08 | Interview session | E2E | `npx playwright test e2e/interview.spec.ts` | ❌ W0 | ⬜ pending |
| TEST-09 | SW update flow | E2E | `npx playwright test e2e/sw-update.spec.ts` | ❌ W0 | ⬜ pending |
| A11Y-01 | WCAG 2.2 scans (4 pages) | E2E | `npx playwright test e2e/wcag-scan.spec.ts` | ❌ W0 | ⬜ pending |
| A11Y-02 | vitest-axe expansion | Unit | `pnpm test:run src/__tests__/a11y/` | Partial (2 exist) | ⬜ pending |
| A11Y-03 | Touch target 44px audit | E2E + fixes | `npx playwright test e2e/touch-targets.spec.ts` | ❌ W0 | ⬜ pending |
| A11Y-04 | Glass contrast verification | CSS fix | N/A (CSS token change) | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `e2e/fixtures/auth.ts` — auth mock fixture (page.route + localStorage session)
- [ ] `e2e/fixtures/storage.ts` — storage cleanup fixture (IndexedDB + localStorage)
- [ ] `e2e/fixtures/axe.ts` — AxeBuilder configuration fixture (WCAG 2.2 AA tags)
- [ ] `e2e/fixtures/index.ts` — combined test export (test.extend composition)
- [ ] `@axe-core/playwright` install: `pnpm add -D @axe-core/playwright`
- [ ] `playwright.config.ts` update: 60s timeout, 1 retry on CI, reducedMotion, serviceWorkers config

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Glass contrast visual quality | A11Y-04 | CSS token changes need visual confirmation on real device | Compare dark mode glass panels before/after opacity change 0.35→0.45 |
| Myanmar text legibility on glass | D-13 | Font weight perception varies by display | Verify Burmese text at font-weight:500 on glass surfaces in dark mode |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s (unit), < 120s (E2E)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
