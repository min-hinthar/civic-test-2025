---
phase: 49
slug: error-handling-security
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 49 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x + @testing-library/react |
| **Config file** | vitest.config.ts |
| **Quick run command** | `pnpm test:run` |
| **Full suite command** | `pnpm test:run && pnpm lint && pnpm typecheck && pnpm build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test:run`
- **After every plan wave:** Run `pnpm lint && pnpm lint:css && pnpm format:check && pnpm typecheck && pnpm test:run && pnpm build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 49-01-01 | 01 | 1 | ERRS-01 | unit | `pnpm test:run -- src/__tests__/errorBoundary.test.tsx` | Partial | ⬜ pending |
| 49-01-02 | 01 | 1 | ERRS-02 | unit | `pnpm test:run -- src/__tests__/errorBoundary.test.tsx` | Partial | ⬜ pending |
| 49-01-03 | 01 | 1 | ERRS-03 | unit | `pnpm test:run -- src/__tests__/errorBoundary.test.tsx` | Wave 0 | ⬜ pending |
| 49-01-04 | 01 | 1 | ERRS-04 | unit | `pnpm test:run -- src/__tests__/errorBoundary.test.tsx` | Wave 0 | ⬜ pending |
| 49-02-01 | 02 | 1 | ERRS-06 | unit | `pnpm test:run -- src/__tests__/providerOrderGuard.test.ts` | Wave 0 | ⬜ pending |
| 49-02-02 | 02 | 1 | DX-03 | manual-only | Visual inspection | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Extend `src/__tests__/errorBoundary.test.tsx` — add SharedErrorFallback tests, onError callback verification (ERRS-03, ERRS-04)
- [ ] `src/__tests__/providerOrderGuard.test.ts` — stubs for ERRS-06

*Existing infrastructure covers framework needs. No new installs required.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| console.error replaced with captureError | DX-03 | Code review — no behavioral change to test | Grep for console.error in modified files; verify captureError usage |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
