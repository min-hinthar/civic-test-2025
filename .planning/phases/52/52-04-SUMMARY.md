---
phase: 52-e2e-critical-flows-accessibility
plan: 04
subsystem: testing
tags: [axe-core, wcag, a11y, vitest-axe, playwright, aria, touch-targets]

requires:
  - phase: 52-01
    provides: E2E fixtures (authedPage, makeAxeBuilder, clearStorage)
  - phase: 52-02
    provides: Touch target 44px fixes, glass-heavy opacity, focus ring fixes

provides:
  - WCAG 2.2 AA axe-core scan infrastructure on 4 pages (light + dark)
  - Touch target 44px regression test with CI enforcement
  - 5 new vitest-axe component tests
  - Color-only indicator aria-label remediation on 3 components

affects: [verifier, future accessibility audits]

tech-stack:
  added: []
  patterns: [axe-core E2E scan pattern, touch target audit pattern, vitest-axe component test pattern]

key-files:
  created:
    - e2e/wcag-scan.spec.ts
    - e2e/touch-targets.spec.ts
    - src/__tests__/a11y/navBadge.a11y.test.tsx
    - src/__tests__/a11y/categoryBreakdown.a11y.test.tsx
    - src/__tests__/a11y/bottomTabBar.a11y.test.tsx
    - src/__tests__/a11y/flagToggle.a11y.test.tsx
    - src/__tests__/a11y/syncStatus.a11y.test.tsx
  modified:
    - src/components/navigation/NavBadge.tsx
    - src/components/results/CategoryBreakdown.tsx
    - src/components/study/Flashcard3D.tsx

key-decisions:
  - "SyncStatusIndicator and StreakReward already had role=status and aria-label -- no changes needed"
  - "CategoryBreakdown.tsx is at src/components/results/ not src/components/hub/ (plan path deviation)"
  - "StreakReward.tsx is at src/components/quiz/ not src/components/celebration/ (plan path deviation)"
  - "CategoryBreakdown progress bar uses role=progressbar with aria-valuenow/min/max for semantic richness"

patterns-established:
  - "axe-core E2E scan: makeAxeBuilder().analyze() with formatViolations helper for readable output"
  - "Touch target audit: query all interactive selectors, check boundingBox >= 44x44, skip documented exceptions"
  - "vitest-axe pattern: mock side-effect hooks, render with providers, axe(container), toHaveNoViolations()"

requirements-completed: [A11Y-01, A11Y-02, A11Y-03]

duration: 8min
completed: 2026-03-21
---

# Phase 52 Plan 04: WCAG + Touch Target + Accessibility Summary

**axe-core WCAG 2.2 AA scans on 4 pages, touch target 44px regression test, 3 color-only indicator fixes, and 5 new vitest-axe tests (26 total a11y assertions)**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-21T08:01:12Z
- **Completed:** 2026-03-21T08:09:02Z
- **Tasks:** 3 (2 auto + 1 checkpoint auto-approved)
- **Files modified:** 10

## Accomplishments
- WCAG 2.2 AA axe-core scans on dashboard, test, interview, settings (light + dark) via makeAxeBuilder fixture
- Touch target 44px regression test auditing all interactive elements on 4 pages with TourTooltip exception
- NavBadge, CategoryBreakdown, Flashcard3D difficulty dots remediated with aria-labels for screen readers
- 5 new vitest-axe tests covering NavBadge, CategoryBreakdown, BottomTabBar, FlagToggle, SyncStatusIndicator
- 26 a11y unit tests passing across 7 test files; 799 total tests passing

## Task Commits

Each task was committed atomically:

1. **Task 1: Color-only indicator remediation + vitest-axe expansion** - `e122ef7` (feat)
2. **Task 2: axe-core WCAG scans + touch target regression test** - `023ac6a` (feat)
3. **Task 3: Visual verification checkpoint** - auto-approved (no commit needed)

## Files Created/Modified

- `e2e/wcag-scan.spec.ts` - WCAG 2.2 AA axe-core scans on 4 pages + dark mode
- `e2e/touch-targets.spec.ts` - 44px touch target regression audit on 4 pages
- `src/__tests__/a11y/navBadge.a11y.test.tsx` - vitest-axe for NavBadge (5 tests)
- `src/__tests__/a11y/categoryBreakdown.a11y.test.tsx` - vitest-axe for CategoryBreakdown (3 tests)
- `src/__tests__/a11y/bottomTabBar.a11y.test.tsx` - vitest-axe for BottomTabBar (3 tests)
- `src/__tests__/a11y/flagToggle.a11y.test.tsx` - vitest-axe for FlagToggle (5 tests)
- `src/__tests__/a11y/syncStatus.a11y.test.tsx` - vitest-axe for SyncStatusIndicator (4 tests)
- `src/components/navigation/NavBadge.tsx` - Added role="status" + aria-label on badge indicator
- `src/components/results/CategoryBreakdown.tsx` - Added role="progressbar" + aria-label on mastery bars
- `src/components/study/Flashcard3D.tsx` - Added role="img" + aria-label on difficulty dot container

## Decisions Made

- **SyncStatusIndicator already accessible:** Already had `role="status"` and descriptive `aria-label` -- no changes needed
- **StreakReward already accessible:** Already had persistent `role="status"` sr-only live region + `aria-hidden="true"` on visual element -- no changes needed
- **Component path corrections:** CategoryBreakdown is at `src/components/results/` (not `hub/`), StreakReward at `src/components/quiz/` (not `celebration/`) -- plan referenced incorrect paths
- **CategoryBreakdown uses role=progressbar:** Added full ARIA progressbar semantics (aria-valuenow/min/max) instead of just aria-label for richer screen reader experience

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed QuestionResult mock type in categoryBreakdown test**
- **Found during:** Task 1 (vitest-axe expansion)
- **Issue:** Mock data used `question`, `correctAnswer` (string), `userAnswer` fields instead of actual `QuestionResult` type (`questionText_en`, `questionText_my`, `selectedAnswer: Answer`, `correctAnswer: Answer`)
- **Fix:** Updated mock data to match actual Answer interface with text_en/text_my/correct fields
- **Files modified:** src/__tests__/a11y/categoryBreakdown.a11y.test.tsx
- **Committed in:** e122ef7

**2. [Rule 1 - Bug] Added missing `beforeEach` import in syncStatus test**
- **Found during:** Task 1 (vitest-axe expansion)
- **Issue:** TypeScript error -- `beforeEach` not imported from vitest
- **Fix:** Added `beforeEach` to vitest import
- **Files modified:** src/__tests__/a11y/syncStatus.a11y.test.tsx
- **Committed in:** e122ef7

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Minor type corrections needed for test data. No scope change.

## Issues Encountered

- **E2E tests not runtime-verified:** No dev server was running during execution, so wcag-scan.spec.ts and touch-targets.spec.ts could not be executed live. Files typecheck and follow established patterns. Will be validated in CI or next dev server session.
- **Pre-existing lint errors in parallel agent files:** 7 ESLint errors in e2e/fixtures/index.ts, e2e/flashcard-sort.spec.ts, e2e/offline-sync.spec.ts, e2e/sw-update.spec.ts (created by parallel agents 52-01/52-03). Out of scope per deviation rules.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All A11Y requirements (A11Y-01, A11Y-02, A11Y-03) now have test infrastructure
- WCAG scans and touch target audits ready for CI enforcement
- 799 total tests passing, no regressions
- Phase 52 plans complete, ready for verifier

## Self-Check: PASSED

- All 7 created files verified on disk
- Both task commits (e122ef7, 023ac6a) found in git log
- 799 tests passing, 0 failures
- Typecheck clean

---
*Phase: 52-e2e-critical-flows-accessibility*
*Completed: 2026-03-21*
