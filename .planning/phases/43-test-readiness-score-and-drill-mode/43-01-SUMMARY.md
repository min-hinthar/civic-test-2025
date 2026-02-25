---
phase: 43-test-readiness-score-and-drill-mode
plan: 01
subsystem: testing
tags: [readiness, fsrs, tdd, vitest, scoring-engine, drill-selection]
requirements-completed: [RDNS-01, RDNS-02, RDNS-03]

# Dependency graph
requires:
  - phase: mastery-system
    provides: calculateQuestionAccuracy, categoryMapping, USCIS_CATEGORIES
  - phase: srs-system
    provides: fsrsEngine singleton, Card type, get_retrievability
provides:
  - calculateReadiness pure function (0-100 score from accuracy/coverage/consistency)
  - getTierLabel bilingual tier labels (4 tiers)
  - selectDrillQuestions weak-area drill selection
  - fsrsInstance exported singleton for retrievability projection
  - ReadinessInput, ReadinessResult, DrillConfig, TierLabel types
affects: [43-02 dashboard-readiness-card, 43-03 drill-page, 43-04 drill-results]

# Tech tracking
tech-stack:
  added: []
  patterns: [readiness-engine-pure-functions, 3-dimension-scoring, 60-percent-cap-rule]

key-files:
  created:
    - src/lib/readiness/types.ts
    - src/lib/readiness/readinessEngine.ts
    - src/lib/readiness/readinessEngine.test.ts
    - src/lib/readiness/drillSelection.ts
    - src/lib/readiness/drillSelection.test.ts
    - src/lib/readiness/index.ts
  modified:
    - src/lib/srs/fsrsEngine.ts

key-decisions:
  - "Export FSRS singleton as fsrsInstance rather than creating duplicate instance"
  - "Accuracy dimension uses weighted average by sub-category question count (not equal weight)"
  - "60% cap uses 3 main USCIS categories (not 7 sub-categories) for zero-coverage check"
  - "Consistency dimension returns 0 when no reviewed SRS cards exist (reps > 0 filter)"

patterns-established:
  - "Readiness engine as pure functions: all scoring logic is testable without UI or IDB"
  - "Date coercion pattern: card.due/last_review coerced from string after IndexedDB roundtrip"
  - "Drill selection: synchronous function taking pre-loaded answer history (caller handles async)"

requirements-completed: [RDNS-01, RDNS-02, RDNS-03, RDNS-04, RDNS-05]

# Metrics
duration: 7min
completed: 2026-02-25
---

# Phase 43 Plan 01: Readiness Engine and Drill Selection Summary

**TDD-built readiness scoring engine (accuracy 40% + coverage 30% + consistency 30%) with 60% zero-coverage cap, bilingual tier labels, and weak-area drill question selection using FSRS retrievability**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-25T13:02:28Z
- **Completed:** 2026-02-25T13:09:00Z
- **Tasks:** 2 (TDD RED + GREEN)
- **Files modified:** 7

## Accomplishments
- Readiness engine computing 0-100 score from 3 weighted dimensions with full test coverage
- 60% cap logic correctly using 3 main USCIS categories (not 7 sub-categories)
- FSRS retrievability projection via exported singleton for consistency dimension
- Drill question selection prioritizing weakest accuracy with Fisher-Yates shuffle
- 22 unit tests (9 calculateReadiness + 8 getTierLabel + 5 selectDrillQuestions) all passing

## Task Commits

Each task was committed atomically:

1. **TDD RED: Failing tests + types** - `a34acce` (test)
2. **TDD GREEN: Implementation passing all tests** - `c57ee10` (feat)

_TDD: RED confirmed all tests fail (module not found), GREEN confirmed all 22 pass._

## Files Created/Modified
- `src/lib/readiness/types.ts` - ReadinessInput, DimensionScore, ReadinessResult, TierLabel, DrillConfig interfaces
- `src/lib/readiness/readinessEngine.ts` - calculateReadiness, calculateAccuracy, calculateCoverage, calculateConsistency, findZeroCoverageCategories, getTierLabel
- `src/lib/readiness/readinessEngine.test.ts` - 17 test cases for scoring formula, cap logic, tier labels, edge cases
- `src/lib/readiness/drillSelection.ts` - selectDrillQuestions using per-question accuracy scoring
- `src/lib/readiness/drillSelection.test.ts` - 5 test cases for drill selection logic
- `src/lib/readiness/index.ts` - Barrel exports for readiness module
- `src/lib/srs/fsrsEngine.ts` - Added `export { f as fsrsInstance }` for retrievability projection

## Decisions Made
- Export existing FSRS singleton (`f as fsrsInstance`) rather than creating a duplicate instance with identical params -- guarantees parameter consistency
- Accuracy dimension weighted by sub-category question counts (e.g., System of Government's 35 questions outweigh Principles' 12) -- matches calculateOverallMastery pattern
- 60% cap check uses 3 main USCIS categories to avoid over-aggressive capping (studying 6 of 7 sub-categories should not trigger cap)
- Consistency returns 0 when no reviewed SRS cards exist (reps=0 cards are "New" and have no retrievability data)
- drillSelection is synchronous -- caller pre-loads answer history to keep the function pure and testable

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed weighted accuracy test assertion**
- **Found during:** TDD GREEN phase
- **Issue:** Test expected accuracy < 80 when only one sub-category at 80% was provided, but weighted average of a single entry is exactly that entry's value
- **Fix:** Changed test to use two sub-categories with different mastery/question-counts and verify exact weighted average (63%)
- **Files modified:** src/lib/readiness/readinessEngine.test.ts
- **Verification:** All 22 tests pass
- **Committed in:** c57ee10 (GREEN phase commit)

---

**Total deviations:** 1 auto-fixed (1 bug in test)
**Impact on plan:** Test correction improved test accuracy. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Readiness engine ready for Dashboard integration (Plan 02: ReadinessHeroCard)
- All exported functions are pure and can be composed with React hooks
- Types are exported for use in UI components
- fsrsInstance available for any future retrievability calculations

---
*Phase: 43-test-readiness-score-and-drill-mode*
*Completed: 2026-02-25*
