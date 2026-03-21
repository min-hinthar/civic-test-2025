---
phase: 53
slug: component-decomposition
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-21
---

# Phase 53 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 + React Testing Library |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test:run -- --reporter=verbose` |
| **Full suite command** | `pnpm lint && pnpm lint:css && pnpm format:check && pnpm typecheck && pnpm test:run && pnpm build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm typecheck && pnpm test:run`
- **After every plan wave:** Run `pnpm lint && pnpm lint:css && pnpm format:check && pnpm typecheck && pnpm test:run && pnpm build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 53-01-01 | 01 | 0 | ARCH-05 | unit | `pnpm test:run -- src/__tests__/lib/interviewStateMachine.test.ts` | ❌ W0 | ⬜ pending |
| 53-01-02 | 01 | 0 | ARCH-05 | unit | Same as above | ❌ W0 | ⬜ pending |
| 53-02-01 | 02 | 1 | ARCH-05 | typecheck | `pnpm typecheck` | ✅ | ⬜ pending |
| 53-02-02 | 02 | 1 | ARCH-04 | typecheck | `pnpm typecheck` | ✅ | ⬜ pending |
| 53-03-01 | 03 | 2 | ARCH-04 | e2e | `pnpm exec playwright test e2e/interview.spec.ts` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/lib/interviewStateMachine.test.ts` — pure reducer tests for ARCH-05
- [ ] Per-file coverage threshold in `vitest.config.ts` for `src/lib/interview/interviewStateMachine.ts`

*Existing test infrastructure (Vitest, RTL, renderWithProviders) covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| InterviewSession.tsx < 400 lines | ARCH-04 | Line count check | `wc -l src/components/interview/InterviewSession.tsx` |
| Each sub-component < 200 lines | ARCH-04 | Line count check | `wc -l src/components/interview/Interview{Header,ChatArea,RecordingArea}.tsx src/components/interview/QuitConfirmationDialog.tsx` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
