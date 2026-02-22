---
phase: 38-security-analysis-fixes-and-codebase-refactoring-based-on-learnings-and-error-history
plan: 02
subsystem: async-utilities
tags: [retry, error-handling, sentry, exponential-backoff, tdd]

# Dependency graph
requires: []
provides:
  - withRetry generic async retry wrapper with exponential backoff
  - safeAsync error-catching async wrapper with Sentry reporting
  - isRetryableError classifier for network vs auth/quota errors
  - Barrel export from src/lib/async/index.ts
affects: [38-04-error-handling-integration, contexts, hooks]

# Tech tracking
tech-stack:
  added: []
  patterns: [result-tuple-pattern, exponential-backoff-retry, error-classification]

key-files:
  created:
    - src/lib/async/withRetry.ts
    - src/lib/async/withRetry.test.ts
    - src/lib/async/safeAsync.ts
    - src/lib/async/safeAsync.test.ts
    - src/lib/async/index.ts
  modified: []

key-decisions:
  - "Used setTimeout spy to verify exponential backoff delays instead of measuring wall-clock time with fake timers"
  - "isRetryableError checks HTTP status codes on error objects for Supabase error compatibility"
  - "safeAsync uses captureError from sentry.ts (already exports it) rather than Sentry.captureException directly"

patterns-established:
  - "Result tuple pattern: [T, null] | [null, Error] for safe async operations"
  - "Error classification: isRetryableError separates network/transient from auth/quota/validation"
  - "Exponential backoff: baseDelayMs * 2^(attempt-1) with configurable maxAttempts"

requirements-completed: [CONTEXT-withRetry-utility, CONTEXT-safeAsync-utility, CONTEXT-silent-retry]

# Metrics
duration: 12min
completed: 2026-02-22
---

# Phase 38 Plan 02: Async Utilities Summary

**TDD-built withRetry (exponential backoff, error classification) and safeAsync (Sentry-reporting result tuples) utilities for standardized async error handling**

## Performance

- **Duration:** 12 min
- **Started:** 2026-02-22T07:55:58Z
- **Completed:** 2026-02-22T08:08:00Z
- **Tasks:** 2 features (TDD: RED-GREEN for each)
- **Files created:** 5

## Accomplishments
- withRetry retries network/transient errors with exponential backoff (1s, 2s, 4s) and immediately throws on non-retryable errors (401, 400, QuotaExceeded)
- safeAsync catches all errors, normalizes non-Error values, reports to Sentry with optional context, returns result tuples
- 26 comprehensive tests covering all behavior specs from the plan
- Clean barrel export ready for integration in Plan 04

## Task Commits

Each task was committed atomically (TDD flow):

1. **withRetry RED** - `2ce54fd` (test: add failing tests for withRetry utility)
2. **withRetry GREEN** - `0474676` (feat: implement withRetry with exponential backoff)
3. **safeAsync RED** - `d1d2b36` (test: add failing tests for safeAsync utility)
4. **safeAsync GREEN + barrel** - `c5b49ab` (feat: implement safeAsync and barrel exports)

## Files Created/Modified
- `src/lib/async/withRetry.ts` - Generic retry wrapper with exponential backoff and error classification
- `src/lib/async/withRetry.test.ts` - 18 tests: success, retry, exhaustion, non-retryable, backoff timing, onRetry callback
- `src/lib/async/safeAsync.ts` - Safe async wrapper with Sentry reporting and result tuples
- `src/lib/async/safeAsync.test.ts` - 8 tests: success tuples, error wrapping, Sentry integration, context forwarding
- `src/lib/async/index.ts` - Barrel export for withRetry, safeAsync, isRetryableError, and types

## Decisions Made
- Used `captureError` from `@/lib/sentry` (already exported) rather than importing `@sentry/nextjs` directly -- keeps the PII sanitization pipeline intact
- `isRetryableError` checks `error.status` for HTTP codes (401/400) for Supabase error object compatibility
- Exponential backoff verified via `setTimeout` spy rather than `Date.now()` measurement -- more reliable with fake timers
- Non-Error thrown values (strings, numbers) normalized to Error objects in safeAsync for consistent return type

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed missing beforeEach import in safeAsync test**
- **Found during:** safeAsync GREEN phase (typecheck verification)
- **Issue:** `beforeEach` used in test file but not imported from vitest
- **Fix:** Added `beforeEach` to vitest import statement
- **Files modified:** src/lib/async/safeAsync.test.ts
- **Verification:** `pnpm run typecheck` passes clean
- **Committed in:** c5b49ab (part of safeAsync commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Trivial import fix. No scope creep.

## Issues Encountered
- Fake timer interaction with async promise chains required `.catch()` pattern instead of `await expect().rejects.toThrow()` for the exhaustion test -- rejected promises from `advanceTimersByTimeAsync` were escaping as unhandled rejections before the assertion could catch them

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- withRetry and safeAsync are ready for Plan 04 to wire into contexts and hooks
- Barrel export at `@/lib/async` provides clean import path
- All verification commands pass: tests (26/26), typecheck, lint

## Self-Check: PASSED

All 5 created files verified on disk. All 4 commit hashes verified in git log.

---
*Phase: 38-security-analysis-fixes-and-codebase-refactoring-based-on-learnings-and-error-history*
*Completed: 2026-02-22*
