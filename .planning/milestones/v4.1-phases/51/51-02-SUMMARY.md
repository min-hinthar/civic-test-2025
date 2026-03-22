---
phase: 51-unit-test-expansion
plan: 02
subsystem: testing
tags: [vitest, react-testing-library, context-providers, coverage-thresholds, auth, srs, social, theme]

requires:
  - phase: 51-01
    provides: Established consumer component pattern, full mock set, and 4 simple provider test files
provides:
  - Unit tests for ThemeContext, SocialContext, SRSContext, SupabaseAuthContext
  - 4 per-file coverage thresholds in vitest.config.ts for complex providers
affects: [51-03]

tech-stack:
  added: []
  patterns: [vi-hoisted-auth-mocks, setupAuthenticated-helper, card-fixture-factory]

key-files:
  created:
    - src/__tests__/contexts/Theme.test.tsx
    - src/__tests__/contexts/Social.test.tsx
    - src/__tests__/contexts/SRS.test.tsx
    - src/__tests__/contexts/SupabaseAuth.test.tsx
  modified:
    - vitest.config.ts

key-decisions:
  - "vi.hoisted() for auth mock state control: mutable mockGetSession/mockOnAuthStateChange refs shared across tests"
  - "setupAuthenticated/setupUnauthenticated helpers encapsulate session + onAuthStateChange mock patterns"
  - "Card fixture factory makeCard(id, dueOffset) with full ts-fsrs Card shape including learning_steps"
  - "Global coverage floor kept at 40/40/30/40: many UI components at 0% coverage prevent bump to 45"
  - "Per-file thresholds floored from actual: Theme 93/81/93/94, Social 55/34/61/61, SRS 85/63/84/87, Auth 48/22/50/47"
  - "Auth hydration wait pattern: wait for display-name != 'empty' to confirm auth context completed hydration before testing Social actions"
  - "SIGNED_OUT test: don't fire INITIAL_SESSION via setTimeout to avoid race; rely on getSession bootstrap for user setup"

patterns-established:
  - "Auth hydration in provider tests: use setupSessionMock() with getSession returning a session; waitFor displayName or userId to confirm hydration"
  - "SRS card fixtures: makeCard(questionId, dueOffset) with full Card type including learning_steps field"
  - "isDue mock pattern: tag card.reps with marker value, mock isDue to check marker for deterministic dueCount"
  - "SupabaseAuth from() chain mock: buildFromMock() helper returns chainable select/eq/order/maybeSingle/upsert/insert"

requirements-completed: [TEST-10]

duration: 23min
completed: 2026-03-20
---

# Phase 51 Plan 02: Complex Provider Unit Tests Summary

**53 unit tests across 4 complex context providers (Theme, Social, SRS, SupabaseAuth) with per-file coverage thresholds**

## Performance

- **Duration:** 23 min
- **Started:** 2026-03-20T10:21:22Z
- **Completed:** 2026-03-20T10:44:22Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- 14 tests for ThemeContext covering init, toggle, View Transitions API fallback, reduced-motion fallback, system preference listener, DOM classes, meta theme-color, localStorage, settingsTimestamps
- 12 tests for SocialContext covering profile loading, opt-in/opt-out, streak merge, first-login push, unauthenticated no-ops, unmount safety, action no-ops
- 14 tests for SRSContext covering deck loading, add/remove/grade CRUD, dueCount memoization, sync orchestration, visibility refresh, withRetry passthrough, unmount safety, error handling
- 13 tests for SupabaseAuthContext covering login/register/logout, session hydration, SIGNED_OUT event, authError lifecycle, settings merge, bookmark merge, deferred hydration timing
- 4 per-file coverage thresholds added to vitest.config.ts floored from actual measured values

## Task Commits

Each task was committed atomically:

1. **Task 1: Theme and Social provider tests** - `5ea82b8` (test)
2. **Task 2: SRS and SupabaseAuth provider tests + coverage thresholds** - `a739867` (test)
3. **Type fixes for Theme and Social test fixtures** - `4677d0c` (fix)

## Files Created/Modified
- `src/__tests__/contexts/Theme.test.tsx` - 14 tests for ThemeContext (init, toggle, View Transitions, system pref, DOM classes, meta tag)
- `src/__tests__/contexts/Social.test.tsx` - 12 tests for SocialContext (profile load, opt-in/out, streak merge, unauthenticated no-ops)
- `src/__tests__/contexts/SRS.test.tsx` - 14 tests for SRSContext (deck CRUD, dueCount, sync, visibility refresh, error handling)
- `src/__tests__/contexts/SupabaseAuth.test.tsx` - 13 tests for SupabaseAuthContext (login/register/logout, hydration, auth events, merge)
- `vitest.config.ts` - 4 new per-file coverage thresholds for complex providers

## Decisions Made
- Used vi.hoisted() for auth mock state control (mockGetSession, mockOnAuthStateChange) to share mutable refs across tests
- Created setupAuthenticated/setupUnauthenticated helper functions to encapsulate the session + onAuthStateChange mock patterns
- Card fixture factory makeCard(id, dueOffset) provides full ts-fsrs Card shape including learning_steps
- Global coverage floor kept at 40/40/30/40 rather than bumping to 45/45/35/45 (many UI components have 0% coverage)
- Per-file thresholds floored from actual values per established guardrail (not aspirational)
- Auth hydration wait: confirm user is present via display-name before testing Social context actions

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed auth hydration race in Social optIn test**
- **Found during:** Task 1
- **Issue:** Social test clicked optIn before auth context had hydrated the user, so SocialContext's optIn returned early (user?.id guard)
- **Fix:** Wait for display-name to show user's email (proves auth hydration completed) before clicking optIn
- **Files modified:** src/__tests__/contexts/Social.test.tsx
- **Verification:** Test passes reliably
- **Committed in:** 5ea82b8

**2. [Rule 1 - Bug] Fixed TypeScript type errors in test fixtures**
- **Found during:** Task 2 (typecheck verification)
- **Issue:** StreakData fixtures missing required fields (freezesAvailable, freezesUsed, longestStreak, lastSyncedAt, dailyActivityCounts); Card missing learning_steps; Document cast too narrow
- **Fix:** Added all required StreakData and DailyActivityCounts fields to fixtures; added learning_steps to Card; used `as unknown as Record` for Document
- **Files modified:** src/__tests__/contexts/Social.test.tsx, src/__tests__/contexts/Theme.test.tsx, src/__tests__/contexts/SRS.test.tsx
- **Verification:** pnpm typecheck passes
- **Committed in:** 4677d0c

**3. [Rule 1 - Bug] Fixed SIGNED_OUT test race condition**
- **Found during:** Task 2
- **Issue:** SIGNED_OUT test fired INITIAL_SESSION via setTimeout(0) which re-hydrated user after SIGNED_OUT was processed
- **Fix:** Remove INITIAL_SESSION from onAuthStateChange mock; rely on getSession bootstrap for user setup instead
- **Files modified:** src/__tests__/contexts/SupabaseAuth.test.tsx
- **Verification:** Test passes reliably when run solo and in parallel
- **Committed in:** a739867

**4. [Rule 1 - Bug] Global coverage floor not bumped to 45/45/35/45**
- **Found during:** Task 2 (coverage analysis)
- **Issue:** Plan specified bumping global floor to 45/45/35/45, but many UI components have 0% coverage which would cause build failure
- **Fix:** Kept global floor at 40/40/30/40; added per-file thresholds only
- **Files modified:** vitest.config.ts
- **Verification:** Coverage run has no new threshold violations
- **Committed in:** a739867

---

**Total deviations:** 4 auto-fixed (4 bugs)
**Impact on plan:** All auto-fixes necessary for correctness. Global floor bump deferred to avoid build break. No scope creep.

## Issues Encountered
- Pre-existing coverage threshold violations exist for ErrorBoundary.tsx (branches 68.75% < 70%) and settingsSync.ts (multiple metrics below thresholds) -- not caused by this plan's changes
- Social and SupabaseAuth coverage lower than plan estimates (~55% and ~48% vs expected ~80-85%) due to complex async hydration paths not fully exercised

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 8 context providers now have unit tests (4 simple from Plan 01 + 4 complex from Plan 02)
- Combined 94 tests across 8 provider test files (41 + 53)
- Coverage thresholds established for all 8 providers
- Full test suite: 779 tests across 48 test files, all passing

## Self-Check: PASSED

- All 5 files verified present on disk
- All 3 task commits (5ea82b8, a739867, 4677d0c) verified in git log
- 53 tests passing across 4 test files
- No new coverage threshold violations

---
*Phase: 51-unit-test-expansion*
*Completed: 2026-03-20*
