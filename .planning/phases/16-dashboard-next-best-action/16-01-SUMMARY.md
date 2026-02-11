---
phase: 16-dashboard-next-best-action
plan: 01
subsystem: lib
tags: [nba, pure-function, tdd, bilingual, discriminated-union, priority-chain]

# Dependency graph
requires: []
provides:
  - "determineNextBestAction pure function for NBA priority logic"
  - "NBAState discriminated union (8 variants) with bilingual content"
  - "NBAInput type covering streak, SRS, mastery, test/interview history"
  - "Bilingual string catalog with dynamic interpolation for all 8 states"
  - "Barrel exports from @/lib/nba"
affects: [16-02-dashboard-supporting-components, 16-03-dashboard-nba-hero, 16-04-useNextBestAction-hook]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Injectable Date parameter for deterministic testing", "Priority chain with discriminated union return", "Bilingual string builder functions with dynamic interpolation"]

key-files:
  created:
    - src/lib/nba/nbaTypes.ts
    - src/lib/nba/nbaStrings.ts
    - src/lib/nba/determineNBA.ts
    - src/lib/nba/determineNBA.test.ts
    - src/lib/nba/index.ts
  modified: []

key-decisions:
  - "Celebration state checked BEFORE test-ready in priority chain (specific 'all clear' criteria take priority over general readiness)"
  - "Reused BilingualString from @/lib/i18n/strings instead of creating new BilingualText type (structural compatibility)"
  - "Weak category threshold set at absolute 50% (aligns with bronze milestone in getNextMilestone)"
  - "Interview suggestion gated on readiness >= 80% AND at least one passed mock test (score >= 60%)"

patterns-established:
  - "Injectable `now` parameter on pure functions for deterministic date-based testing"
  - "getNBAContent(type, data) builder pattern for state-specific bilingual content assembly"
  - "Priority chain returns early at first matching state (no fallthrough)"

# Metrics
duration: 10min
completed: 2026-02-11
---

# Phase 16 Plan 01: NBA Determination Engine Summary

**Pure determineNextBestAction function with 8-state discriminated union, bilingual string catalog, and 30 TDD tests covering all priority states and edge cases**

## Performance

- **Duration:** 10 min
- **Started:** 2026-02-11T11:03:19Z
- **Completed:** 2026-02-11T11:13:15Z
- **Tasks:** 2
- **Files created:** 5

## Accomplishments
- NBAState discriminated union with 8 typed variants carrying state-specific data (daysSinceActivity, dueCount, categoryName, readinessScore, etc.)
- NBAInput type aggregating data from useStreak, useSRSWidget, useCategoryMastery, and test/interview history
- Bilingual string catalog with dynamic interpolation for titles, hints, CTAs, gradients, icons, and time estimates
- Pure determination function with zero React dependencies and injectable Date for testing
- 30 comprehensive test cases covering all 8 states, priority ordering, interview suggestion logic, and edge cases

## Task Commits

Each task was committed atomically:

1. **Task 1: Create NBA type system and bilingual string catalog** - `6acfb65` (feat)
2. **Task 2 RED: Failing tests for determineNextBestAction** - `45b568c` (test)
3. **Task 2 GREEN+REFACTOR: Implementation with all tests passing** - `0f17868` (feat)

## Files Created/Modified
- `src/lib/nba/nbaTypes.ts` - NBAState discriminated union, NBAInput interface, NBAStateType and NBAIcon types
- `src/lib/nba/nbaStrings.ts` - Bilingual content builders for all 8 states with dynamic interpolation
- `src/lib/nba/determineNBA.ts` - Pure determineNextBestAction function with priority chain
- `src/lib/nba/determineNBA.test.ts` - 30 unit tests covering all states, priorities, and edge cases
- `src/lib/nba/index.ts` - Barrel exports for types, strings, and determination function

## Decisions Made
- **Celebration before test-ready:** Celebration is a specific "all clear" state (streak > 0, SRS 0, mastery >= 60, recent test) that takes priority over general test-ready (readiness >= 70%). This ensures users who are doing great see celebration instead of a redundant "you're ready" message.
- **Readiness formula reuse:** Mirrored the existing ReadinessIndicator formula (accuracy * 0.4 + coverage * 0.5 + streak bonus max 10) for consistency.
- **BilingualString reuse:** Used the existing BilingualString type from @/lib/i18n/strings rather than creating a new BilingualText type.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Adjusted celebration/test-ready priority ordering**
- **Found during:** Task 2 (TDD GREEN phase)
- **Issue:** Plan listed priority as "test-ready > celebration" but celebration has stricter criteria (streak + SRS + mastery + recent test). With the plan's ordering, users qualifying for both always got test-ready, making celebration unreachable for high-readiness users.
- **Fix:** Moved celebration check before test-ready. Celebration fires when all specific criteria met; test-ready catches high-readiness users who don't qualify for celebration.
- **Files modified:** src/lib/nba/determineNBA.ts, src/lib/nba/determineNBA.test.ts
- **Verification:** All 30 tests pass including celebration-with-interview-suggestion case
- **Committed in:** 0f17868 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Priority reordering was necessary for celebration state to be reachable. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- NBA types, strings, and determination function ready for consumption by useNextBestAction hook (Plan 02+)
- NBAState union ready for UI mapping in NBAHeroCard component
- All exports available from `@/lib/nba` barrel

## Self-Check: PASSED

All 5 created files verified present. All 3 task commits verified in git log.

---
*Phase: 16-dashboard-next-best-action*
*Completed: 2026-02-11*
