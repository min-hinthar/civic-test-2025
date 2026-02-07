---
phase: 04-learning-explanations-category-progress
plan: 02
subsystem: calculation
tags: [mastery, tdd, exponential-decay, indexeddb, idb-keyval, weak-areas]

# Dependency graph
requires:
  - phase: 04-01
    provides: "Explanation data, USCIS category mapping, Question types with string IDs"
  - phase: 01-05
    provides: "Question IDs as strings (GOV-P##, HIST-C##), category module structure"
provides:
  - "Recency-weighted mastery calculation with exponential decay (14-day half-life)"
  - "IndexedDB answer history storage via idb-keyval"
  - "Weak area detection with configurable threshold (default 60%)"
  - "Stale category detection with configurable window (default 7 days)"
  - "Milestone progression (bronze/silver/gold at 50/75/100)"
  - "Barrel export at @/lib/mastery for all mastery module features"
affects: [04-03, 04-04, 04-05, 04-06, 04-07, 04-08, 04-09]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Exponential decay weighting: weight = 0.5^(ageDays/14) * sessionMultiplier"
    - "Session type multipliers: test=1.0, practice=0.7"
    - "Category-question mapping via Record<string, string[]> for stale detection"
    - "Pure functions for calculation, async for storage (separation of concerns)"

key-files:
  created:
    - "src/lib/mastery/calculateMastery.ts"
    - "src/lib/mastery/calculateMastery.test.ts"
    - "src/lib/mastery/masteryStore.ts"
    - "src/lib/mastery/weakAreaDetection.ts"
    - "src/lib/mastery/index.ts"
  modified: []

key-decisions:
  - "detectStaleCategories accepts Record<string, string[]> mapping instead of string[] for accurate category-question matching"
  - "Exported TEST_WEIGHT and PRACTICE_WEIGHT as named constants for transparency"
  - "Set-based questionId lookup in calculateCategoryMastery for O(1) performance"
  - "Barrel export index.ts re-exports all mastery module features including categoryMapping from 04-01"

patterns-established:
  - "TDD RED-GREEN-REFACTOR for calculation-heavy modules"
  - "Pure function calculation + async storage separation"
  - "Configurable thresholds with sensible defaults (60% weak, 7 days stale)"

# Metrics
duration: 12min
completed: 2026-02-07
---

# Phase 4 Plan 2: Mastery Calculation Engine Summary

**Recency-weighted mastery calculation with exponential decay (14-day half-life), IndexedDB answer persistence via idb-keyval, and weak area detection with 60% threshold**

## Performance

- **Duration:** 12 min
- **Started:** 2026-02-07T10:02:56Z
- **Completed:** 2026-02-07T10:15:12Z
- **Tasks:** 3 (TDD: RED, GREEN, REFACTOR)
- **Files created:** 5

## Accomplishments
- 32 unit tests covering all mastery calculation edge cases (empty, all-correct, all-incorrect, mixed, decay, practice weighting)
- Exponential decay formula correctly weights recent answers more heavily (half-life: 14 days)
- Practice answers weighted at 0.7x vs test answers at 1.0x
- Weak area detection identifies categories below configurable threshold, sorted weakest-first
- Stale category detection uses category-to-questionId mapping for accurate association
- Milestone progression system (bronze 50%, silver 75%, gold 100%)
- Barrel export for clean imports from @/lib/mastery

## Task Commits

Each task was committed atomically (TDD pattern):

1. **RED: Failing tests** - `46e21c2` (test) - 32 failing tests for all mastery functions
2. **GREEN: Implementation** - `171793f` (feat) - All 32 tests pass
3. **REFACTOR: Cleanup** - `cd9426a` (refactor) - Extract constants, Set-based lookup, barrel export

## Files Created/Modified
- `src/lib/mastery/calculateMastery.ts` - Recency-weighted mastery calculation with exponential decay
- `src/lib/mastery/calculateMastery.test.ts` - 32 unit tests for calculation engine + weak area detection
- `src/lib/mastery/masteryStore.ts` - IndexedDB storage for answer history via idb-keyval
- `src/lib/mastery/weakAreaDetection.ts` - Weak area detection, stale categories, milestone progression
- `src/lib/mastery/index.ts` - Barrel export re-exporting all mastery module features

## Decisions Made
- **detectStaleCategories signature change:** Changed from `string[]` categoryIds to `Record<string, string[]>` mapping (categoryId -> questionIds) for accurate answer-to-category association. The original design couldn't match question IDs like 'GOV-P01' to category names like 'American Government'.
- **Exported weight constants:** `TEST_WEIGHT` (1.0) and `PRACTICE_WEIGHT` (0.7) exported as named constants so consumers can reference the exact multipliers.
- **Set-based lookup:** Used `Set` for questionId filtering in `calculateCategoryMastery` for O(1) lookups instead of Array.includes O(n).
- **Barrel export includes 04-01:** The index.ts re-exports `categoryMapping.ts` from 04-01, centralizing all mastery-related imports.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed detectStaleCategories signature to use categoryId->questionId mapping**
- **Found during:** GREEN phase (test failure analysis)
- **Issue:** The plan specified `detectStaleCategories(answerHistory, categories, staleDays)` with `categories` as a string array of category names. However, category names like 'American Government' cannot be matched to question IDs like 'GOV-P01' without a mapping.
- **Fix:** Changed `categories: string[]` to `categoryQuestionMap: Record<string, string[]>` which maps category IDs to their question IDs. Updated tests to use proper mapping objects.
- **Files modified:** `src/lib/mastery/weakAreaDetection.ts`, `src/lib/mastery/calculateMastery.test.ts`
- **Verification:** All 32 tests pass including stale category detection
- **Committed in:** `171793f` (GREEN phase commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Necessary for correct category-question association. The API is cleaner and more explicit. No scope creep.

## Issues Encountered
None - TDD cycle executed smoothly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Mastery calculation engine fully tested and ready for UI integration
- All functions exported via `@/lib/mastery` barrel export
- `recordAnswer` ready to be called from test/practice flows
- `calculateCategoryMastery` + `detectWeakAreas` ready for progress visualization
- `getNextMilestone` ready for gamification/nudge features
- No blockers for subsequent plans (04-03 through 04-09)

## Self-Check: PASSED

---
*Phase: 04-learning-explanations-category-progress*
*Completed: 2026-02-07*
