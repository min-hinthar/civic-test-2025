---
phase: 51-unit-test-expansion
plan: 01
subsystem: testing
tags: [vitest, react-testing-library, context-providers, coverage-thresholds]

requires:
  - phase: 48
    provides: renderWithProviders test utility with preset system and full mock set
provides:
  - Unit tests for StateContext, NavigationProvider, LanguageContext, OfflineContext
  - 4 per-file coverage thresholds in vitest.config.ts
  - Established test patterns for context provider testing with full preset
affects: [51-02, 51-03]

tech-stack:
  added: []
  patterns: [context-consumer-component-pattern, full-preset-provider-testing]

key-files:
  created:
    - src/__tests__/contexts/State.test.tsx
    - src/__tests__/contexts/Navigation.test.tsx
    - src/__tests__/contexts/Language.test.tsx
    - src/__tests__/contexts/Offline.test.tsx
  modified:
    - vitest.config.ts

key-decisions:
  - "Mock useMediaTier/useNavBadges/useScrollDirection directly rather than their transitive deps for NavigationProvider tests"
  - "Mock useOnlineStatus for OfflineContext tests to control online/offline state programmatically"
  - "Consumer component pattern: each test file creates a consumer that renders all context values and exposes actions via buttons"
  - "Coverage thresholds floored from actual: State 93/83/100/96, Nav 92/81/100/96, Lang 89/78/100/92, Offline 87/75/100/89"

patterns-established:
  - "Context test consumer pattern: create a component that reads the hook and renders all values with data-testid attributes"
  - "Full mock set: copy all 28+ vi.mock() declarations from renderWithProviders.test.tsx for full-preset tests"
  - "Click-outside testing: attach sidebarRef to a nav element, create external DOM element for pointerdown events"

requirements-completed: [TEST-10]

duration: 12min
completed: 2026-03-20
---

# Phase 51 Plan 01: Simple Provider Unit Tests Summary

**41 unit tests across 4 context providers (State, Navigation, Language, Offline) with per-file coverage thresholds**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-20T10:02:24Z
- **Completed:** 2026-03-20T10:15:02Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- 8 tests for StateContext covering init, selection, persistence, derived stateInfo, invalid codes, allStates
- 11 tests for NavigationProvider covering tier detection, toggle, lock, click-outside, localStorage, desktop defaults
- 10 tests for LanguageContext covering init, toggle, shortcut, multi-tab sync, document.lang, LWW timestamps
- 11 tests for OfflineContext covering online/offline, caching, sync trigger, failure, pending count, cleanup
- 4 per-file coverage thresholds added to vitest.config.ts floored from actual measured values

## Task Commits

Each task was committed atomically:

1. **Task 1: State and Navigation provider tests** - `8f8d7a2` (test)
2. **Task 2: Language and Offline provider tests + coverage thresholds** - `44a1ba4` (test)

## Files Created/Modified
- `src/__tests__/contexts/State.test.tsx` - 8 tests for StateContext (init, selection, persistence, derived stateInfo)
- `src/__tests__/contexts/Navigation.test.tsx` - 11 tests for NavigationProvider (tier, toggle, lock, click-outside)
- `src/__tests__/contexts/Language.test.tsx` - 10 tests for LanguageContext (mode, shortcut, multi-tab, settings sync)
- `src/__tests__/contexts/Offline.test.tsx` - 11 tests for OfflineContext (online/offline, cache, sync, failure)
- `vitest.config.ts` - 4 new per-file coverage thresholds

## Decisions Made
- Mocked hooks directly (useMediaTier, useNavBadges, useScrollDirection, useOnlineStatus) instead of their transitive dependencies for cleaner test isolation
- Consumer component pattern: each test creates a component that reads the full context value and exposes actions via button onClick handlers
- Coverage thresholds floored from actual values per G-06 guardrail (not aspirational)
- Click-outside test creates a detached DOM element for pointerdown, assigns sidebarRef to a nav element in the consumer

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed click-outside test for NavigationProvider**
- **Found during:** Task 1 (Navigation tests)
- **Issue:** Initial click-outside test used document.body which is inside the render tree; sidebarRef was null since consumer didn't use it
- **Fix:** Consumer assigns sidebarRef to a nav element; test creates an external DOM element for pointerdown
- **Files modified:** src/__tests__/contexts/Navigation.test.tsx
- **Verification:** Test passes after fix
- **Committed in:** 8f8d7a2

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor test implementation adjustment. No scope creep.

## Issues Encountered
- Pre-existing coverage threshold violations exist for ErrorBoundary.tsx (branches 68.75% < 70%) and settingsSync.ts (multiple metrics below thresholds) -- these are not caused by this plan's changes

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Test patterns established for Plan 02 (complex providers: Auth, Theme, TTS, SRS, Social, Toast)
- Full mock set documented and proven working with full preset
- Consumer component pattern ready to replicate for remaining providers

## Self-Check: PASSED

- All 6 files verified present on disk
- Both task commits (8f8d7a2, 44a1ba4) verified in git log
- 41 tests passing across 4 test files
- No new coverage threshold violations

---
*Phase: 51-unit-test-expansion*
*Completed: 2026-03-20*
