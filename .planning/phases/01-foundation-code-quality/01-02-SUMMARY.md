---
phase: 01-foundation-code-quality
plan: 02
subsystem: core-algorithms
tags: [shuffle, mutex, navigation, tdd, bug-fix]
dependency-graph:
  requires:
    - 01-01 (testing infrastructure)
  provides:
    - Fisher-Yates shuffle algorithm with statistical tests
    - Mutex-protected save operation
    - Fixed navigation lock pattern
  affects:
    - 01-03 (offline capability)
    - 02-* (auth flows use saveSession)
tech-stack:
  added: []
  patterns:
    - Fisher-Yates shuffle for uniform distribution
    - State machine pattern for save operation
    - Mutex pattern for concurrency control
key-files:
  created:
    - src/lib/shuffle.ts
    - src/__tests__/shuffle.test.ts
    - src/lib/saveSession.ts
    - src/__tests__/saveSession.test.ts
    - src/__tests__/navigationLock.test.ts
  modified:
    - src/pages/TestPage.tsx
key-decisions:
  - Chi-squared test threshold set to 50 for shuffle uniformity
  - Save guard uses state machine with idle/saving/saved/error states
  - Navigation lock uses replaceState in popstate handler
duration: 7 min
completed: 2026-02-05
---

# Phase 01 Plan 02: Critical Bug Fixes with TDD Summary

**One-liner:** Fixed biased shuffle with Fisher-Yates, prevented duplicate saves with mutex guard, and eliminated history stack overflow with replaceState pattern.

## Performance

- Start: 2026-02-06T05:27:12Z
- End: 2026-02-06T05:34:30Z
- Duration: 7 minutes
- Tasks: 3/3 completed (Task 1 was already committed before session)

## Accomplishments

1. **Fisher-Yates Shuffle (Task 1 - pre-committed)**: Implemented unbiased shuffle algorithm with chi-squared statistical regression test proving uniform distribution. Replaced biased sort-based shuffle.

2. **Mutex-protected Save Guard (Task 2)**: Created `SaveSessionGuard` with state machine pattern (idle/saving/saved/error). Uses async-mutex to prevent concurrent saves. Tests verify only one save executes when multiple are triggered simultaneously.

3. **Navigation Lock Fix (Task 3)**: Changed `pushState` to `replaceState` in popstate handler. This prevents unbounded history stack growth during long test sessions. Added regression tests documenting the correct pattern vs the bug pattern.

## Task Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Fisher-Yates shuffle | 9b1ba7b | shuffle.ts, shuffle.test.ts, TestPage.tsx |
| 2 | Mutex save guard | 94ac006 | saveSession.ts, saveSession.test.ts |
| 3 | Navigation lock fix | 39df770 | TestPage.tsx, navigationLock.test.ts |

## Files Created

- `src/lib/shuffle.ts` - Fisher-Yates shuffle implementation
- `src/__tests__/shuffle.test.ts` - 7 tests including chi-squared distribution test
- `src/lib/saveSession.ts` - Mutex-protected save session guard
- `src/__tests__/saveSession.test.ts` - 6 tests for state transitions and mutex
- `src/__tests__/navigationLock.test.ts` - 3 tests for replaceState pattern

## Files Modified

- `src/pages/TestPage.tsx` - Updated to use fisherYatesShuffle import and replaceState for navigation lock

## Decisions Made

1. **Chi-squared threshold**: Set to 50 (generous threshold to avoid flaky tests). Critical value for df=20, p=0.001 is ~45.3. A biased shuffle produces values >100.

2. **State machine for saves**: Chose idle/saving/saved/error states with explicit reset. This provides clear lifecycle and prevents race conditions.

3. **replaceState vs pushState**: replaceState in popstate handler prevents stack growth. pushState only on mount to create the locked entry.

## Deviations from Plan

None - plan executed exactly as written. Task 1 was already completed in a prior session (commit 9b1ba7b).

## Issues Encountered

1. **TypeScript strict mode**: Double-check after mutex acquire flagged as unreachable code. Fixed with explicit cast `(state as SaveState)`.

2. **Test type signatures**: History API mock needed explicit typed parameters to satisfy TypeScript.

## Next Phase Readiness

**Ready for:**
- 01-03: Offline capability (no blockers)
- 01-04: Code quality (no blockers)

**Key links established:**
- `src/pages/TestPage.tsx` imports `fisherYatesShuffle` from `@/lib/shuffle`
- Save guard ready for integration in `SupabaseAuthContext.tsx` (not wired yet - deferred to future plan)

**Requirements satisfied:**
- FNDN-01: Uniform question distribution (Fisher-Yates)
- FNDN-02: No duplicate test submissions (mutex guard ready)
- FNDN-03: No history stack overflow (replaceState pattern)

## Self-Check: PASSED
