---
phase: 44-test-date-countdown-and-study-plan
plan: 02
subsystem: ui
tags: [react, tailwind, countdown, study-plan, nba, date-picker, bilingual]

requires:
  - phase: 44-test-date-countdown-and-study-plan (plan 01)
    provides: studyPlanEngine, useTestDate, useStudyPlan hooks, StudyPlanInput/DailyPlan types
provides:
  - TestDateCountdownCard component with urgency gradient, CountUp animation, date picker
  - StudyPlanCard component with daily activity breakdown and navigation
  - PostTestPrompt modal with Pass/Reschedule options
  - Dashboard wiring for countdown, study plan, and post-test flow
  - Settings page "Test Preparation" section with USCIS test date row
  - Progress Hub header countdown badge with urgency color
  - NBA engine test-date awareness preventing celebration when test imminent
affects: [dashboard, settings, hub, nba]

tech-stack:
  added: []
  patterns:
    - "Urgency gradient pattern: green (>21 days), amber (8-21), red (<=7) mirroring ReadinessHeroCard getTierGradient"
    - "Native <input type='date'> with showPicker() for date selection (zero new dependencies)"
    - "IIFE pattern in JSX for dynamic component extraction (PaceIcon from config record)"
    - "Test-date-aware NBA: isTestImminent flag overrides celebration states with actionable advice"

key-files:
  created:
    - src/components/dashboard/TestDateCountdownCard.tsx
    - src/components/dashboard/StudyPlanCard.tsx
    - src/components/dashboard/PostTestPrompt.tsx
  modified:
    - src/views/Dashboard.tsx
    - src/views/SettingsPage.tsx
    - src/views/HubPage.tsx
    - src/lib/nba/nbaTypes.ts
    - src/lib/nba/determineNBA.ts
    - src/hooks/useNextBestAction.ts

key-decisions:
  - "Native <input type='date'> for date picker -- zero new dependencies, works on all mobile browsers"
  - "IIFE pattern for dynamic Icon component extraction from PACE_CONFIG record (JSX doesn't support bracket notation)"
  - "NBA test-date awareness uses findWeakestCategory with 70% threshold (higher than normal 50%) when test imminent"
  - "PostTestPrompt isOpen gated by daysRemaining <= 0 AND postTestAction === 'pending'"
  - "Hub countdown uses inline UTC date math (same pattern as studyPlanEngine) for consistency"

patterns-established:
  - "Urgency gradient: getUrgencyGradient(daysRemaining) -> green/amber/red gradient classes"
  - "ActivityRow: tappable row with icon, bilingual label, ChevronRight, navigation onClick"
  - "Test-date-aware NBA: isTestImminent prevents celebration, pushes actionable advice"

requirements-completed: [RDNS-07, RDNS-08, RDNS-09, RDNS-10]

duration: 9min
completed: 2026-03-01
---

# Phase 44 Plan 02: UI Components and Integration Summary

**TestDateCountdownCard, StudyPlanCard, PostTestPrompt components wired into Dashboard, Settings, Hub, and NBA engine with urgency gradients and bilingual text**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-01T11:03:40Z
- **Completed:** 2026-03-01T11:13:00Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Three new dashboard components: countdown card (urgency gradient + CountUp + date picker + pace indicator), study plan card (activity list + estimated time + navigation), post-test prompt (modal with Pass/Reschedule)
- Dashboard integration: countdown and study plan cards after ReadinessHeroCard, post-test prompt modal
- Settings page: new "Test Preparation" section with native date picker
- Progress Hub: compact countdown badge in header with urgency coloring
- NBA engine: test-date-aware priority preventing celebration states when test within 7 days
- All UI bilingual (English + Burmese), all 426 tests passing, production build succeeds

## Task Commits

Each task was committed atomically:

1. **Task 1: Create countdown card, study plan card, and post-test prompt** - `2309280` (feat)
2. **Task 2: Wire cards into Dashboard, Settings, Hub, and NBA integration** - `814f156` (feat)

## Files Created/Modified
- `src/components/dashboard/TestDateCountdownCard.tsx` - Two-state card: "Set your test date" prompt or countdown with urgency gradient
- `src/components/dashboard/StudyPlanCard.tsx` - Daily activity list (SRS, new questions, drill, mock test) with navigation
- `src/components/dashboard/PostTestPrompt.tsx` - Post-test modal with Pass/Reschedule actions
- `src/views/Dashboard.tsx` - Wires countdown card, study plan card, and post-test prompt
- `src/views/SettingsPage.tsx` - Adds "Test Preparation" section with date picker
- `src/views/HubPage.tsx` - Compact countdown badge in page header
- `src/lib/nba/nbaTypes.ts` - Added testDate field to NBAInput
- `src/lib/nba/determineNBA.ts` - Test-date-aware celebration override logic
- `src/hooks/useNextBestAction.ts` - Passes testDate to NBA engine

## Decisions Made
- Used native `<input type="date">` for date picking (zero new dependencies, works on all mobile browsers)
- IIFE pattern for dynamic Icon component extraction from PACE_CONFIG record (JSX doesn't support bracket notation in tag position)
- NBA test-date awareness uses `findWeakestCategory` with raised 70% threshold when test is imminent (more aggressive than normal 50%)
- PostTestPrompt isOpen is gated by `daysRemaining <= 0 AND postTestAction === 'pending'` to prevent showing on every render
- Hub countdown badge uses inline UTC date math for consistency with studyPlanEngine

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Test date countdown and study plan features are complete and integrated
- NBA engine is test-date-aware
- All UI is bilingual and production-ready
- Ready for Phase 45

## Self-Check: PASSED

- All 9 files verified on disk
- Commit 2309280 (Task 1) verified in git history
- Commit 814f156 (Task 2) verified in git history

---
*Phase: 44-test-date-countdown-and-study-plan*
*Completed: 2026-03-01*
