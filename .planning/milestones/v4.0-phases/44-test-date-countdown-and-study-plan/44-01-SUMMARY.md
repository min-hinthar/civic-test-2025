---
phase: 44-test-date-countdown-and-study-plan
plan: 01
subsystem: study-plan
tags: [study-plan, tdd, pure-function, localStorage, hooks, srs, pacing]

# Dependency graph
requires:
  - phase: 43-test-readiness-score-and-drill-mode
    provides: "readiness engine, useReadinessScore, useCategoryMastery, useSRSWidget hooks"
provides:
  - "computeStudyPlan pure function with daily targets, pace status, drill/mock recommendations"
  - "StudyPlanInput, DailyPlan, PaceStatus type definitions"
  - "useTestDate localStorage hook for test date persistence"
  - "useStudyPlan composition hook bridging 6 data sources to study plan engine"
affects: [44-02, dashboard, study-plan-ui]

# Tech tracking
tech-stack:
  added: []
  patterns: ["pure-function engine with injectable now for testing", "localStorage hook with SSR-safe lazy initializer", "composition hook aggregating 6+ data sources via useMemo"]

key-files:
  created:
    - src/lib/studyPlan/studyPlanTypes.ts
    - src/lib/studyPlan/studyPlanEngine.ts
    - src/lib/studyPlan/studyPlanEngine.test.ts
    - src/lib/studyPlan/index.ts
    - src/hooks/useTestDate.ts
    - src/hooks/useStudyPlan.ts
  modified: []

key-decisions:
  - "Drill recommendation count fixed at 10 (DRILL_MAX) per weakest category"
  - "Pace status uses approximate totalDays = max(daysRemaining+14, 30) since start date is not stored"
  - "No-date mode newQuestionTarget uses clamp(unpracticedCount, 3, 10) for default daily pacing"
  - "Weak categories derived from 3 main USCIS categories (not 7 sub-categories)"

patterns-established:
  - "StudyPlan engine: pure function with injectable now, zero React deps, same pattern as determineNBA"
  - "useTestDate: localStorage SSR-safe hook pattern with PostTestAction state machine"
  - "useStudyPlan: composition hook pattern bridging multiple data hooks into pure engine via useMemo"

requirements-completed: [RDNS-07, RDNS-09, RDNS-10]

# Metrics
duration: 7min
completed: 2026-03-01
---

# Phase 44 Plan 01: Study Plan Engine and Test Date Hooks Summary

**TDD pure-function study plan engine computing daily targets (SRS/new/drill/mock), pace status, and estimated minutes, with localStorage test date hook and 6-source composition hook**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-01T10:58:25Z
- **Completed:** 2026-03-01T11:05:01Z
- **Tasks:** 2 (Task 1 TDD: RED+GREEN, Task 2 hooks)
- **Files created:** 6

## Accomplishments
- Pure computeStudyPlan function with 27 passing unit tests covering all edge cases
- SRS review pass-through (capped at 20), new question distribution across remaining days (capped 3-15)
- Drill recommendation for weakest category below 50%, mock test recommendation when 3+ days since last
- Pace status calculation (ahead/on-track/behind) using readiness fraction vs time fraction
- useTestDate hook persisting test date in localStorage with SSR-safe initialization
- useStudyPlan composition hook aggregating readiness, SRS, category mastery, auth, and IndexedDB data

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Failing tests for study plan engine** - `b6250ba` (test)
2. **Task 1 GREEN: Implement study plan engine** - `7120280` (feat)
3. **Task 2: useTestDate and useStudyPlan hooks** - `ffe53a5` (feat)

_TDD task produced 2 commits (RED + GREEN). No refactor needed -- code was clean._

## Files Created/Modified
- `src/lib/studyPlan/studyPlanTypes.ts` - StudyPlanInput, DailyPlan, PaceStatus type definitions
- `src/lib/studyPlan/studyPlanEngine.ts` - Pure computeStudyPlan function with all logic
- `src/lib/studyPlan/studyPlanEngine.test.ts` - 27 unit tests covering all behaviors and edge cases
- `src/lib/studyPlan/index.ts` - Barrel export for studyPlan module
- `src/hooks/useTestDate.ts` - localStorage hook for test date persistence with PostTestAction
- `src/hooks/useStudyPlan.ts` - Composition hook bridging 6 data sources to computeStudyPlan

## Decisions Made
- Drill recommendation count fixed at 10 (DRILL_MAX) per weakest category -- simplifies the algorithm without degrading UX
- Pace status uses approximate totalDays = max(daysRemaining+14, 30) since start date is not stored -- conservative estimate
- No-date mode uses clamp(unpracticedCount, 3, 10) for default daily pacing -- reasonable default without test date pressure
- Weak categories derived from 3 main USCIS categories (not 7 sub-categories) -- matches readiness engine pattern

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Study plan engine and hooks ready for UI card consumption in Plan 02
- computeStudyPlan is pure and testable, useStudyPlan provides ready-to-render DailyPlan
- Test date flow supports pending/passed/rescheduled lifecycle

## Self-Check: PASSED

All 6 created files verified on disk. All 3 task commits verified in git log.

---
*Phase: 44-test-date-countdown-and-study-plan*
*Completed: 2026-03-01*
