---
phase: 47
slug: performance-optimization
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-01
---

# Phase 47 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x with jsdom |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm typecheck && pnpm lint` |
| **Full suite command** | `pnpm test -- --run && pnpm build --webpack` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm typecheck && pnpm lint`
- **After every plan wave:** Run `pnpm build --webpack`
- **Before `/gsd:verify-work`:** Full build must be green + Lighthouse metrics captured
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 47-01-01 | 01 | 1 | PERF-03 | build output | `pnpm build --webpack 2>&1` | N/A (build output) | pending |
| 47-01-02 | 01 | 1 | PERF-01 | build + grep | `pnpm build --webpack` | N/A | pending |
| 47-02-01 | 02 | 1 | PERF-02 | config check | `grep 'recharts' next.config.mjs` | existing | pending |
| 47-02-02 | 02 | 1 | PERF-01 | build verify | `pnpm build --webpack` | N/A | pending |
| 47-03-01 | 03 | 2 | PERF-03, PERF-04 | build + lighthouse | `pnpm build --webpack` | N/A | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test files needed -- verification is build-output-based and Lighthouse-based.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Web Vitals metrics | PERF-04 | Requires running server + Lighthouse | `pnpm build --webpack && pnpm start`, then `npx lighthouse http://localhost:3000/home --output json` |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
