---
phase: 50-pwa-sync-resilience
plan: 01
subsystem: database
tags: [indexeddb, idb-keyval, cache-versioning, offline-first]

# Dependency graph
requires: []
provides:
  - "Centralized STORAGE_VERSIONS constants for all 10 IndexedDB stores"
  - "Version-validated getCachedQuestions with stale data invalidation"
  - "Sentry error logging on cache version mismatch"
affects: [pwa, offline, sync]

# Tech tracking
tech-stack:
  added: []
  patterns: ["per-store version constant pattern via STORAGE_VERSIONS"]

key-files:
  created:
    - src/lib/db/storageVersions.ts
    - src/__tests__/storageVersions.test.ts
  modified:
    - src/lib/pwa/offlineDb.ts
    - vitest.config.ts

key-decisions:
  - "STORAGE_VERSIONS uses `as const` for type safety and immutability"
  - "Backwards compat: getCachedQuestions treats missing meta (null) as valid (pre-versioned cache)"
  - "captureError logs version mismatch with cached vs expected context for debugging"

patterns-established:
  - "STORAGE_VERSIONS pattern: centralized per-store version constants, bump only when data structure changes"
  - "Version check on read: validate meta.version before returning cached data, clear on mismatch"

requirements-completed: [ARCH-06]

# Metrics
duration: 13min
completed: 2026-03-20
---

# Phase 50 Plan 01: IndexedDB Cache Versioning Summary

**Centralized STORAGE_VERSIONS constants for 10 IndexedDB stores with version-validated getCachedQuestions and stale data invalidation**

## Performance

- **Duration:** 13 min
- **Started:** 2026-03-20T08:32:34Z
- **Completed:** 2026-03-20T08:45:42Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created centralized `STORAGE_VERSIONS` with per-store isolation for all 10 IndexedDB stores
- Added version validation to `getCachedQuestions` with Sentry error logging on mismatch
- Added version check to `hasQuestionsCache` to prevent stale cache reporting as valid
- Replaced hardcoded version in `cacheQuestions` with `STORAGE_VERSIONS.QUESTIONS`
- 7 unit tests covering match, mismatch, backwards compat, and Sentry logging
- Per-file coverage threshold at 100% for storageVersions.ts

## Task Commits

Each task was committed atomically:

1. **Task 1: Create storageVersions.ts and version-validate getCachedQuestions** - `4e7668c` (feat)
2. **Task 2: Add per-file coverage threshold and run full verification** - `7048ce7` (chore)

_Note: Task 1 followed TDD (RED->GREEN) with single commit for implementation._

## Files Created/Modified
- `src/lib/db/storageVersions.ts` - Centralized version constants for all 10 IndexedDB stores
- `src/lib/pwa/offlineDb.ts` - Version-validated getCachedQuestions, hasQuestionsCache, cacheQuestions
- `src/__tests__/storageVersions.test.ts` - 7 unit tests for version validation behavior
- `vitest.config.ts` - Per-file 100% coverage threshold for storageVersions.ts

## Decisions Made
- `STORAGE_VERSIONS` uses `as const` for type safety and immutability
- Backwards compat: `getCachedQuestions` treats missing meta (null) as valid for pre-versioned caches
- `captureError` logs version mismatch with `{ cached, expected }` context for debugging
- Mock uses `vi.hoisted()` pattern for proper Vitest mock hoisting

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test mock to match actual Question type**
- **Found during:** Task 2 (full verification)
- **Issue:** Test mock used `answers_en`/`answers_my` fields that don't exist on the `Question` interface; typecheck failed
- **Fix:** Updated mock to use correct `answers`/`studyAnswers` fields with `as unknown as Question[]` cast
- **Files modified:** src/__tests__/storageVersions.test.ts
- **Verification:** `pnpm typecheck` passes
- **Committed in:** 7048ce7 (Task 2 commit)

**2. [Rule 3 - Blocking] Fixed vi.mock hoisting with vi.hoisted()**
- **Found during:** Task 1 (TDD GREEN phase)
- **Issue:** Mock functions declared as `const` before `vi.mock()` caused `ReferenceError: Cannot access before initialization` due to Vitest hoisting
- **Fix:** Used `vi.hoisted()` to declare mock functions, ensuring they exist when hoisted `vi.mock()` factories execute
- **Files modified:** src/__tests__/storageVersions.test.ts
- **Verification:** All 7 tests pass
- **Committed in:** 4e7668c (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both fixes necessary for test correctness. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- STORAGE_VERSIONS pattern established; future plans can import and use for other stores
- getCachedQuestions now validates version on every read -- stale data will be auto-cleared on deploy
- Ready for Plan 02 (SW lifecycle) and Plan 03 (sync queue)

---
*Phase: 50-pwa-sync-resilience*
*Completed: 2026-03-20*
