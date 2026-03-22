---
phase: 54
slug: route-group-error-fix
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-03-21
---

# Phase 54 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x + React Testing Library |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm typecheck && pnpm test:run` |
| **Full suite command** | `pnpm lint && pnpm lint:css && pnpm format:check && pnpm typecheck && pnpm test:run && pnpm build` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm typecheck && pnpm test:run`
- **After every plan wave:** Run `pnpm lint && pnpm lint:css && pnpm format:check && pnpm typecheck && pnpm test:run && pnpm build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 54-01-01 | 01 | 1 | ERRS-01 | typecheck + build | `pnpm typecheck && pnpm build` | n/a (static) | pending |
| 54-01-02 | 01 | 1 | ERRS-02 | typecheck + build | `pnpm typecheck && pnpm build` | n/a (static) | pending |
| 54-01-03 | 01 | 1 | Integration | typecheck | `pnpm typecheck` | n/a (static) | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. The error sanitizer and SharedErrorFallback are already tested (`src/__tests__/errorSanitizer.test.ts`, `src/__tests__/errorBoundary.test.tsx`). Route-group error files are thin wiring verified by typecheck + build. Constant deduplication is verified by typecheck (import resolution) and existing `interviewStateMachine.test.ts`.

---

## Manual-Only Verifications

All phase behaviors have automated verification.

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 45s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
